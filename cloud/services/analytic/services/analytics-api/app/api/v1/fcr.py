# app/api/v1/fcr.py

from fastapi import APIRouter, HTTPException, Query, Depends
from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field
from app.services.fcr_calculator import FCRCalculator, FCRCalculationParams, FcrData
from app.services.size_distribution import SizeDistributionCalculator, SizeDistributionParams, SizeDistributionData
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

# Pydantic models for request/response
class FCRRequest(BaseModel):
    tenant_id: str = Field(..., description="Tenant identifier")
    house_id: str = Field(..., description="House identifier")
    farm_id: Optional[str] = Field(None, description="Farm identifier")
    start_date: datetime = Field(..., description="Start date")
    end_date: datetime = Field(..., description="End date")
    animal_count: Optional[int] = Field(None, description="Number of animals")
    weight_source: str = Field("both", description="Weight source: scale, predict, or both")

class FCRResponse(BaseModel):
    success: bool
    data: Optional[FcrData]
    period: str
    query: dict

class SizeDistributionRequest(BaseModel):
    tenant_id: str = Field(..., description="Tenant identifier")
    house_id: str = Field(..., description="House identifier")
    farm_id: Optional[str] = Field(None, description="Farm identifier")
    measurement_date: datetime = Field(..., description="Measurement date")
    weight_source: str = Field("predict", description="Weight source: scale or predict")

class SizeDistributionResponse(BaseModel):
    success: bool
    data: Optional[SizeDistributionData]
    query: dict

class SizeDistributionListResponse(BaseModel):
    success: bool
    data: List[SizeDistributionData]
    query: dict

class WeightSourceComparisonResponse(BaseModel):
    success: bool
    data: dict
    query: dict

# FCR Endpoints
@router.get("/fcr", response_model=FCRResponse)
async def calculate_fcr(
    tenant_id: str = Query(..., description="Tenant identifier"),
    house_id: str = Query(..., description="House identifier"),
    farm_id: Optional[str] = Query(None, description="Farm identifier"),
    start_date: datetime = Query(..., description="Start date"),
    end_date: datetime = Query(..., description="End date"),
    animal_count: Optional[int] = Query(None, description="Number of animals"),
    period: str = Query("total", description="Period: daily, weekly, or total"),
    weight_source: str = Query("both", description="Weight source: scale, predict, or both")
):
    """Calculate FCR (Feed Conversion Ratio) for specified period"""
    try:
        params = FCRCalculationParams(
            tenant_id=tenant_id,
            house_id=house_id,
            farm_id=farm_id,
            start_date=start_date,
            end_date=end_date,
            animal_count=animal_count,
            weight_source=weight_source
        )
        
        if period == "daily":
            result = FCRCalculator.calculate_daily_fcr(params)
            return FCRResponse(
                success=True,
                data=result[0] if result else None,
                period=period,
                query=params.__dict__
            )
        elif period == "weekly":
            result = FCRCalculator.calculate_weekly_fcr(params)
            return FCRResponse(
                success=True,
                data=result[0] if result else None,
                period=period,
                query=params.__dict__
            )
        else:  # total
            result = FCRCalculator.calculate_fcr(params)
            return FCRResponse(
                success=True,
                data=result,
                period=period,
                query=params.__dict__
            )
            
    except Exception as error:
        logger.error(f"FCR calculation error: {error}")
        raise HTTPException(status_code=500, detail="Failed to calculate FCR")

@router.get("/fcr/daily", response_model=SizeDistributionListResponse)
async def calculate_daily_fcr(
    tenant_id: str = Query(..., description="Tenant identifier"),
    house_id: str = Query(..., description="House identifier"),
    farm_id: Optional[str] = Query(None, description="Farm identifier"),
    start_date: datetime = Query(..., description="Start date"),
    end_date: datetime = Query(..., description="End date"),
    animal_count: Optional[int] = Query(None, description="Number of animals"),
    weight_source: str = Query("both", description="Weight source: scale, predict, or both")
):
    """Calculate daily FCR for specified period"""
    try:
        params = FCRCalculationParams(
            tenant_id=tenant_id,
            house_id=house_id,
            farm_id=farm_id,
            start_date=start_date,
            end_date=end_date,
            animal_count=animal_count,
            weight_source=weight_source
        )
        
        result = FCRCalculator.calculate_daily_fcr(params)
        return SizeDistributionListResponse(
            success=True,
            data=result,
            query=params.__dict__
        )
        
    except Exception as error:
        logger.error(f"Daily FCR calculation error: {error}")
        raise HTTPException(status_code=500, detail="Failed to calculate daily FCR")

@router.get("/fcr/weekly", response_model=SizeDistributionListResponse)
async def calculate_weekly_fcr(
    tenant_id: str = Query(..., description="Tenant identifier"),
    house_id: str = Query(..., description="House identifier"),
    farm_id: Optional[str] = Query(None, description="Farm identifier"),
    start_date: datetime = Query(..., description="Start date"),
    end_date: datetime = Query(..., description="End date"),
    animal_count: Optional[int] = Query(None, description="Number of animals"),
    weight_source: str = Query("both", description="Weight source: scale, predict, or both")
):
    """Calculate weekly FCR for specified period"""
    try:
        params = FCRCalculationParams(
            tenant_id=tenant_id,
            house_id=house_id,
            farm_id=farm_id,
            start_date=start_date,
            end_date=end_date,
            animal_count=animal_count,
            weight_source=weight_source
        )
        
        result = FCRCalculator.calculate_weekly_fcr(params)
        return SizeDistributionListResponse(
            success=True,
            data=result,
            query=params.__dict__
        )
        
    except Exception as error:
        logger.error(f"Weekly FCR calculation error: {error}")
        raise HTTPException(status_code=500, detail="Failed to calculate weekly FCR")

