const redisConfig = {
  port: 6379,
  host: "localhost",
  password: process.env.REDIS_PASSWORD,
  enableOfflineQueue: false,
};
exports.redisConfig = redisConfig;
