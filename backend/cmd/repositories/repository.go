package repositories

import (
	"database/sql"

	"github.com/redis/go-redis/v9"
)

type Repository struct {
	SeatRepository *SeatRepository
}

func NewRepository(db *sql.DB, redisClient *redis.Client) *Repository {
	return &Repository{
		SeatRepository: NewSeatRepository(db, redisClient),
	}
}
