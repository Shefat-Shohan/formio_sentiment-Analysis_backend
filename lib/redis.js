import "dotenv/config";
import Redis from "ioredis";
const getRedisUrl = () => {
  if (process.env.REDIS_URL) {
    return process.env.REDIS_URL;
  }
  throw new Error("REDIS_URL is not defined");
};

export const redisClient = new Redis(getRedisUrl(), {
  maxRetriesPerRequest: null,
});
