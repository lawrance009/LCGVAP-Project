/**
 * emailWorker.js
 * ============================================================
 * Background worker for processing the Email Queue using BullMQ.
 * Removes email sending from the main HTTP thread to prevent
 * request blocking and timeout issues.
 * ============================================================
 */

const { Worker } = require('bullmq');
const { redisClient, isRedisDisabled } = require('../config/redis');
const logger = require('../utils/logger');
const { sendMailMessage } = require('../utils/mailTransport');

let emailWorker;

const initEmailWorker = () => {
  if (isRedisDisabled() || !redisClient) {
    logger.warn('Email worker not started: Redis is unavailable (fail-soft mode).');
    return;
  }

  emailWorker = new Worker('emailQueue', async (job) => {
    const { to, subject, text, html } = job.data;
    
    logger.info(`Processing email job ${job.id} for ${to}`);

    try {
      const info = await sendMailMessage({ to, subject, text, html });
      logger.info(`Email job ${job.id} sent successfully`);
      return info;
    } catch (error) {
      logger.error(`Email job ${job.id} failed`, { error: error.message });
      throw error; // Let BullMQ handle retries
    }
  }, { 
    connection: redisClient,
    concurrency: 5 // Process up to 5 emails concurrently
  });

  emailWorker.on('completed', (job) => {
    logger.debug(`Job ${job.id} has completed!`);
  });

  emailWorker.on('failed', (job, err) => {
    logger.error(`Job ${job.id} has failed with ${err.message}`);
  });

  logger.info('Email background worker initialized');
};

const closeEmailWorker = async () => {
  if (emailWorker) {
    await emailWorker.close();
    logger.info('Email worker closed gracefully');
  }
};

module.exports = { initEmailWorker, closeEmailWorker };
