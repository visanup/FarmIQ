import { publish } from './mqtt.js';
import { TOPIC_PREFIX, DEFAULT_TENANT, DEFAULT_HOUSE } from './config.js';
import { produce } from './kafka.js';

function pref(s: string) { return `${TOPIC_PREFIX}/${s}`; }

// Helpers to build edge topics
const edgeTopics = {
  teleLab: (p: any) => pref(`tele/${p.tenant}/${p.house}/lab/${p.station}/env/${p.sensor}/${p.metric}`),
  teleRun: (p: any) => pref(`tele/${p.tenant}/${p.house}/robot/${p.robot}/run/${p.run}/${p.sensor}/${p.metric}`),
  stat:    (p: any) => pref(`stat/${p.tenant}/${p.house}/${p.device_type}/${p.device}`),
  evtImageStored: (p: any) => pref(`evt/${p.tenant}/${p.house}/${p.scope}/camera/${p.cam}/stored`),
  evtWeighFinal:  (p: any) => pref(`evt/${p.tenant}/${p.house}/${p.scope}/weigh/finalized`),
  alert:   (p: any) => pref(`evt/${p.tenant}/${p.house}/alert/${p.alert_type}`),
};

// Basic mappers from current payloads to edge payloads
export async function mapSensorClean(topicParts: string[], payload: any) {
  // sensor.clean/{tenant}/{metric}/{device}
  const tenant = topicParts[1] || payload.tenant || DEFAULT_TENANT;
  const metric = topicParts[2] || payload.metric || 'UNKNOWN';
  const device = topicParts[3] || payload.device_id || 'dev-unknown';
  const ts = payload.ts || new Date().toISOString();

  const base = {
    schema: 'sensor_clean@1', ts,
    tenant, metric, value: payload.value,
    unit: payload.unit, quality: payload.quality, payload
  };

  if (payload.run_id && (payload.robot_id || device)) {
    const msg = { ...base, house: payload.house || DEFAULT_HOUSE, robot: payload.robot_id || device,
      run: payload.run_id, sensor: payload.sensor_id || device, zone_id: payload.zone_id, x: payload.x, y: payload.y };
    const t = edgeTopics.teleRun({ tenant, house: msg.house, robot: msg.robot, run: msg.run, sensor: msg.sensor, metric });
    publish(t, msg, 1, false);
    await produce('sensors.sweep.readings.v1', tenant, { timestamp: ts, data: msg });
  } else {
    const msg = { ...base, house: payload.house || DEFAULT_HOUSE, station: payload.station_id || 'st01', sensor: payload.sensor_id || device };
    const t = edgeTopics.teleLab({ tenant, house: msg.house, station: msg.station, sensor: msg.sensor, metric });
    publish(t, msg, 1, false);
    await produce('sensors.lab.readings.v1', tenant, { timestamp: ts, data: msg });
  }
}

export async function mapSensorAnomaly(topicParts: string[], payload: any) {
  const tenant = topicParts[1] || payload.tenant || DEFAULT_TENANT;
  const ts = payload.ts || new Date().toISOString();
  const alert_type = payload.reason || 'sensor_anomaly';
  const t = edgeTopics.alert({ tenant, house: payload.house || DEFAULT_HOUSE, alert_type });
  const msg = { schema: 'alert@1', ts, alert_type, level: payload.level ?? 1, context: payload };
  publish(t, msg, 1, false);
  await produce('analytics.anomaly.v1', tenant, { timestamp: ts, data: msg });
}

export async function mapDeviceHealth(kind: 'health'|'lwt', topicParts: string[], payload: any) {
  // dm/{tenant}/{device}/health|lwt
  const tenant = topicParts[1] || payload.tenant || DEFAULT_TENANT;
  const device = topicParts[2] || payload.device || payload.device_id || 'dev-unknown';
  const online = kind === 'lwt' ? false : (payload.online ?? true);
  const ts = payload.ts || new Date().toISOString();
  const msg = { schema: 'device_status@1', ts, online, rssi: payload.rssi, uptime_s: payload.uptime_s, meta: payload.meta || {} };
  const t = edgeTopics.stat({ tenant, house: payload.house || DEFAULT_HOUSE, device_type: payload.device_type || 'device', device });
  publish(t, msg, 1, true);
  await produce('sensors.device.health.v1', tenant, { timestamp: ts, data: { tenant, deviceId: device, ...msg } });
}

export async function mapImageCreated(payload: any) {
  // payload from image-ingestion: tenant_id, sensor_id, media_id, bucket, objectKey, time
  const tenant = payload.tenant_id || DEFAULT_TENANT;
  const ts = payload.time || new Date().toISOString();
  const scope = payload.station_id ? `lab/${payload.station_id}` : `robot/${payload.robot_id || 'r01'}`;
  const cam = payload.sensor_id || 'cam01';
  const t = edgeTopics.evtImageStored({ tenant, house: payload.house || DEFAULT_HOUSE, scope, cam });
  const msg = { schema: 'image_stored@1', tenant, ts, media_id: payload.media_id, bucket: payload.bucket, object_key: payload.objectKey, sha256: payload.sha256 };
  publish(t, msg, 1, false);
  await produce('media.image.stored.v1', tenant, { timestamp: ts, data: msg });
}

export async function mapWeightAssociated(payload: any) {
  const tenant = payload.tenant || DEFAULT_TENANT;
  const ts = payload.time || new Date().toISOString();
  const scope = payload.station ? `lab/${payload.station}` : `robot/${payload.robot || 'r01'}`;
  const t = edgeTopics.evtWeighFinal({ tenant, house: payload.house || DEFAULT_HOUSE, scope });
  const msg = { schema: 'weigh_finalized@1', tenant, media_id: payload.media_id, weight_kg: payload.weight ?? payload.weight_kg, t_weight: ts, strategy: payload.strategy || 'session_id', match_window_ms: payload.delta_ms ?? payload.match_window_ms ?? 0 };
  publish(t, msg, 1, false);
  const kTopic = payload.run_id ? 'sensors.sweep.readings.v1' : 'sensors.lab.readings.v1';
  await produce(kTopic, tenant, { timestamp: ts, data: { metric: 'WEIGHT', ...msg } });
}

