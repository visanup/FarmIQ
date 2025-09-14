// src/services/model-intake.service.ts
import axios from 'axios';
import { prisma } from '../utils/prisma';
import { publish } from '../utils/mqtt';
import { INFERENCE_BASE_URL } from '../configs/config';

export async function registerAndDeployModel(p: {
  model_name: string;
  version: string;
  artifact_s3: string;
  metrics?: Record<string, any>;
  auto_deploy?: boolean;
}) {
  const recRows = await (prisma.$queryRawUnsafe(
    `INSERT INTO sensors.model_registry(model_name,version,artifact_s3,metrics_json,is_active)
     VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    p.model_name, p.version, p.artifact_s3, p.metrics ?? {}, false
  ) as Promise<any[]>);
  const rec = recRows[0];

  if (p.auto_deploy !== false) {
    await axios.post(`${INFERENCE_BASE_URL}/models/deploy`, {
      model_name: p.model_name,
      version: p.version,
      artifact_s3: p.artifact_s3
    }, { timeout: 30000 });

    // set active
    await prisma.$executeRawUnsafe(`UPDATE sensors.model_registry SET is_active=false WHERE model_name=$1`, p.model_name);
    await prisma.$executeRawUnsafe(`UPDATE sensors.model_registry SET is_active=true WHERE model_name=$1 AND version=$2`, p.model_name, p.version);

    publish('edge/model/deploy.done', { model_name: p.model_name, version: p.version });
  }

  return { id: rec.id, model_name: rec.model_name, version: rec.version };
}
