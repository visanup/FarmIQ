// frontend\farm-manage-app\src\routes.tsx

import React from 'react';
import { Routes, Route } from 'react-router-dom';

// import ตามโฟลเดอร์จริงที่มี
import FarmList from '@pages/farm/FarmList'; // โฟลเดอร์ชื่อ farm หรือ farms? ถ้าผิดให้แก้
import FarmForm from '@pages/farm/FarmForm';
import FarmListByCustomer from '@pages/farm/FarmListByCustomer';

// import HouseList from '@pages/houseList/HouseList';
// import HouseForm from '@pages/houseList/HouseForm';

// import AnimalList from '@pages/genertic/AnimalList';   // โฟลเดอร์ชื่อ genertic? ถ้าผิดให้แก้
// import AnimalForm from '@pages/genertic/AnimalForm';

// import GeneticFactorList from '@pages/genertic/GeneticFactorList';
// import GeneticFactorForm from '@pages/genertic/GeneticFactorForm';

// import HealthRecordList from '@pages/health/HealthRecordList';
// import HealthRecordForm from '@pages/health/HealthRecordForm';

// import WelfareIndicatorList from '@pages/welfare/WelfareIndicatorList';
// import WelfareIndicatorForm from '@pages/welfare/WelfareIndicatorForm';

// import PerformanceMetricList from '@pages/performance/PerformanceMetricList';
// import PerformanceMetricForm from '@pages/performance/PerformanceMetricForm';

// import FeedProgramList from '@pages/feedProgram/FeedProgramList';
// import FeedProgramForm from '@pages/feedProgram/FeedProgramForm';

// import FeedIntakeList from '@pages/feedProgram/FeedIntakeList'; // ถ้าอยู่โฟลเดอร์อื่นให้แก้ไข
// import FeedIntakeForm from '@pages/feedProgram/FeedIntakeForm';

// import EnvironmentalFactorList from '@pages/environmental/EnvironmentalFactorList';
// import EnvironmentalFactorForm from '@pages/environmental/EnvironmentalFactorForm';

// import HousingConditionList from '@pages/housingCondition/HousingConditionList';
// import HousingConditionForm from '@pages/housingCondition/HousingConditionForm';

// import WaterQualityList from '@pages/waterQuality/WaterQualityList';
// import WaterQualityForm from '@pages/waterQuality/WaterQualityForm';

// import OperationalRecordList from '@pages/operationRecord/OperationalRecordList';
// import OperationalRecordForm from '@pages/operationRecord/OperationalRecordForm';

export default function Router() {
  return (
    <Routes>
      {/* Farms */}
      <Route path="/farms" element={<FarmList />} />
      <Route path="/farms/new" element={<FarmForm />} />
      <Route path="/farms/:id/edit" element={<FarmForm />} />
      <Route path="/customers/:customer_id/farms" element={<FarmListByCustomer />} />

      {/*Houses*/}
      {/* <Route path="/houses" element={<HouseList />} />
      <Route path="/houses/new" element={<HouseForm />} />
      <Route path="/houses/:id/edit" element={<HouseForm />} /> */}

      {/* Animals */}
      {/* <Route path="/animals" element={<AnimalList />} />
      <Route path="/animals/new" element={<AnimalForm />} />
      <Route path="/animals/:id/edit" element={<AnimalForm />} /> */}

      {/* Genetic Factors */}
      {/* <Route path="/genetic-factors" element={<GeneticFactorList />} />
      <Route path="/genetic-factors/new" element={<GeneticFactorForm />} />
      <Route path="/genetic-factors/:id/edit" element={<GeneticFactorForm />} /> */}

      {/* Health Records */}
      {/* <Route path="/health-records" element={<HealthRecordList />} />
      <Route path="/health-records/new" element={<HealthRecordForm />} />
      <Route path="/health-records/:id/edit" element={<HealthRecordForm />} /> */}

      {/* Welfare Indicators */}
      {/* <Route path="/welfare-indicators" element={<WelfareIndicatorList />} />
      <Route path="/welfare-indicators/new" element={<WelfareIndicatorForm />} />
      <Route path="/welfare-indicators/:id/edit" element={<WelfareIndicatorForm />} /> */}

      {/* Performance Metrics */}
      {/* <Route path="/performance-metrics" element={<PerformanceMetricList />} />
      <Route path="/performance-metrics/new" element={<PerformanceMetricForm />} />
      <Route path="/performance-metrics/:id/edit" element={<PerformanceMetricForm />} /> */}

      {/* Feed Programs */}
      {/* <Route path="/feed-programs" element={<FeedProgramList />} />
      <Route path="/feed-programs/new" element={<FeedProgramForm />} />
      <Route path="/feed-programs/:id/edit" element={<FeedProgramForm />} /> */}

      {/* Feed Intake */}
      {/* <Route path="/feed-intake" element={<FeedIntakeList />} />
      <Route path="/feed-intake/new" element={<FeedIntakeForm />} />
      <Route path="/feed-intake/:id/edit" element={<FeedIntakeForm />} /> */}

      {/* Environmental Factors */}
      {/* <Route path="/environmental-factors" element={<EnvironmentalFactorList />} />
      <Route path="/environmental-factors/new" element={<EnvironmentalFactorForm />} />
      <Route path="/environmental-factors/:id/edit" element={<EnvironmentalFactorForm />} /> */}

      {/* Housing Conditions */}
      {/* <Route path="/housing-conditions" element={<HousingConditionList />} />
      <Route path="/housing-conditions/new" element={<HousingConditionForm />} />
      <Route path="/housing-conditions/:id/edit" element={<HousingConditionForm />} /> */}

      {/* Water Quality */}
      {/* <Route path="/water-quality" element={<WaterQualityList />} />
      <Route path="/water-quality/new" element={<WaterQualityForm />} />
      <Route path="/water-quality/:id/edit" element={<WaterQualityForm />} /> */}

      {/* Operational Records */}
      {/* <Route path="/operational-records" element={<OperationalRecordList />} />
      <Route path="/operational-records/new" element={<OperationalRecordForm />} />
      <Route path="/operational-records/:id/edit" element={<OperationalRecordForm />} /> */}
    </Routes>
  );
}

