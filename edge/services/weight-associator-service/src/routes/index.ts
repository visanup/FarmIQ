// src/routes/index.ts

import { Router } from 'express';
import associate from './associate.route';
import associations from './associations.route';

const r = Router();
r.use(associate);
r.use(associations);
export default r;



