// ================================
// File: src/consumers/index.ts
// ================================


import { consumer, producer } from '../utils/kafka';
import { routes, dispatch } from './router';
import { logger } from '../utils/logger';
import { env } from '../configs/config';


export async function runConsumers() {
  // --- DIAGNOSTIC: print key env + routes at boot ---
  try {
    console.log('[CFG] env.TOPIC_MASTER_BREED =', env.TOPIC_MASTER_BREED);
    console.log('[CFG] routes =', Object.keys(routes));
  } catch { }


  // Connect producer & consumer first
  try {
    await producer.connect();
    logger.info('kafka-producer-connected');
  } catch (err) {
    logger.error({ err }, 'kafka-producer-connect-failed');
    throw err;
  }


  try {
    await consumer.connect();
    logger.info('kafka-consumer-connected');
  } catch (err) {
    logger.error({ err }, 'kafka-consumer-connect-failed');
    throw err;
  }


  // Compute topics from router keys
  const topics = Object.keys(routes).filter((t) => t && t !== 'undefined');
  if (topics.length === 0) {
    logger.warn('no topics to subscribe (routes empty or env.TOPIC_* missing)');
    return;
  }


  // Subscribe to topics
  for (const topic of topics) {
    try {
      await consumer.subscribe({ topic, fromBeginning: false });
      logger.info({ topic }, 'subscribed');
    } catch (err) {
      logger.error({ err, topic }, 'subscribe-failed');
    }
  }


  // Handle consumer events
  consumer.on('consumer.group_join', (event: any) => {
    logger.info({ groupId: event.payload?.groupId }, 'consumer group joined');
  });
  consumer.on('consumer.crash', (event: any) => {
    logger.error({ error: event.payload?.error }, 'consumer crashed');
  });


  // Start the consumer loop (do not block startup)
  consumer
    .run({
      partitionsConsumedConcurrently: Math.min(6, topics.length),
      eachMessage: async ({ topic, message }) => {
        try {
          await dispatch(topic, message);
        } catch (err) {
          logger.error({ err, topic }, 'dispatch-failed');
        }
      },
    })
    .then(() => logger.info({ topics }, 'consumers-running'))
    .catch((err) => logger.error({ err }, 'consumer-run-failed'));
}

