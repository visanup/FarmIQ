import axios from 'axios';
import { config } from './config.js';

export const requestInference = async ({ mediaId, tenantId, farmId, houseId, stationId, metadata }) => {
  if (!config.vision.enabled) {
    return null;
  }

  try {
    const response = await axios.post(config.vision.url, {
      media_id: mediaId,
      tenant_id: tenantId,
      farm_id: farmId,
      house_id: houseId,
      station_id: stationId,
      metadata,
    }, {
      timeout: 5000,
    });
    return response.data;
  } catch (err) {
    const message = err.response?.data ?? err.message;
    console.warn('[vision] inference request failed', message);
    return null;
  }
};
