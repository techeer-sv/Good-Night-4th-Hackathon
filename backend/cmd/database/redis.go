package database

import (
	"github.com/printSANO/hackathon4/config"
	"github.com/redis/go-redis/v9"
)

type RedisClient struct {
	Client *redis.Client
}

func NewRedisClient() *RedisClient {
	return &RedisClient{
		Client: redis.NewClient(&redis.Options{
			Addr:     config.GetEnvVarAsString("REDIS_HOST", "localhost:6379"),
			Password: config.GetEnvVarAsString("REDIS_PASSWORD", ""),
			DB:       config.GetEnvVarAsInt("REDIS_DB", 0),
		}),
	}
}