# Size Distribution Endpoints
@router.get("/size-distribution", response_model=SizeDistributionResponse)
async def calculate_size_distribution(
    tenant_id: str = Query(..., description="Tenant identifier"),
    house_id: str = Query(..., description="House identifier"),
    farm_id: Optional[str] = Query(None, description="Farm identifier"),
    measurement_date: datetime = Query(..., description="Measurement date"),
    weight_source: str = Query("predict", description="Weight source: scale or predict")
):
    """Calculate size distribution for specified date"""
    try:
        params = SizeDistributionParams(
            tenant_id=tenant_id,
            house_id=house_id,
            farm_id=farm_id,
            measurement_date=measurement_date,
            weight_source=weight_source
        )
        
        result = SizeDistributionCalculator.calculate_size_distribution(params)
        
        if not result:
            raise HTTPException(status_code=404, detail="No data found for size distribution calculation")
        
        return SizeDistributionResponse(
            success=True,
            data=result,
            query=params.__dict__
        )
        
    except HTTPException:
        raise
    except Exception as error:
        logger.error(f"Size distribution calculation error: {error}")
        raise HTTPException(status_code=500, detail="Failed to calculate size distribution")

@router.get("/size-distribution/weekly", response_model=SizeDistributionListResponse)
async def calculate_weekly_size_distribution(
    tenant_id: str = Query(..., description="Tenant identifier"),
    house_id: str = Query(..., description="House identifier"),
    farm_id: Optional[str] = Query(None, description="Farm identifier"),
    measurement_date: datetime = Query(..., description="Measurement date"),
    weight_source: str = Query("predict", description="Weight source: scale or predict")
):
    """Calculate weekly size distribution"""
    try:
        params = SizeDistributionParams(
            tenant_id=tenant_id,
            house_id=house_id,
            farm_id=farm_id,
            measurement_date=measurement_date,
            weight_source=weight_source
        )
        
        result = SizeDistributionCalculator.calculate_weekly_size_distribution(params)
        
        if not result:
            raise HTTPException(status_code=404, detail="No data found for weekly size distribution calculation")
        
        return SizeDistributionListResponse(
            success=True,
            data=result,
            query=params.__dict__
        )
        
    except HTTPException:
        raise
    except Exception as error:
        logger.error(f"Weekly size distribution calculation error: {error}")
        raise HTTPException(status_code=500, detail="Failed to calculate weekly size distribution")

@router.get("/size-distribution/compare", response_model=WeightSourceComparisonResponse)
async def compare_weight_sources(
    tenant_id: str = Query(..., description="Tenant identifier"),
    house_id: str = Query(..., description="House identifier"),
    farm_id: Optional[str] = Query(None, description="Farm identifier"),
    measurement_date: datetime = Query(..., description="Measurement date")
):
    """Compare scale vs predict weight sources"""
    try:
        params = SizeDistributionParams(
            tenant_id=tenant_id,
            house_id=house_id,
            farm_id=farm_id,
            measurement_date=measurement_date,
            weight_source='predict'  # Will be overridden in comparison
        )
        
        result = SizeDistributionCalculator.compare_weight_sources(params)
        
        if not result['scale_data'] and not result['predict_data']:
            raise HTTPException(status_code=404, detail="No data found for weight source comparison")
        
        return WeightSourceComparisonResponse(
            success=True,
            data=result,
            query={
                'tenant_id': tenant_id,
                'house_id': house_id,
                'farm_id': farm_id,
                'measurement_date': measurement_date
            }
        )
        
    except HTTPException:
        raise
    except Exception as error:
        logger.error(f"Weight source comparison error: {error}")
        raise HTTPException(status_code=500, detail="Failed to compare weight sources")

# Metrics endpoint
@router.get("/fcr/metrics")
async def get_fcr_metrics(
    tenant_id: str = Query(..., description="Tenant identifier"),
    house_id: str = Query(..., description="House identifier"),
    farm_id: Optional[str] = Query(None, description="Farm identifier")
):
    """Get available metrics for FCR calculation"""
    try:
        # This would query the database for available metrics
        # For now, return the expected metrics
        return {
            "success": True,
            "data": {
                "feed_metrics": [
                    "feed.batch.mass_kg",
                    "feed.consumption.kg",
                    "feed.intake.kg",
                    "feed.daily.kg",
                    "sensors.feed.weight",
                    "sensors.feed.mass"
                ],
                "weight_metrics": [
                    "sensors.weight_scale.total",
                    "sensors.weight_scale.individual",
                    "sensors.weight_predict.total",
                    "sensors.weight_predict.individual",
                    "animal.weight.total",
                    "animal.weight.avg",
                    "flock.weight.total",
                    "flock.weight.sum"
                ]
            },
            "query": {
                "tenant_id": tenant_id,
                "house_id": house_id,
                "farm_id": farm_id
            }
        }
        
    except Exception as error:
        logger.error(f"FCR metrics error: {error}")
        raise HTTPException(status_code=500, detail="Failed to get FCR metrics")
