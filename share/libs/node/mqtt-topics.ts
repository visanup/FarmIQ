// shared/libs/node/mqtt-topics.ts
export const topics = {
  shadow: {
    update:   (tenant: string, deviceId: string) => `dm/${tenant}/${deviceId}/shadow/update`,
    accepted: (tenant: string, deviceId: string) => `dm/${tenant}/${deviceId}/shadow/accepted`,
    reported: (tenant: string, deviceId: string) => `dm/${tenant}/${deviceId}/shadow/reported`,
  },
  health:  (tenant: string, deviceId: string) => `dm/${tenant}/${deviceId}/health`,
  lwt:     (tenant: string, deviceId: string) => `dm/${tenant}/${deviceId}/lwt`,
  ota: {
    offer:    (tenant: string, deviceId: string) => `ota/${tenant}/${deviceId}/offer`,
    progress: (tenant: string, deviceId: string) => `ota/${tenant}/${deviceId}/progress`,
  },
  sensor: {
    raw:     (tenant: string, type: string, deviceId: string) => `sensor.raw/${tenant}/${type}/${deviceId}`,
    clean:   (tenant: string, type: string, deviceId: string) => `sensor.clean/${tenant}/${type}/${deviceId}`,
    anomaly: (tenant: string, type: string, deviceId: string) => `sensor.anomaly/${tenant}/${type}/${deviceId}`,
    dlq:     (tenant: string, type: string, deviceId: string) => `sensor.dlq/${tenant}/${type}/${deviceId}`,
  },
  cmd: {
    req: (tenant: string, deviceId: string) => `cmd/${tenant}/${deviceId}/request`,
    ack: (tenant: string, deviceId: string) => `cmd/${tenant}/${deviceId}/ack`,
  }
};
