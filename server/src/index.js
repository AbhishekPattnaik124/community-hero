require('dotenv').config();
const http = require('http');
const app = require('./app');
const { connectDB } = require('./config/db');
const { connectRedis } = require('./config/redis');

const { errorHandler, notFound } = require('./middleware/error.middleware');

const { initSocket } = require('./services/socket.service');
const logger = require('./config/logger');
const { startJobs } = require('./jobs');
// const { initializeAgents } = require('./agents/civicMind');

const PORT = process.env.PORT || 5000;

async function bootstrap() {
  try {
    // Connect to MongoDB
    await connectDB();
    logger.info('✅ MongoDB connected');

    // Auto-seed on first deploy (if DB is empty)
    try {
      const User = require('./models/User.model');
      const count = await User.countDocuments();
      if (count === 0) {
        logger.info('📭 Empty database detected — running auto-seed...');
        const seed = require('./seeds/seedDatabase');
        if (typeof seed.runSeed === 'function') {
          await seed.runSeed();
        } else {
          logger.warn('seedDatabase.js does not export runSeed(); skipping auto-seed');
        }
        logger.info('🌱 Auto-seed complete');
      } else {
        logger.info(`📊 Database has ${count} users — skipping auto-seed`);
      }
    } catch (seedErr) {
      logger.warn(`⚠️ Auto-seed failed (non-fatal): ${seedErr.message}`);
    }

    // Connect to Redis (Optional in dev)
    try {
      await connectRedis();
      logger.info('✅ Redis connected');
    } catch (redisErr) {
      logger.warn('⚠️ Redis connection failed. Running without cache.');
    }

    // Initialize Agents
    // try {
    //   await initializeAgents();
    // } catch (e) {
    //   logger.warn('Could not initialize agents: ' + e.message);
    // }

    // Create HTTP server
    const server = http.createServer(app);

    // Initialize Socket.io
    initSocket(server);
    logger.info('✅ Socket.io initialized');

    // Start Social Listening Engine
    const { connectKafka } = require('./config/kafka');
    const listeningService = require('./services/listeningService');
    await connectKafka();
    listeningService.startEngine();
    logger.info('✅ Social Listening Engine started');

    // Start cron jobs
    startJobs();
    logger.info('✅ Cron jobs started');

    server.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT} [${process.env.NODE_ENV}]`);
      logger.info(`📚 Swagger docs: http://localhost:${PORT}/api/docs`);
      logger.info(`🔮 GraphQL: http://localhost:${PORT}/graphql`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => gracefulShutdown(server));
    process.on('SIGINT', () => gracefulShutdown(server));
  } catch (err) {
    console.error('\n\n!!! FATAL BOOTSTRAP ERROR !!!');
    console.error(err);
    console.error(err.stack);
    console.error('!!! FATAL BOOTSTRAP ERROR !!!\n\n');
    logger.error('❌ Bootstrap failed:', err);
    setTimeout(() => { process.exit(1); }, 2000);
  }
}

function gracefulShutdown(server) {
  logger.info('🛑 Graceful shutdown initiated...');
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
}

bootstrap();

// trigger restart
