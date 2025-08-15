// services/farm-service/src/seeders/farm.seed.ts

import 'dotenv/config'
import fetch from 'node-fetch'
import { AppDataSource } from '../utils/dataSource'
import { Farm } from '../models/farm.model'
import { House } from '../models/house.model'
import { Animal } from '../models/animal.model'
import { GeneticFactor } from '../models/geneticFactor.model'
import { FeedProgram } from '../models/feedProgram.model'
import { FeedIntake } from '../models/feedIntake.model'
import { EnvironmentalFactor } from '../models/envFactor.model'
import { HousingCondition } from '../models/housingCondition.model'
import { WaterQuality } from '../models/waterQuality.model'
import { HealthRecord } from '../models/healthRecord.model'
import { WelfareIndicator } from '../models/welfareIndicator.model'
import { PerformanceMetric } from '../models/performanceMetric.model'
import { OperationRecord } from '../models/operationRecord.model'

// DTO for fetched customers
interface Customer { customer_id: number }

// List of animal species per house
const speciesList = [
  'เป็ดเนื้อ', 'เป็ดไข่', 'ไก่เนื้อ', 'หมูขุน',
  'ไก่ไข่', 'เป็ดพันธุ์', 'ไก่พันธุ์', 'หมูพันธ์ุ'
]

async function seedFarms() {
  await AppDataSource.initialize()

  // Repositories
  const farmRepo = AppDataSource.getRepository(Farm)
  const houseRepo = AppDataSource.getRepository(House)
  const animalRepo = AppDataSource.getRepository(Animal)
  const gfRepo = AppDataSource.getRepository(GeneticFactor)
  const fpRepo = AppDataSource.getRepository(FeedProgram)
  const fiRepo = AppDataSource.getRepository(FeedIntake)
  const efRepo = AppDataSource.getRepository(EnvironmentalFactor)
  const hcRepo = AppDataSource.getRepository(HousingCondition)
  const wqRepo = AppDataSource.getRepository(WaterQuality)
  const hrRepo = AppDataSource.getRepository(HealthRecord)
  const wiRepo = AppDataSource.getRepository(WelfareIndicator)
  const pmRepo = AppDataSource.getRepository(PerformanceMetric)
  const orRepo = AppDataSource.getRepository(OperationRecord)

  // 1) Fetch customers via API (ensure correct path)
  const resp = await fetch(
    `${process.env.CUSTOMER_SERVICE_URL}/api/customers`, {
      headers: {
        Authorization: `Bearer ${process.env.CUSTOMER_SERVICE_TOKEN}`,
        'Content-Type': 'application/json'
      }
    }
  )
  if (!resp.ok) throw new Error(`Fetch customers failed with status ${resp.status}`)
  const customers = (await resp.json()) as Customer[]

  const now = new Date()

  for (const cust of customers) {
    // 2) Create two farms per customer
    for (let f = 1; f <= 2; f++) {
      const farmName = `Farm ${f}`
      let farm = await farmRepo.findOne({ where: { customer_id: cust.customer_id, name: farmName } })
      if (!farm) {
        farm = await farmRepo.save(farmRepo.create({
          customer_id: cust.customer_id,
          name: farmName,
          status: 'active'
        }))
      }

      // 3) Create five houses per farm
      const houses: House[] = []
      for (let h = 1; h <= 5; h++) {
        const houseName = `House ${h}`
        let house = await houseRepo.findOne({ where: { customer_id: cust.customer_id, farm_id: farm.farm_id, name: houseName } })
        if (!house) {
          house = await houseRepo.save(houseRepo.create({
            customer_id: cust.customer_id,
            farm_id: farm.farm_id,
            name: houseName,
            area: Number((Math.random() * 100 + 50).toFixed(2)),
            capacity: Math.floor(Math.random() * 50 + 10)
          }))
        }
        houses.push(house)

        // 4) Create animals per house
        for (const sp of speciesList) {
          let animal = await animalRepo.findOne({ where: { customer_id: cust.customer_id, farm_id: farm.farm_id, house_id: house.house_id, species: sp } })
          if (!animal) {
            const birth = new Date(now)
            birth.setFullYear(birth.getFullYear() - (Math.floor(Math.random() * 2) + 1))
            animal = await animalRepo.save(animalRepo.create({
              customer_id: cust.customer_id,
              farm_id: farm.farm_id,
              house_id: house.house_id,
              species: sp,
              breed: sp,
              birth_date: birth.toISOString().slice(0,10)
            }))
          }

          // 5) Related records: genetic, health, welfare, performance
          await gfRepo.save(gfRepo.create({ customer_id: cust.customer_id, animal_id: animal.animal_id, test_type: 'DNA', result: 'normal', test_date: now.toISOString().slice(0,10) }))
          await hrRepo.save(hrRepo.create({ customer_id: cust.customer_id, animal_id: animal.animal_id, health_status: 'good', disease: '', vaccine: 'standard', recorded_date: now.toISOString().slice(0,10) }))
          await wiRepo.save(wiRepo.create({ customer_id: cust.customer_id, animal_id: animal.animal_id, footpad_lesion: false, stress_hormone: 0, recorded_date: now.toISOString().slice(0,10) }))
          await pmRepo.save(pmRepo.create({ customer_id: cust.customer_id, animal_id: animal.animal_id, adg: 1.2, fcr: 2.5, survival_rate: 0.98, pi_score: 75, mortality_rate: 0.02, health_score: 80, behavior_score: 70, body_condition_score: 3, stress_level: 1.1, disease_incidence_rate: 0, vaccination_status: 'up-to-date', recorded_date: now.toISOString().slice(0,10) }))
        }
      }

      // 6) Feed program per farm
      await fpRepo.save(fpRepo.create({ customer_id: cust.customer_id, farm_id: farm.farm_id, name: `Standard Feed Program ${farm.farm_id}`, description: 'Standard diet', effective_start: now, effective_end: new Date(now.getTime() + 30*86400000) }))

      // 7) Environmental factor per farm
      await efRepo.save(efRepo.create({ customer_id: cust.customer_id, farm_id: farm.farm_id, ventilation_rate: 20, note: '', measurement_date: now.toISOString().slice(0,10), effective_start: now }))

      // 8) Housing conditions per house
      for (const house of houses) {
        await hcRepo.save(hcRepo.create({ customer_id: cust.customer_id, farm_id: farm.farm_id, flooring_humidity: 10, animal_density: 20, area: house.area, effective_start: now }))
      }

      // 9) Water quality per farm
      await wqRepo.save(wqRepo.create({ customer_id: cust.customer_id, farm_id: farm.farm_id, fe: 0.1, pb: 0.01, note: '', measurement_date: now.toISOString().slice(0,10) }))

      // 10) Feed intake per animal
      const animals = await animalRepo.find({ where: { farm_id: farm.farm_id } })
      for (const animal of animals) {
        await fiRepo.save(fiRepo.create({ customer_id: cust.customer_id, farm_id: farm.farm_id, animal_id: animal.animal_id, feed_batch_id: 1, feed_quantity: 5 }))
      }

      // 11) Operational record per farm
      await orRepo.save(orRepo.create({ customer_id: cust.customer_id, farm_id: farm.farm_id, type: 'inspection', description: 'Routine check', record_date: now.toISOString().slice(0,10) }))
    }
  }

  console.log('✅ All farm-related data seeded')
  await AppDataSource.destroy()
}

seedFarms().catch(err => {
  console.error('❌ Seed farms failed:', err)
  process.exit(1)
})
