// services/sensor-service/src/seeders/sensorData.seed.ts

import 'dotenv/config'
import fetch from 'node-fetch'
import { AppDataSource } from '../utils/dataSource'

interface Device { device_id: number }

async function seedSensorData() {
  await AppDataSource.initialize()

  // 1) Fetch all devices from Device Service
  const resp = await fetch(
    `${process.env.DEVICE_SERVICE_URL}/api/devices`,
    {
      headers: {
        Authorization: `Bearer ${process.env.DEVICE_SERVICE_TOKEN}`,
        'Content-Type': 'application/json'
      }
    }
  )
  if (!resp.ok) {
    throw new Error(`Failed to fetch devices: ${resp.status}`)
  }
  const devices = (await resp.json()) as Device[]
  console.log(`Fetched ${devices.length} devices`)

  const manager = AppDataSource.manager
  const now = Date.now()

  // 2) For each device, generate 500 sensor data points
  for (const { device_id } of devices) {
    console.log(`Seeding 500 records for device ${device_id}`)
    for (let i = 0; i < 1000; i++) {
      // random timestamp within last 7 days
      const time = new Date(now - Math.random() * 7 * 24 * 3600 * 1000)
      // generic topic
      const topic = 'sensor.reading'
      // random value between 0 and 100
      const value = parseFloat((Math.random() * 100).toFixed(2))
      // raw payload as JSON
      const raw = JSON.stringify({ value, unit: 'unit' })

      await manager.query(
        `INSERT INTO sensors.sensor_data (time, device_id, topic, value, raw_payload)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT DO NOTHING`,
        [time, device_id, topic, value, raw]
      )
    }
  }

  console.log('✅ Completed seeding sensor_data')
  await AppDataSource.destroy()
}

seedSensorData().catch(err => {
  console.error('❌ Sensor data seeding failed:', err)
  process.exit(1)
})