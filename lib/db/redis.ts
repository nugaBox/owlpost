// OwlPost - Redis 클라이언트

import { createClient } from "redis";
import { config } from "@/lib/config";

let redisClient: ReturnType<typeof createClient> | null = null;

export async function getRedisClient() {
  if (!config.redis.enabled) {
    return null;
  }

  if (!redisClient) {
    redisClient = createClient({
      url: config.redis.url,
    });

    redisClient.on("error", (err) => {
      console.error("Redis Client Error:", err);
    });

    await redisClient.connect();
  }

  return redisClient;
}

export async function closeRedisClient() {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
}

