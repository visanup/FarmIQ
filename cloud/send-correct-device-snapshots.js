const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'send-correct-device-snapshots',
  brokers: ['localhost:9094'],
});

const producer = kafka.producer();

async function sendCorrectDeviceSnapshots() {
  await producer.connect();
  console.log('✅ Connected to Kafka');

  // สร้าง device snapshots ใหม่ด้วย snake_case format
  const devices = [
    {
      device_id: 'device_house_farm_tenant_001_001_001_001',
      tenant_id: 'default-tenant',
      farm_id: 'cmfme1n3c00185w68ab4279od',
      house_id: 'cmfme1n51001s5w68dwvg6zdl',
      type: 'sensor',
      status: 'active',
      name: 'เซ็นนเซอร์temperature 1',
      model: 'TEMP-001',
      vendor: 'FarmIQ',
      serial_no: 'SN001',
      location: 'House 1',
      meta: {
        unit: '°C',
        sensor_type: 'temperature',
        battery_level: 70,
        signal_strength: -51,
        warranty_expiry: '2025-12-26T18:23:52.386Z',
        firmware_version: '1.0.2',
        last_maintenance: '2025-07-07T22:00:31.526Z'
      }
    },
    {
      device_id: 'device_house_farm_tenant_001_001_001_002',
      tenant_id: 'default-tenant',
      farm_id: 'cmfme1n3c00185w68ab4279od',
      house_id: 'cmfme1n51001s5w68dwvg6zdl',
      type: 'sensor',
      status: 'inactive',
      name: 'เซ็นนเซอร์humidity 2',
      model: 'HUM-002',
      vendor: 'FarmIQ',
      serial_no: 'SN002',
      location: 'House 1',
      meta: {
        unit: '%',
        sensor_type: 'humidity',
        battery_level: 24,
        signal_strength: -99,
        warranty_expiry: '2026-01-07T10:53:52.256Z',
        firmware_version: '7.13.1',
        last_maintenance: '2024-11-16T21:31:42.472Z'
      }
    }
  ];

  for (const device of devices) {
    const deviceSnapshot = {
      eventId: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      eventType: 'device.snapshot.updated',
      version: '1.0',
      timestamp: new Date().toISOString(),
      source: {
        service: 'master-service',
        version: '1.0.0'
      },
      data: {
        ...device,
        updated_at: new Date().toISOString()
      }
    };

    try {
      await producer.send({
        topic: 'master.device.snapshot.v1',
        messages: [{
          key: device.device_id,
          value: JSON.stringify(deviceSnapshot),
          headers: {
            'event-type': deviceSnapshot.eventType,
            'event-version': deviceSnapshot.version,
            'source-service': deviceSnapshot.source.service,
            'timestamp': deviceSnapshot.timestamp
          }
        }]
      });

      console.log(`✅ Sent device snapshot for ${device.device_id}`);
    } catch (error) {
      console.error(`❌ Failed to send ${device.device_id}:`, error);
    }
  }

  await producer.disconnect();
  console.log('✅ All device snapshots sent');
}

sendCorrectDeviceSnapshots().catch(console.error);
