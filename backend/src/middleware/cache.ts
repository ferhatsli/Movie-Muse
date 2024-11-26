import { RedisClientType } from 'redis';

export const cacheMiddleware = (redisClient: RedisClientType | null) => 
  async <T>(
    key: string,
    callback: () => Promise<T>,
    expiration: number = 3600
  ): Promise<T> => {
    try {
      if (redisClient) {
        const cachedData = await redisClient.get(key);
        if (cachedData) {
          return JSON.parse(cachedData);
        }

        const freshData = await callback();
        await redisClient.setEx(key, expiration, JSON.stringify(freshData));
        return freshData;
      }
      return await callback();
    } catch (error) {
      console.error('Cache error:', error);
      return await callback();
    }
  }; 