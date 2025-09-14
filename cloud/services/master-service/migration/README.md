# Master Service Migration Plan

เนเธเธเธเธฒเธฃเธขเนเธฒเธขเธเนเธญเธกเธนเธฅเธเธฒเธ services เน€เธเนเธฒเนเธ master-service เนเธเธ gradual migration

## ๐ฏ เน€เธเนเธฒเธซเธกเธฒเธข

เธขเนเธฒเธขเธเนเธญเธกเธนเธฅเธเธฒเธ services เธ•เนเธญเนเธเธเธตเนเนเธ master-service:
- customer-service โ’ master.Customer
- farm-service โ’ master.Farm, master.House, master.Flock
- devices-service โ’ master.Device, master.DeviceType, master.DeviceHealth
- feed-service โ’ master.FeedType (เธเธขเธฒเธขเน€เธเธดเนเธกเน€เธ•เธดเธก)
- formula-service โ’ master.Formula
- economic-service โ’ master.EconomicData
- external-factor-service โ’ master.ExternalDataSource

## ๐“ Migration Phases

### Phase 1: Data Analysis & Schema Mapping
- [x] เธงเธดเน€เธเธฃเธฒเธฐเธซเน schema เธเธญเธ services เน€เธเนเธฒ
- [x] เน€เธเธฃเธตเธขเธเน€เธ—เธตเธขเธเธเธฑเธ master-service schema
- [x] เธชเธฃเนเธฒเธ mapping table
- [ ] เธ•เธฃเธงเธเธชเธญเธ data integrity requirements

### Phase 2: Migration Scripts Development
- [ ] เธชเธฃเนเธฒเธ migration scripts เธชเธณเธซเธฃเธฑเธเนเธ•เนเธฅเธฐ service
- [ ] เธชเธฃเนเธฒเธ data validation scripts
- [ ] เธชเธฃเนเธฒเธ rollback scripts
- [ ] เธ—เธ”เธชเธญเธ migration scripts

### Phase 3: Master Service Enhancement
- [ ] เน€เธเธดเนเธก API endpoints เธ—เธตเนเธเธณเน€เธเนเธ
- [ ] เน€เธเธดเนเธก data models เธ—เธตเนเธเธฒเธ”เธซเธฒเธขเนเธ
- [ ] เธชเธฃเนเธฒเธ compatibility layer
- [ ] เธญเธฑเธเน€เธ”เธ• documentation

### Phase 4: Gradual Migration
- [ ] Migrate customer-service data
- [ ] Migrate farm-service data
- [ ] Migrate devices-service data
- [ ] Migrate feed-service data
- [ ] Migrate formula-service data
- [ ] Migrate economic-service data
- [ ] Migrate external-factor-service data

### Phase 5: Service Deprecation
- [ ] เธเธฃเธฐเธเธฒเธจ deprecation
- [ ] เธชเธฃเนเธฒเธ deprecation timeline
- [ ] เธญเธฑเธเน€เธ”เธ• client applications
- [ ] เธฅเธ services เน€เธเนเธฒ

## ๐” Migration Strategy

### 1. Dual Write Pattern
- เน€เธเธตเธขเธเธเนเธญเธกเธนเธฅเนเธเธ—เธฑเนเธ services เน€เธเนเธฒเนเธฅเธฐ master-service
- เนเธเน master-service เน€เธเนเธ primary source of truth
- เน€เธเนเธ services เน€เธเนเธฒเน€เธเนเธ backup

### 2. Read Migration
- เน€เธเธฅเธตเนเธขเธ client applications เนเธซเนเธญเนเธฒเธเธเธฒเธ master-service
- เน€เธเนเธ services เน€เธเนเธฒเนเธงเนเธชเธณเธซเธฃเธฑเธ fallback

### 3. Write Migration
- เน€เธเธฅเธตเนเธขเธ client applications เนเธซเนเน€เธเธตเธขเธเนเธ master-service
- เนเธเน event-driven sync เนเธ services เน€เธเนเธฒ (เธ–เนเธฒเธเธณเน€เธเนเธ)

### 4. Service Shutdown
- เธเธดเธ” services เน€เธเนเธฒเธซเธฅเธฑเธเธเธฒเธ migration เน€เธชเธฃเนเธเธชเธดเนเธ
- เธฅเธ code เนเธฅเธฐ infrastructure

## ๐“ Data Mapping

### Customer Service โ’ Master Service
| Source (customers) | Target (master) | Notes |
|-------------------|-----------------|-------|
| customers | Customer | Direct mapping |
| subscriptions | Customer.subscriptionType | Field mapping |
| user_roles | Customer.role | Field mapping |

