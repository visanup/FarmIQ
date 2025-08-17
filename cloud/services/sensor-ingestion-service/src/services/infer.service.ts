// src/services/infer.service.ts
import axios from 'axios';
import { INFERENCE_BASE_URL, MINIO_BUCKETS } from '../configs/config';

/** ตัวอย่างเรียกยิง batch infer แบบง่าย ๆ (ให้ inference อ่านจาก MinIO โดย object_key) */
export async function backfillInfer(objectKeys: string[]) {
  const { data } = await axios.post(`${INFERENCE_BASE_URL}/infer/batch-s3`, {
    bucket: MINIO_BUCKETS.raw,
    object_keys: objectKeys
  }, { timeout: 60000 });
  return data;
}
