// src/routes/sensor.route.ts
import { Router, Request, Response, NextFunction } from 'express';
import { SensorService } from '../services/sensor.service';

const sensorRouter = Router();
const sensorService = new SensorService();

/** GET /api/sensor-data */
sensorRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const list = await sensorService.findAll();
    res.json(list);
  } catch (err) {
    next(err);
  }
});

/** GET /api/sensor-data */
// expects query params time, device_id, topic
sensorRouter.get('/item', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { time, device_id, topic } = req.query;
    const item = await sensorService.findOne(new Date(time as string), Number(device_id), topic as string);
    if (!item) return res.status(404).json({ message: 'SensorData not found' });
    res.json(item);
  } catch (err) {
    next(err);
  }
});

/** POST /api/sensor-data */
sensorRouter.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = req.body;
    const newItem = await sensorService.create(data);
    res.status(201).json(newItem);
  } catch (err) {
    next(err);
  }
});

/** PUT /api/sensor-data */
// expects time, device_id, topic in body to identify record
sensorRouter.put('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { time, device_id, topic, ...data } = req.body;
    const updated = await sensorService.update(new Date(time), device_id, topic, data);
    if (!updated) return res.status(404).json({ message: 'SensorData not found' });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

/** DELETE /api/sensor-data */
// expects time, device_id, topic in query
sensorRouter.delete('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { time, device_id, topic } = req.query;
    await sensorService.delete(new Date(time as string), Number(device_id), topic as string);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default sensorRouter;