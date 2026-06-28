const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const mongoSanitize = require('express-mongo-sanitize');
const passport = require('passport');
const swaggerUi = require('swagger-ui-express');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@as-integrations/express4');

const { apiLimiter } = require('./middleware/rateLimit.middleware');
const { errorHandler, notFound } = require('./middleware/error.middleware');
const logger = require('./config/logger');
const swaggerSpec = require('./config/swagger');
const { typeDefs } = require('./graphql/schema');
const { resolvers } = require('./graphql/resolvers');
const { createContext } = require('./graphql/context');

// Route imports
const authRoutes = require('./routes/auth.routes');
const issueRoutes = require('./routes/issue.routes');
const userRoutes = require('./routes/user.routes');
const uploadRoutes = require('./routes/upload.routes');
const notificationRoutes = require('./routes/notification.routes');
const webhookRoutes = require('./routes/webhook.routes');
const analyticsRoutes = require('./routes/analytics.routes');

// Anti-Fraud & Authority Bridge & Environment
const verifyRoutes = require('./routes/verify.routes');
const councillorRoutes = require('./routes/councillor.routes');
const transparencyRoutes = require('./routes/transparency.routes');
const environmentRoutes = require('./routes/environment.routes');
const agentRoutes = require('./routes/agent.routes');
const complaintRoutes = require('./routes/complaint.routes');

require('./config/passport');

const app = express();

// ── Security Middleware ───────────────────────────────────────────────────────
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https:'],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
}));

const allowedOrigins = [
  process.env.CLIENT_URL,
  'https://community-hero-client.onrender.com',
  'http://localhost:5173',
  'http://localhost:3000',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // allow non-browser requests (curl, Postman, server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: Origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ── Request Parsing ───────────────────────────────────────────────────────────
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(mongoSanitize());

// ── Logging ───────────────────────────────────────────────────────────────────
app.use(morgan('combined', {
  stream: { write: (msg) => logger.http(msg.trim()) },
}));

// ── Passport ──────────────────────────────────────────────────────────────────
app.use(passport.initialize());

// ── Rate Limiting ─────────────────────────────────────────────────────────────
app.use('/api/', apiLimiter);

// ── Health Check ──────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  });
});

// ── Swagger Docs ──────────────────────────────────────────────────────────────
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Community Hero API Docs',
}));

// ── REST Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/users', userRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/webhooks', webhookRoutes);

// Anti-Fraud & Authority Bridge & Environment
app.use('/api/verify', verifyRoutes);
app.use('/api/councillor', councillorRoutes);
app.use('/api/transparency', transparencyRoutes);
app.use('/api/environment', environmentRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/economics', require('./routes/economics.routes'));
app.use('/api/listening', require('./routes/listening.routes'));
app.use('/api/analytics', analyticsRoutes);

let graphqlMiddleware = null;

async function initApollo() {
  const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
    formatError: (err) => {
      logger.error('GraphQL Error:', err);
      return {
        message: err.message,
        code: err.extensions?.code || 'INTERNAL_ERROR',
        path: err.path,
      };
    },
    introspection: process.env.NODE_ENV !== 'production',
  });
  await apolloServer.start();
  graphqlMiddleware = expressMiddleware(apolloServer, { context: createContext });
  return apolloServer;
}

initApollo().catch((err) => logger.error('Apollo init failed:', err));

app.use('/graphql', (req, res, next) => {
  if (graphqlMiddleware) {
    return graphqlMiddleware(req, res, next);
  }
  next(new Error('GraphQL Server not initialized yet'));
});

// ── Error Handlers ────────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

module.exports = app;
