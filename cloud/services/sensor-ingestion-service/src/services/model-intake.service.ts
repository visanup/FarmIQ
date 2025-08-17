// src/services/model-intake.service.ts
import axios from 'axios';
import { AppDataSource } from '../utils/dataSource';
import { ModelRegistry } from '../models/ModelRegistry';
import { publish } from '../utils/mqtt';
import { INFERENCE_BASE_URL } from '../configs/config';

export async function registerAndDeployModel(p: {
  model_name: string;
  version: string;
  artifact_s3: string;
  metrics?: Record<string, any>;
  auto_deploy?: boolean;
}) {
  const repo = AppDataSource.getRepository(ModelRegistry);

  const rec = repo.create({
    model_name: p.model_name,
    version: p.version,
    artifact_s3: p.artifact_s3,
    metrics_json: p.metrics ?? {},
    is_active: false
  });
  await repo.save(rec);

  if (p.auto_deploy !== false) {
    await axios.post(`${INFERENCE_BASE_URL}/models/deploy`, {
      model_name: p.model_name,
      version: p.version,
      artifact_s3: p.artifact_s3
    }, { timeout: 30000 });

    // set active
    await repo.update({ model_name: p.model_name }, { is_active: false });
    await repo.update({ model_name: p.model_name, version: p.version }, { is_active: true });

    publish('edge/model/deploy.done', { model_name: p.model_name, version: p.version });
  }

  return { id: rec.id, model_name: rec.model_name, version: rec.version };
}
