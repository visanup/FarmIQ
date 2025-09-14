# app/services/fcr_calculator.py

from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
from dataclasses import dataclass
from sqlalchemy import text
from app.database import get_db
import logging

logger = logging.getLogger(__name__)

@dataclass
class FcrData:
    tenant_id: str
    house_id: str
    farm_id: Optional[str]
    period_start: datetime
    period_end: datetime
    total_feed_consumed_kg: float
    total_weight_gain_kg: float
    fcr_ratio: float
    animal_count: Optional[int]
    avg_daily_fcr: Optional[float]
    weight_source: str
    scale_weight_gain_kg: Optional[float]
    predict_weight_gain_kg: Optional[float]

@dataclass
class FCRCalculationParams:
    tenant_id: str
    house_id: str
    farm_id: Optional[str]
    start_date: datetime
    end_date: datetime
    animal_count: Optional[int]
    weight_source: str = 'both'

class FCRCalculator:
    """FCR (Feed Conversion Ratio) Calculator"""
    
    @staticmethod
    def calculate_fcr(params: FCRCalculationParams) -> Optional[FcrData]:
        """Calculate FCR for specified period"""
        try:
            # 1. Get feed consumption data
            feed_data = FCRCalculator._get_feed_consumption_data(params)
            if not feed_data:
                logger.warning(f"No feed consumption data found for {params}")
                return None

            # 2. Get weight data based on source
            weight_data = FCRCalculator._get_animal_weight_data(params)
            if not weight_data or weight_data['weight_gain_kg'] <= 0:
                logger.warning(f"No valid weight gain data found for {params}")
                return None

            # 3. Calculate FCR
            total_feed_consumed_kg = feed_data['total_feed_kg']
            total_weight_gain_kg = weight_data['weight_gain_kg']
            fcr_ratio = total_feed_consumed_kg / total_weight_gain_kg
            avg_daily_fcr = fcr_ratio / params.animal_count if params.animal_count else None

            result = FcrData(
                tenant_id=params.tenant_id,
                house_id=params.house_id,
                farm_id=params.farm_id,
                period_start=params.start_date,
                period_end=params.end_date,
                total_feed_consumed_kg=total_feed_consumed_kg,
                total_weight_gain_kg=total_weight_gain_kg,
                fcr_ratio=fcr_ratio,
                animal_count=params.animal_count,
                avg_daily_fcr=avg_daily_fcr,
                weight_source=params.weight_source,
                scale_weight_gain_kg=weight_data.get('scale_weight_gain_kg'),
                predict_weight_gain_kg=weight_data.get('predict_weight_gain_kg')
            )

            logger.info(f"FCR calculation completed: {result}")
            return result

        except Exception as error:
            logger.error(f"FCR calculation failed: {error}")
            raise

    @staticmethod
    def _get_feed_consumption_data(params: FCRCalculationParams, db_session=None) -> Optional[Dict[str, Any]]:
        """Get feed consumption data from database"""
        if db_session:
            session = db_session
        else:
            from app.database import SessionLocal
            session = SessionLocal()
        
        try:
            query = text("""
                SELECT 
                    SUM(value_sum) as total_feed_kg,
                    COUNT(*) as data_points
                FROM analytics.minute_features
                WHERE tenant_id = :tenant_id
                  AND device_id = :house_id
                  AND bucket >= :start_date
                  AND bucket <= :end_date
                  AND (metric = 'feed.batch.mass_kg' 
                       OR metric = 'feed.consumption.kg' 
                       OR metric = 'feed.intake.kg'
                       OR metric = 'feed.daily.kg'
                       OR metric = 'sensors.feed.weight'
                       OR metric = 'sensors.feed.mass')
            """)
            
            if params.farm_id:
                query = text("""
                    SELECT 
                        SUM(value_sum) as total_feed_kg,
                        COUNT(*) as data_points
                    FROM analytics.minute_features
                    WHERE tenant_id = :tenant_id
                      AND device_id = :house_id
                      AND bucket >= :start_date
                      AND bucket <= :end_date
                      AND (metric = 'feed.batch.mass_kg' 
                           OR metric = 'feed.consumption.kg' 
                           OR metric = 'feed.intake.kg'
                           OR metric = 'feed.daily.kg'
                           OR metric = 'sensors.feed.weight'
                           OR metric = 'sensors.feed.mass')
                      AND tags->>'farm_id' = :farm_id
                """)

            result = session.execute(query, {
                'tenant_id': params.tenant_id,
                'house_id': params.house_id,
                'start_date': params.start_date,
                'end_date': params.end_date,
                'farm_id': params.farm_id
            })
            
            data = result.fetchone()
            logger.info(f"Feed consumption data query result: {data}")
            
            return {
                'total_feed_kg': float(data.total_feed_kg),
                'data_points': int(data.data_points)
            } if data and data.total_feed_kg else None
        finally:
            if not db_session:
                session.close()

    @staticmethod
    def _get_animal_weight_data(params: FCRCalculationParams, db_session=None) -> Optional[Dict[str, Any]]:
        """Get animal weight data from database"""
        if db_session:
            session = db_session
        else:
            from app.database import SessionLocal
            session = SessionLocal()
        
        try:
            # Build metric filter based on weight source
            if params.weight_source == 'scale':
                metric_filter = "metric LIKE 'sensors.weight_scale.%'"
            elif params.weight_source == 'predict':
                metric_filter = "metric LIKE 'sensors.weight_predict.%'"
            else:  # both
                metric_filter = "(metric LIKE 'sensors.weight_scale.%' OR metric LIKE 'sensors.weight_predict.%')"

            query = text(f"""
                SELECT 
                    MIN(value_min) as initial_weight_kg,
                    MAX(value_max) as final_weight_kg,
                    AVG(value_sum / value_count) as avg_weight_kg,
                    COUNT(*) as data_points
                FROM analytics.minute_features
                WHERE tenant_id = :tenant_id
                  AND device_id = :house_id
                  AND bucket >= :start_date
                  AND bucket <= :end_date
                  AND {metric_filter}
            """)
            
            if params.farm_id:
                query = text(f"""
                    SELECT 
                        MIN(value_min) as initial_weight_kg,
                        MAX(value_max) as final_weight_kg,
                        AVG(value_sum / value_count) as avg_weight_kg,
                        COUNT(*) as data_points
                    FROM analytics.minute_features
                    WHERE tenant_id = :tenant_id
                      AND device_id = :house_id
                      AND bucket >= :start_date
                      AND bucket <= :end_date
                      AND {metric_filter}
                      AND tags->>'farm_id' = :farm_id
                """)

            result = session.execute(query, {
                'tenant_id': params.tenant_id,
                'house_id': params.house_id,
                'start_date': params.start_date,
                'end_date': params.end_date,
                'farm_id': params.farm_id
            })
            
            data = result.fetchone()
            logger.info(f"Animal weight data query result: {data}")
            
            if not data or not data.initial_weight_kg or not data.final_weight_kg:
                return None

            weight_gain_kg = float(data.final_weight_kg) - float(data.initial_weight_kg)
            
            return {
                'initial_weight_kg': float(data.initial_weight_kg),
                'final_weight_kg': float(data.final_weight_kg),
                'weight_gain_kg': weight_gain_kg,
                'avg_weight_kg': float(data.avg_weight_kg),
                'data_points': int(data.data_points)
            }
        finally:
            if not db_session:
                session.close()

    @staticmethod
    def calculate_daily_fcr(params: FCRCalculationParams) -> List[FcrData]:
        """Calculate daily FCR for specified period"""
        results = []
        
        current_date = params.start_date
        while current_date <= params.end_date:
            day_start = current_date.replace(hour=0, minute=0, second=0, microsecond=0)
            day_end = current_date.replace(hour=23, minute=59, second=59, microsecond=999999)
            
            daily_params = FCRCalculationParams(
                tenant_id=params.tenant_id,
                house_id=params.house_id,
                farm_id=params.farm_id,
                start_date=day_start,
                end_date=day_end,
                animal_count=params.animal_count,
                weight_source=params.weight_source
            )
            
            daily_fcr = FCRCalculator.calculate_fcr(daily_params)
            if daily_fcr:
                results.append(daily_fcr)
            
            current_date += timedelta(days=1)
        
        return results

    @staticmethod
    def calculate_weekly_fcr(params: FCRCalculationParams) -> List[FcrData]:
        """Calculate weekly FCR for specified period"""
        results = []
        
        current_date = params.start_date
        while current_date <= params.end_date:
            week_start = current_date
            week_end = current_date + timedelta(days=6)
            week_end = week_end.replace(hour=23, minute=59, second=59, microsecond=999999)
            
            if week_end > params.end_date:
                week_end = params.end_date
            
            weekly_params = FCRCalculationParams(
                tenant_id=params.tenant_id,
                house_id=params.house_id,
                farm_id=params.farm_id,
                start_date=week_start,
                end_date=week_end,
                animal_count=params.animal_count,
                weight_source=params.weight_source
            )
            
            weekly_fcr = FCRCalculator.calculate_fcr(weekly_params)
            if weekly_fcr:
                results.append(weekly_fcr)
            
            current_date += timedelta(days=7)
        
        return results
