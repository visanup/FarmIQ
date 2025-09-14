# app/services/size_distribution.py

from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
from dataclasses import dataclass
from sqlalchemy import text
from app.database import SessionLocal
import statistics
import logging

logger = logging.getLogger(__name__)

@dataclass
class SizeDistributionData:
    tenant_id: str
    house_id: str
    farm_id: Optional[str]
    measurement_date: datetime
    total_animals: int
    mean_weight_kg: float
    median_weight_kg: float
    std_deviation_kg: float
    variance_kg: float
    min_weight_kg: float
    max_weight_kg: float
    range_kg: float
    coefficient_of_variation: float
    weight_categories: List[Dict[str, Any]]
    quartiles: Dict[str, float]

@dataclass
class SizeDistributionParams:
    tenant_id: str
    house_id: str
    farm_id: Optional[str]
    measurement_date: datetime
    weight_source: str = 'predict'

class SizeDistributionCalculator:
    """Size Distribution Calculator for animal weights"""
    
    @staticmethod
    def calculate_size_distribution(params: SizeDistributionParams) -> Optional[SizeDistributionData]:
        """Calculate size distribution for specified date"""
        try:
            # Get individual weights
            individual_weights = SizeDistributionCalculator._get_individual_weights(params)
            if not individual_weights:
                logger.warning(f"No individual weight data found for {params}")
                return None

            # Calculate basic statistics
            weights = [w['weight_kg'] for w in individual_weights]
            stats = SizeDistributionCalculator._calculate_basic_statistics(weights)

            # Calculate quartiles
            quartiles = SizeDistributionCalculator._calculate_quartiles(weights)

            # Calculate weight categories
            categories = SizeDistributionCalculator._calculate_weight_categories(weights)

            result = SizeDistributionData(
                tenant_id=params.tenant_id,
                house_id=params.house_id,
                farm_id=params.farm_id,
                measurement_date=params.measurement_date,
                total_animals=len(individual_weights),
                mean_weight_kg=stats['mean'],
                median_weight_kg=stats['median'],
                std_deviation_kg=stats['std_deviation'],
                variance_kg=stats['variance'],
                min_weight_kg=stats['min'],
                max_weight_kg=stats['max'],
                range_kg=stats['range'],
                coefficient_of_variation=stats['coefficient_of_variation'],
                weight_categories=categories,
                quartiles=quartiles
            )

            logger.info(f"Size distribution calculation completed: {result}")
            return result

        except Exception as error:
            logger.error(f"Size distribution calculation failed: {error}")
            raise

    @staticmethod
    def _get_individual_weights(params: SizeDistributionParams, db_session=None) -> List[Dict[str, Any]]:
        """Get individual animal weights from database"""
        if db_session:
            session = db_session
        else:
            session = SessionLocal()
        
        try:
            start_of_day = params.measurement_date.replace(hour=0, minute=0, second=0, microsecond=0)
            end_of_day = params.measurement_date.replace(hour=23, minute=59, second=59, microsecond=999999)

            metric = 'sensors.weight_predict.individual' if params.weight_source == 'predict' else 'sensors.weight_scale.individual'

            query = text("""
                SELECT 
                    value_sum as weight_kg,
                    tags->>'animal_id' as animal_id,
                    bucket as measurement_time
                FROM analytics.minute_features
                WHERE tenant_id = :tenant_id
                  AND device_id = :house_id
                  AND bucket >= :start_of_day
                  AND bucket <= :end_of_day
                  AND metric = :metric
                ORDER BY measurement_time DESC
            """)
            
            if params.farm_id:
                query = text("""
                    SELECT 
                        value_sum as weight_kg,
                        tags->>'animal_id' as animal_id,
                        bucket as measurement_time
                    FROM analytics.minute_features
                    WHERE tenant_id = :tenant_id
                      AND device_id = :house_id
                      AND bucket >= :start_of_day
                      AND bucket <= :end_of_day
                      AND metric = :metric
                      AND tags->>'farm_id' = :farm_id
                    ORDER BY measurement_time DESC
                """)

            result = session.execute(query, {
                'tenant_id': params.tenant_id,
                'house_id': params.house_id,
                'start_of_day': start_of_day,
                'end_of_day': end_of_day,
                'metric': metric,
                'farm_id': params.farm_id
            })
            
            return [
                {
                    'weight_kg': float(row.weight_kg),
                    'animal_id': row.animal_id,
                    'measurement_time': row.measurement_time
                }
                for row in result.fetchall()
            ]
        finally:
            if not db_session:
                session.close()

    @staticmethod
    def _calculate_basic_statistics(weights: List[float]) -> Dict[str, float]:
        """Calculate basic statistics from weight data"""
        if not weights:
            return {}
        
        sorted_weights = sorted(weights)
        n = len(weights)
        
        # Mean
        mean = statistics.mean(weights)
        
        # Median
        median = statistics.median(weights)
        
        # Variance and Standard Deviation
        variance = statistics.variance(weights) if n > 1 else 0
        std_deviation = statistics.stdev(weights) if n > 1 else 0
        
        # Min, Max, Range
        min_weight = min(weights)
        max_weight = max(weights)
        range_weight = max_weight - min_weight
        
        # Coefficient of Variation
        coefficient_of_variation = std_deviation / mean if mean > 0 else 0

        return {
            'mean': mean,
            'median': median,
            'variance': variance,
            'std_deviation': std_deviation,
            'min': min_weight,
            'max': max_weight,
            'range': range_weight,
            'coefficient_of_variation': coefficient_of_variation
        }

    @staticmethod
    def _calculate_quartiles(weights: List[float]) -> Dict[str, float]:
        """Calculate quartiles from weight data"""
        if not weights:
            return {}
        
        sorted_weights = sorted(weights)
        
        q1 = SizeDistributionCalculator._get_percentile(sorted_weights, 25)
        q2 = SizeDistributionCalculator._get_percentile(sorted_weights, 50)
        q3 = SizeDistributionCalculator._get_percentile(sorted_weights, 75)
        iqr = q3 - q1

        return {
            'q1_kg': q1,
            'q2_kg': q2,
            'q3_kg': q3,
            'iqr_kg': iqr
        }

    @staticmethod
    def _get_percentile(sorted_data: List[float], percentile: float) -> float:
        """Calculate percentile from sorted data"""
        if not sorted_data:
            return 0
        
        index = (percentile / 100) * (len(sorted_data) - 1)
        lower = int(index)
        upper = min(lower + 1, len(sorted_data) - 1)
        weight = index - lower

        if upper >= len(sorted_data):
            return sorted_data[-1]
        
        return sorted_data[lower] * (1 - weight) + sorted_data[upper] * weight

    @staticmethod
    def _calculate_weight_categories(weights: List[float]) -> List[Dict[str, Any]]:
        """Calculate weight categories"""
        if not weights:
            return []
        
        sorted_weights = sorted(weights)
        min_weight = min(weights)
        max_weight = max(weights)
        range_weight = max_weight - min_weight
        
        # Divide into 5 categories
        categories = [
            {'name': 'Very Small', 'min': min_weight, 'max': min_weight + range_weight * 0.2},
            {'name': 'Small', 'min': min_weight + range_weight * 0.2, 'max': min_weight + range_weight * 0.4},
            {'name': 'Medium', 'min': min_weight + range_weight * 0.4, 'max': min_weight + range_weight * 0.6},
            {'name': 'Large', 'min': min_weight + range_weight * 0.6, 'max': min_weight + range_weight * 0.8},
            {'name': 'Very Large', 'min': min_weight + range_weight * 0.8, 'max': max_weight}
        ]

        result = []
        for cat in categories:
            in_category = [w for w in weights if cat['min'] <= w < cat['max']]
            count = len(in_category)
            percentage = (count / len(weights)) * 100 if weights else 0
            avg_weight = statistics.mean(in_category) if in_category else 0

            result.append({
                'category': cat['name'],
                'count': count,
                'percentage': round(percentage, 2),
                'avg_weight_kg': round(avg_weight, 2)
            })

        return result

    @staticmethod
    def calculate_weekly_size_distribution(params: SizeDistributionParams) -> List[SizeDistributionData]:
        """Calculate weekly size distribution"""
        results = []
        
        # Calculate size distribution for 7 days
        for i in range(7):
            date = params.measurement_date - timedelta(days=i)
            
            daily_params = SizeDistributionParams(
                tenant_id=params.tenant_id,
                house_id=params.house_id,
                farm_id=params.farm_id,
                measurement_date=date,
                weight_source=params.weight_source
            )
            
            daily_distribution = SizeDistributionCalculator.calculate_size_distribution(daily_params)
            if daily_distribution:
                results.append(daily_distribution)
        
        return list(reversed(results))  # Return from oldest to newest

    @staticmethod
    def compare_weight_sources(params: SizeDistributionParams) -> Dict[str, Any]:
        """Compare scale vs predict weight sources"""
        scale_params = SizeDistributionParams(
            tenant_id=params.tenant_id,
            house_id=params.house_id,
            farm_id=params.farm_id,
            measurement_date=params.measurement_date,
            weight_source='scale'
        )
        
        predict_params = SizeDistributionParams(
            tenant_id=params.tenant_id,
            house_id=params.house_id,
            farm_id=params.farm_id,
            measurement_date=params.measurement_date,
            weight_source='predict'
        )
        
        scale_data = SizeDistributionCalculator.calculate_size_distribution(scale_params)
        predict_data = SizeDistributionCalculator.calculate_size_distribution(predict_params)
        
        comparison = None
        if scale_data and predict_data:
            mean_diff = predict_data.mean_weight_kg - scale_data.mean_weight_kg
            std_dev_diff = predict_data.std_deviation_kg - scale_data.std_deviation_kg
            
            # Calculate correlation coefficient (simplified)
            correlation = SizeDistributionCalculator._calculate_correlation(scale_data, predict_data)
            
            comparison = {
                'mean_difference_kg': round(mean_diff, 2),
                'std_dev_difference_kg': round(std_dev_diff, 2),
                'correlation_coefficient': round(correlation, 3)
            }
        
        return {
            'scale_data': scale_data,
            'predict_data': predict_data,
            'comparison': comparison
        }

    @staticmethod
    def _calculate_correlation(scale_data: SizeDistributionData, predict_data: SizeDistributionData) -> float:
        """Calculate correlation coefficient between scale and predict data"""
        # Simplified correlation based on quartiles
        scale_quartiles = [scale_data.quartiles['q1_kg'], scale_data.quartiles['q2_kg'], scale_data.quartiles['q3_kg']]
        predict_quartiles = [predict_data.quartiles['q1_kg'], predict_data.quartiles['q2_kg'], predict_data.quartiles['q3_kg']]
        
        n = len(scale_quartiles)
        scale_mean = statistics.mean(scale_quartiles)
        predict_mean = statistics.mean(predict_quartiles)
        
        numerator = 0
        scale_sum_sq = 0
        predict_sum_sq = 0
        
        for i in range(n):
            scale_diff = scale_quartiles[i] - scale_mean
            predict_diff = predict_quartiles[i] - predict_mean
            
            numerator += scale_diff * predict_diff
            scale_sum_sq += scale_diff * scale_diff
            predict_sum_sq += predict_diff * predict_diff
        
        denominator = (scale_sum_sq * predict_sum_sq) ** 0.5
        return numerator / denominator if denominator > 0 else 0
