const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'fix-device-snapshots',
  brokers: ['localhost:9094'],
});

const producer = kafka.producer();

async function fixDeviceSnapshots() {
  await producer.connect();
  console.log('✅ Connected to Kafka');

  // สร้าง device snapshot ใหม่ด้วย snake_case format
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
      tenant_id: 'default-tenant',
      device_id: 'device_house_farm_tenant_001_001_001_001',
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
      },
      updated_at: new Date().toISOString()
    }
  };

  try {
    await producer.send({
      topic: 'master.device.snapshot.v1',
      messages: [{
        key: deviceSnapshot.data.device_id,
        value: JSON.stringify(deviceSnapshot),
        headers: {
          'event-type': deviceSnapshot.eventType,
          'event-version': deviceSnapshot.version,
          'source-service': deviceSnapshot.source.service,
          'timestamp': deviceSnapshot.timestamp
        }
      }]
    });

    console.log('✅ Sent fixed device snapshot');
    console.log('📤 Payload:', JSON.stringify(deviceSnapshot, null, 2));
  } catch (error) {
    console.error('❌ Failed to send:', error);
  } finally {
    await producer.disconnect();
  }
}

fixDeviceSnapshots().catch(console.error);

