// services\sensor-service\src\utils\helpers.ts

export function parsePayload(payload: Buffer): any {
  try {
    return JSON.parse(payload.toString());
  } catch (err) {
    console.warn("Failed to parse MQTT payload:", err);
    return null;
  }
}