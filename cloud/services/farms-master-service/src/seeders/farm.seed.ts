/**
 * Seeder for farms, houses, animals, and batches only.
 * Fetches customers and creates 2 farms per customer,
 * 5 houses per farm, one batch per farm, and one animal per house.
 */

import 'dotenv/config'
import fetch from 'node-fetch'
import { AppDataSource } from '../utils/dataSource'
import { Farm } from '../models/farm.model'
import { House } from '../models/house.model'
import { Animal } from '../models/animal.model'
import { Batch } from '../models/batches.model'

// DTO for fetched customers
interface Customer { customer_id: number }

async function seedCoreData() {
  await AppDataSource.initialize()

  const farmRepo = AppDataSource.getRepository(Farm)
  const houseRepo = AppDataSource.getRepository(House)
  const animalRepo = AppDataSource.getRepository(Animal)
  const batchRepo = AppDataSource.getRepository(Batch)

  // 1) Fetch customers via API
  const resp = await fetch(
    `${process.env.CUSTOMER_SERVICE_URL}/api/customers`, {
      headers: {
        Authorization: `Bearer ${process.env.CUSTOMER_SERVICE_TOKEN}`,
        'Content-Type': 'application/json'
      }
    }
  )
  if (!resp.ok) throw new Error(`Fetch customers failed: ${resp.status}`)
  const customers = (await resp.json()) as Customer[]

  const now = new Date()

  for (const cust of customers) {
    // 2) Create two farms per customer
    for (let f = 1; f <= 2; f++) {
      const farmName = `Farm ${f}`
      let farm = await farmRepo.findOne({ where: { customer_id: cust.customer_id, name: farmName } })
      if (!farm) {
        farm = farmRepo.create({
          customer_id: cust.customer_id,
          name: farmName,
          status: 'active'
        })
        farm = await farmRepo.save(farm)
      }

      // 3) Create five houses per farm
      const houses: House[] = []
      for (let h = 1; h <= 5; h++) {
        const houseName = `House ${h}`
        let house = await houseRepo.findOne({ where: { customer_id: cust.customer_id, farm_id: farm.farm_id, name: houseName } })
        if (!house) {
          house = houseRepo.create({
            customer_id: cust.customer_id,
            farm_id: farm.farm_id,
            name: houseName,
            area: Number((Math.random() * 100 + 50).toFixed(2)),
            capacity: Math.floor(Math.random() * 50 + 10)
          })
          house = await houseRepo.save(house)
        }
        houses.push(house)

        // 4) Create one animal per house
        let animal = await animalRepo.findOne({
          where: {
            customer_id: cust.customer_id,
            farm_id: farm.farm_id,
            house_id: house.house_id
          }
        })
        if (!animal) {
          animal = animalRepo.create({
            customer_id: cust.customer_id,
            farm_id: farm.farm_id,
            house_id: house.house_id,
            species: 'Default Species',
            breed: 'Default Breed',
            birth_date: now.toISOString().slice(0, 10)
          })
          animal = await animalRepo.save(animal)
        }
      }

      // 5) Create one batch per farm
      const batchId = `BATCH-${farm.farm_id}-${now.getTime()}`
      let batch = await batchRepo.findOne({ where: { batch_id: batchId } })
      if (!batch) {
        batch = batchRepo.create({
          batch_id: batchId,
          customer_id: cust.customer_id,
          farm_id: farm.farm_id,
          species: 'Default Species',
          breed: 'Default Breed',
          quantity_start: houses.length,
          start_date: now.toISOString().slice(0, 10)
        })
        await batchRepo.save(batch)
      }
    }
  }

  console.log('✅ Seed complete: farms, houses, animals, batches')
  await AppDataSource.destroy()
}

seedCoreData().catch(err => {
  console.error('❌ Seeding failed:', err)
  process.exit(1)
})
