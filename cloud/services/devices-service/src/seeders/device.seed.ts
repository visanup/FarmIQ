// services/device-service/src/seeders/device.seed.ts

import 'dotenv/config'
import fetch from 'node-fetch'
import { DeviceType } from '../models/deviceTypes.model'
import { Device } from '../models/device.model'
import { DeviceGroup } from '../models/deviceGroup.model'
import { DeviceLog } from '../models/deviceLogs.model'
import { DeviceStatusHistory } from '../models/deviceStatusHistory.model'
import { AppDataSource } from '../utils/dataSource'

interface Customer {
  customer_id: number
  name: string
  email?: string
  phone?: string
}

type GroupTemplate = { name: string; category: string; }

type EventTemplate = { event_type: string; event_data: any }
type StatusTemplate = { status: string; note?: string }

async function seedDevices() {
  await AppDataSource.initialize()
  const typeRepo    = AppDataSource.getRepository(DeviceType)
  const devRepo     = AppDataSource.getRepository(Device)
  const groupRepo   = AppDataSource.getRepository(DeviceGroup)
  const logRepo     = AppDataSource.getRepository(DeviceLog)
  const statusRepo  = AppDataSource.getRepository(DeviceStatusHistory)

  // 1) Seed device_types
  const types = [
    'temperature sensor','humidity sensor','co2 sensor','nm3 sensor','vocs sensor',
    'light intensity sensor','photoperiod sensor','edge weight ai',
    'capacitive soil sensor','ph-water sensor','tds-water sensor','ec-water sensor',
    'temperature-water sensor','water meter','feed intake',
  ]
  for (const name of types) {
    if (!(await typeRepo.findOneBy({ name }))) {
      await typeRepo.save(typeRepo.create({ name }))
    }
  }
  console.log('✅ device_types seeded')

  // 2) Fetch customers via API
  const resp = await fetch(`${process.env.CUSTOMER_SERVICE_URL}/api/customers`)
  if (!resp.ok) throw new Error(`Fetch customers failed: ${resp.status}`)
  const customers = (await resp.json()) as Customer[]

  // 3) Seed device_groups per customer
  const groupTemplates: GroupTemplate[] = [
    { name: 'Environmental Sensors', category: 'sensor' },
    { name: 'Water Sensors',         category: 'water'  },
    { name: 'AI Devices',            category: 'ai'     },
    { name: 'Other Devices',         category: 'other'  },
  ]
  const groupMap: Record<number, Record<string, DeviceGroup>> = {}
  for (const cust of customers) {
    groupMap[cust.customer_id] = {}
    for (const tmpl of groupTemplates) {
      let group = await groupRepo.findOne({ where: { customer_id: cust.customer_id, name: tmpl.name } })
      if (!group) {
        group = groupRepo.create({
          customer_id: cust.customer_id,
          name: tmpl.name,
          category: tmpl.category,
          note: `${tmpl.name} for ${cust.customer_id}`
        })
        await groupRepo.save(group)
      }
      groupMap[cust.customer_id][tmpl.category] = group
    }
  }
  console.log('✅ device_groups seeded')

  // 4) Seed devices for each customer & type with group assignment
  const allTypes = await typeRepo.find()
  const now      = new Date()
  const devicesSaved: Device[] = []

  for (const cust of customers) {
    for (const t of allTypes) {
      const existing = await devRepo.findOne({ where: { customer_id: cust.customer_id, type_id: t.type_id } })
      if (existing) { devicesSaved.push(existing); continue }
      const lower = t.name.toLowerCase()
      let catKey = 'other'
      if (lower.includes('water')) catKey = 'water'
      else if (lower.includes('ai')) catKey = 'ai'
      else if (lower.includes('sensor')) catKey = 'sensor'
      const group = groupMap[cust.customer_id][catKey]

      // dates
      const install = new Date(now); install.setMonth(install.getMonth()-1)
      const purchase = new Date(install); purchase.setMonth(purchase.getMonth()-1)
      const calib = new Date(install); calib.setDate(calib.getDate()+10)
      const expiry = new Date(purchase); expiry.setFullYear(expiry.getFullYear()+1)
      
      const dev = devRepo.create({
        customer_id: cust.customer_id,
        house_id:    1,
        type_id:     t.type_id,
        group_id:    group.group_id,
        model:             `${t.name} Model X`,
        serial_number:     `SN-${cust.customer_id}-${t.type_id}`,
        install_date:      install.toISOString().slice(0,10),
        calibration_date:  calib.toISOString().slice(0,10),
        last_maintenance:  calib.toISOString().slice(0,10),
        location_detail:   `Warehouse ${cust.customer_id}`,
        manufacturer:      'Acme Instruments',
        purchase_date:     purchase.toISOString().slice(0,10),
        warranty_expiry:   expiry.toISOString().slice(0,10),
        specs:             { unit:'unit', range:'0-100' },
        location_latitude: 13.736717 + cust.customer_id*0.001,
        location_longitude:100.523186 + cust.customer_id*0.001,
        firmware_version:  '1.0.0',
        ip_address:        `10.0.${cust.customer_id}.${t.type_id}`,
        mac_address:       `00:1A:C2:7B:00:${(t.type_id+10).toString(16)}`,
        last_seen:         now,
        tags:              [t.name],
        config:            {},
        credentials:       {},
        build_code:        `build-${cust.customer_id}-${t.type_id}`,
        build_date:        now,
        status:            'active',
      })
      const saved = await devRepo.save(dev)
      devicesSaved.push(saved)
      console.log(`  ✔ Device ${saved.serial_number} (grp=${group.name}) for cust ${cust.customer_id}`)
    }
  }
  console.log('✅ devices seeded')

  // 5) Seed device_logs and device_status_history
  const eventTemplates: EventTemplate[] = [
    { event_type: 'config_update', event_data: { changed: 'sampling_rate' } },
    { event_type: 'reboot',        event_data: {} },
    { event_type: 'error',         event_data: { code: 'E001', message: 'Sensor timeout' } },
  ]
  const statusTemplates: StatusTemplate[] = [
    { status: 'active' },
    { status: 'maintenance', note: 'Scheduled check' },
    { status: 'inactive',    note: 'Retired' },
  ]

  for (const dev of devicesSaved) {
    // logs
    for (const ev of eventTemplates) {
      const log = logRepo.create({
        customer_id: dev.customer_id,
        device_id:   dev.device_id,
        event_type:  ev.event_type,
        event_data:  ev.event_data,
        performed_by:'system',
      })
      await logRepo.save(log)
    }
    // status history
    for (const st of statusTemplates) {
      const hist = statusRepo.create({
        customer_id:  dev.customer_id,
        device_id:    dev.device_id,
        performed_by:'system',
        status:       st.status,
        changed_at:   new Date(),
        note:         st.note,
      })
      await statusRepo.save(hist)
    }
  }
  console.log('✅ device_logs and device_status_history seeded')

  await AppDataSource.destroy()
}

seedDevices().catch(err => {
  console.error('❌ Seed failed:', err)
  process.exit(1)
})
