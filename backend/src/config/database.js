export default {
  port: process.env.PORT || 3000,
  influx: {
    url: process.env.INFLUX_URL || 'http://localhost:8086',
    token: process.env.INFLUX_TOKEN || '',
    org: process.env.INFLUX_ORG || 'miapp',
    bucket: process.env.INFLUX_BUCKET || 'energia'
  },
  sqlite: {
    path: process.env.SQLITE_PATH || './data.db'
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'miapp-secret-key'
  },
  smartlife: {
    apiUrl: process.env.SMARTLIFE_API || 'https://api.smartlife.com',
    username: process.env.SMARTLIFE_USER || '',
    password: process.env.SMARTLIFE_PASS || ''
  }
};