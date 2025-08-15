// 6. index.ts (aggregate all analytics routes)
import { Router } from 'express';
import { TsEventRouter } from './TsEvent.route';
import { FeatureStoreRouter } from './FeatureStore.route';
import { ModelResultRouter } from './ModelResult.route';
import { DataQualityLogRouter } from './DataQualityLog.route';
import { PipelineMetadataRouter } from './PipelineMetadata.route';

export const AnalyticsRouter = Router();

AnalyticsRouter.use('/ts-events', TsEventRouter);
AnalyticsRouter.use('/features', FeatureStoreRouter);
AnalyticsRouter.use('/results', ModelResultRouter);
AnalyticsRouter.use('/dq-logs', DataQualityLogRouter);
AnalyticsRouter.use('/pipelines', PipelineMetadataRouter);

