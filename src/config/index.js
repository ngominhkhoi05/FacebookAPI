require('dotenv').config();

module.exports = {
  facebook: {
    appId: process.env.FB_APP_ID,
    appSecret: process.env.FB_APP_SECRET,
    pageId: process.env.FB_PAGE_ID,
    accessToken: process.env.FB_ACCESS_TOKEN,
    graphApiVersion: 'v20.0',
    graphApiBase: `https://graph.facebook.com/v20.0`,
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'default_secret_change_me',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },
  admins: process.env.ADMINS ? JSON.parse(process.env.ADMINS) : [],
  server: {
    port: parseInt(process.env.PORT, 10) || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',
  },
};
