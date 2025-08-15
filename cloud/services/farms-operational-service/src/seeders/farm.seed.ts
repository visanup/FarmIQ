// services/farm-service/src/seeders/farm.seed.ts

import 'dotenv/config'
import fetch from 'node-fetch'
import { AppDataSource } from '../utils/dataSource'
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

// DTO interfaces for fetched entities
interface Customer { customer_id: number }
interface Farm { farm_id: number }
interface House { house_id: number; area: number }
interface Animal { animal_id: number }

async function seedData() {
  await AppDataSource.initialize()

  // Repositories
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

  // 1) Fetch customers
  const custResp = await fetch(
    `${process.env.CUSTOMER_SERVICE_URL}/api/customers`,
    {
      headers: {
        Authorization: `Bearer ${process.env.CUSTOMER_SERVICE_TOKEN}`,
        'Content-Type': 'application/json'
      }
    }
  )
  if (!custResp.ok) throw new Error(`Failed to fetch customers: ${custResp.status}`)
  const customers = (await custResp.json()) as Customer[]

  const now = new Date()

  for (const cust of customers) {
    // 2) Fetch farms from Farm Service
    const farmResp = await fetch(
      `${process.env.FARM_SERVICE_URL}/api/farms?customer_id=${cust.customer_id}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.FARM_SERVICE_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    )
    if (!farmResp.ok) throw new Error(`Failed to fetch farms for customer ${cust.customer_id}: ${farmResp.status}`)
    const farms = (await farmResp.json()) as Farm[]

    for (const farm of farms) {
      // 3) Seed Feed Program
      await fpRepo.save(
        fpRepo.create({
          customer_id: cust.customer_id,
          farm_id: farm.farm_id,
          name: `Standard Feed Program ${farm.farm_id}`,
          description: 'Standard diet',
          effective_start: now,
          effective_end: new Date(now.getTime() + 30 * 86400000)
        })
      )

      // 4) Seed Environmental Factors
      await efRepo.save(
        efRepo.create({
          customer_id: cust.customer_id,
          farm_id: farm.farm_id,
          ventilation_rate: 20,
          note: '',
          measurement_date: now.toISOString().slice(0, 10),
          effective_start: now
        })
      )

      // 5) Seed Water Quality
      await wqRepo.save(
        wqRepo.create({
          customer_id: cust.customer_id,
          farm_id: farm.farm_id,
          fe: 0.1,
          pb: 0.01,
          note: '',
          measurement_date: now.toISOString().slice(0, 10)
        })
      )

      // 6) Fetch houses from House Service
      const houseResp = await fetch(
        `${process.env.HOUSE_SERVICE_URL}/api/houses?farm_id=${farm.farm_id}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.HOUSE_SERVICE_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      )
      if (!houseResp.ok) throw new Error(`Failed to fetch houses for farm ${farm.farm_id}: ${houseResp.status}`)
      const houses = (await houseResp.json()) as House[]

      for (const house of houses) {
        // 7) Seed Housing Conditions
        await hcRepo.save(
          hcRepo.create({
            customer_id: cust.customer_id,
            farm_id: farm.farm_id,
            flooring_humidity: 10,
            animal_density: 20,
            area: house.area,
            effective_start: now
          })
        )

        // 8) Fetch animals from Animal Service
        const animalResp = await fetch(
          `${process.env.ANIMAL_SERVICE_URL}/api/animals?house_id=${house.house_id}`,
          {
            headers: {
              Authorization: `Bearer ${process.env.ANIMAL_SERVICE_TOKEN}`,
              'Content-Type': 'application/json'
            }
          }
        )
        if (!animalResp.ok) throw new Error(`Failed to fetch animals for house ${house.house_id}: ${animalResp.status}`)
        const animals = (await animalResp.json()) as Animal[]

        for (const animal of animals) {
          // 9) Genetic Factor
          await gfRepo.save(
            gfRepo.create({
              customer_id: cust.customer_id,
              animal_id: animal.animal_id,
              test_type: 'DNA',
              result: 'normal',
              test_date: now.toISOString().slice(0, 10)
            })
          )

          // 10) Health Record
          await hrRepo.save(
            hrRepo.create({
              customer_id: cust.customer_id,
              animal_id: animal.animal_id,
              health_status: 'good',
              disease: '',
              vaccine: 'standard',
              recorded_date: now.toISOString().slice(0, 10)
            })
          )

          // 11) Welfare Indicator
          await wiRepo.save(
            wiRepo.create({
              customer_id: cust.customer_id,
              animal_id: animal.animal_id,
              footpad_lesion: false,
              stress_hormone: 0,
              recorded_date: now.toISOString().slice(0, 10)
            })
          )

          // 12) Performance Metric
          await pmRepo.save(
            pmRepo.create({
              customer_id: cust.customer_id,
              animal_id: animal.animal_id,
              adg: 1.2,
              fcr: 2.5,
              survival_rate: 0.98,
              pi_score: 75,
              mortality_rate: 0.02,
              health_score: 80,
              behavior_score: 70,
              body_condition_score: 3,
              stress_level: 1.1,
              disease_incidence_rate: 0,
              vaccination_status: 'up-to-date',
              recorded_date: now.toISOString().slice(0, 10)
            })
          )

          // 13) Feed Intake
          await fiRepo.save(
            fiRepo.create({
              customer_id: cust.customer_id,
              farm_id: farm.farm_id,
              animal_id: animal.animal_id,
              feed_batch_id: 1,
              feed_quantity: 5
            })
          )
        }
      }

      // 14) Operational Record
      await orRepo.save(
        orRepo.create({
          customer_id: cust.customer_id,
          farm_id: farm.farm_id,
          type: 'inspection',
          description: 'Routine check',
          record_date: now.toISOString().slice(0, 10)
        })
      )
    }
  }

  console.log('✅ All data seeded')
  await AppDataSource.destroy()
}

seedData().catch(err => {
  console.error('❌ Seeding failed:', err)
  process.exit(1)
})

