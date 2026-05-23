const app = require('./app');
const config = require('./config');
const logger = require('./config/logger');
const fs = require('fs');
const path = require('path');

const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

app.listen(config.server.port, () => {
  logger.info(`========================================`);
  logger.info(`Facebook API Backend started`);
  logger.info(`Environment : ${config.server.nodeEnv}`);
  logger.info(`Port         : ${config.server.port}`);
  logger.info(`FB Page ID   : ${config.facebook.pageId}`);
  logger.info(`========================================`);
});
