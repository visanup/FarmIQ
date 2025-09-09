// src/pipelines/__init__.ts
import { registerAlertRule } from './registry';
import { handleAnalyticsFeature } from './map/analyticsFeature';
import { handleAnomaly } from './map/anomaly';
import { handleKPI } from './map/kpi';

/**
 * Initialize the alert rule registry with all available handlers
 */
export const initRegistry = () => {
  // Register analytics feature alert rule
  registerAlertRule(
    'analytics.features',
    handleAnalyticsFeature,
    'analytics'
  );
  
  // Register anomaly alert rule
  registerAlertRule(
    'analytics.anomalies',
    handleAnomaly,
    'analytics'
  );
  
  // Register KPI alert rule
  registerAlertRule(
    'analytics.kpi',
    handleKPI,
    'analytics'
  );
  
  console.log('✅ Alert rule registry initialized');
};