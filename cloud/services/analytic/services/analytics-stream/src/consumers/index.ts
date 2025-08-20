// src/consumers/index.ts

import { consumer } from '../utils/kafka';
import { routes, dispatch } from './router';
import { logger } from '../utils/logger';

export async function runConsumers() {
  // ดึงชื่อ topic ทั้งหมดจาก routes และคัดของเสียทิ้ง
  const topics = Object.keys(routes).filter(t => t && t !== 'undefined');

  if (topics.length === 0) {
    logger.warn('no topics to subscribe (routes empty or env.TOPIC_* missing)');
    return;
  }

  for (const topic of topics) {
    try {
      await consumer.subscribe({ topic, fromBeginning: false });
      logger.info({ topic }, 'subscribed');
    } catch (err) {
      logger.error({ err, topic }, 'subscribe-failed');
    }
  }

  await consumer.run({
    // ปรับตามทรัพยากรได้
    partitionsConsumedConcurrently: Math.min(6, topics.length),
    eachMessage: async ({ topic, message }) => {
      try {
        await dispatch(topic, message);
      } catch (err) {
        logger.error({ err, topic }, 'dispatch-failed');
      }
    },
  });

  logger.info({ topics }, '🟢 consumers running');
}