### Farm Service โ’ Master Service
| Source (farms) | Target (master) | Notes |
|----------------|-----------------|-------|
| farms | Farm | Direct mapping |
| houses | House | Direct mapping |
| animals | Flock | Concept mapping |
| genetic_factors | Flock.geneticInfo | JSON field |
| feed_programs | FeedType | Concept mapping |
| environmental_factors | Zone | Concept mapping |
| housing_conditions | Zone | Concept mapping |
| water_quality | Zone | Concept mapping |
| health_records | Flock.healthRecords | JSON field |
| welfare_indicators | Flock.welfareIndicators | JSON field |
| performance_metrics | Flock.performanceMetrics | JSON field |
| operational_records | MasterEvent | Event mapping |

### Devices Service โ’ Master Service
| Source (devices) | Target (master) | Notes |
|------------------|-----------------|-------|
| device_groups | Device.groupId | Field mapping |
| device_types | DeviceType | Direct mapping |
| devices | Device | Direct mapping |
| device_logs | MasterEvent | Event mapping |
| device_status_history | DeviceHealth | Direct mapping |

## ๐ ๏ธ Tools & Scripts

### Migration Scripts
- `migrate-customers.js` - Migrate customer data
- `migrate-farms.js` - Migrate farm data
- `migrate-devices.js` - Migrate device data
- `migrate-feeds.js` - Migrate feed data
- `migrate-formulas.js` - Migrate formula data
- `migrate-economic.js` - Migrate economic data
- `migrate-external-factors.js` - Migrate external factor data

### Validation Scripts
- `validate-migration.js` - Validate migrated data
- `compare-data.js` - Compare source vs target data
- `check-integrity.js` - Check data integrity

### Rollback Scripts
- `rollback-customers.js` - Rollback customer migration
- `rollback-farms.js` - Rollback farm migration
- `rollback-devices.js` - Rollback device migration
- `rollback-feeds.js` - Rollback feed migration
- `rollback-formulas.js` - Rollback formula migration
- `rollback-economic.js` - Rollback economic migration
- `rollback-external-factors.js` - Rollback external factor migration

## โ ๏ธ Risks & Mitigation

### Data Loss Risk
- **Risk**: เธเนเธญเธกเธนเธฅเธชเธนเธเธซเธฒเธขเธฃเธฐเธซเธงเนเธฒเธ migration
- **Mitigation**: Backup เธเนเธญเธกเธนเธฅเธเนเธญเธ migration, เธ—เธ”เธชเธญเธเธเธฑเธ staging environment

### Data Integrity Risk
- **Risk**: เธเนเธญเธกเธนเธฅเนเธกเนเธชเธญเธ”เธเธฅเนเธญเธเธเธฑเธเธซเธฅเธฑเธ migration
- **Mitigation**: เนเธเน validation scripts, เธ•เธฃเธงเธเธชเธญเธ foreign key relationships

### Service Downtime Risk
- **Risk**: Services เธซเธขเธธเธ”เธ—เธณเธเธฒเธเธฃเธฐเธซเธงเนเธฒเธ migration
- **Mitigation**: เนเธเน gradual migration, dual write pattern

### Performance Risk
- **Risk**: Performance เธฅเธ”เธฅเธเธซเธฅเธฑเธ migration
- **Mitigation**: เนเธเน database indexing, query optimization

## ๐“… Timeline

| Phase | Duration | Status |
|-------|----------|--------|
| Phase 1: Data Analysis | 1 week | โ… Completed |
| Phase 2: Scripts Development | 2 weeks | ๐” In Progress |
| Phase 3: Master Service Enhancement | 1 week | โณ Pending |
| Phase 4: Gradual Migration | 3 weeks | โณ Pending |
| Phase 5: Service Deprecation | 1 week | โณ Pending |

**Total Duration: 8 weeks**

## ๐€ Getting Started

1. เธ•เธฃเธงเธเธชเธญเธ prerequisites
2. เธฃเธฑเธ migration scripts เธ•เธฒเธกเธฅเธณเธ”เธฑเธ
3. เธ•เธฃเธงเธเธชเธญเธ data integrity
4. เธ—เธ”เธชเธญเธ API endpoints
5. เธญเธฑเธเน€เธ”เธ• client applications

## ๐“ Support

เธซเธฒเธเธกเธตเธเธฑเธเธซเธฒเธซเธฃเธทเธญเธเธณเธ–เธฒเธกเธฃเธฐเธซเธงเนเธฒเธ migration:
- เธ•เธฃเธงเธเธชเธญเธ logs เนเธ `migration/logs/`
- เนเธเน rollback scripts เธซเธฒเธเธเธณเน€เธเนเธ
- เธ•เธดเธ”เธ•เนเธญ development team

