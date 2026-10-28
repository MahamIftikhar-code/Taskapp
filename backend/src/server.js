const mongoose = require('mongoose');
const app = require('./app');

const PORT = Number(process.env.PORT) || 5000;
const RETRY_DELAY_MS = 3000;

function buildMongoUri() {
  if (process.env.MONGO_URI) return process.env.MONGO_URI;

  const { MONGO_USER, MONGO_PASSWORD, MONGO_HOST = 'localhost', MONGO_PORT = '27017', MONGO_DB = 'taskdb' } = process.env;
  const credentials = MONGO_USER
    ? `${encodeURIComponent(MONGO_USER)}:${encodeURIComponent(MONGO_PASSWORD || '')}@`
    : '';
  const authSource = MONGO_USER ? '?authSource=admin' : '';
  return `mongodb://${credentials}${MONGO_HOST}:${MONGO_PORT}/${MONGO_DB}${authSource}`;
}

async function connectWithRetry(uri) {
  for (;;) {
    try {
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
      console.log('Connected to MongoDB');
      return;
    } catch (err) {
      console.error(`MongoDB connection failed: ${err.message}. Retrying in ${RETRY_DELAY_MS / 1000}s...`);
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
    }
  }
}

// Start listening immediately so liveness probes pass while the database comes up.
const server = app.listen(PORT, () => console.log(`API listening on port ${PORT}`));
connectWithRetry(buildMongoUri());

function shutdown(signal) {
  console.log(`${signal} received, shutting down`);
  server.close(async () => {
    await mongoose.disconnect();
    process.exit(0);
  });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
