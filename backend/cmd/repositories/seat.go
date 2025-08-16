package repositories

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"github.com/printSANO/hackathon4/cmd/models"
	"github.com/redis/go-redis/v9"
)

type SeatRepository struct {
	db          *sql.DB
	redisClient *redis.Client
}

func NewSeatRepository(db *sql.DB, redisClient *redis.Client) *SeatRepository {
	return &SeatRepository{db: db, redisClient: redisClient}
}

// GetSeats should return all seats from the database
func (r *SeatRepository) GetSeats() ([]*models.Seat, error) {
	rows, err := r.db.Query("SELECT * FROM seats ORDER BY id ASC")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	seats := []*models.Seat{}

	for rows.Next() {
		var seat models.Seat
		err = rows.Scan(&seat.ID, &seat.Number, &seat.IsAvailable, &seat.CreatedAt, &seat.UpdatedAt)
		if err != nil {
			return nil, err
		}
		seats = append(seats, &seat)
	}
	return seats, nil
}

// GetSeat should return a seat by id
func (r *SeatRepository) GetSeat(id int) (*models.Seat, error) {
	row := r.db.QueryRow("SELECT * FROM seats WHERE id = $1", id)
	var seat models.Seat
	err := row.Scan(&seat.ID, &seat.Number, &seat.IsAvailable, &seat.CreatedAt, &seat.UpdatedAt)
	return &seat, err
}

// CreateSeat should create a new seat in the database in seats table
func (r *SeatRepository) CreateSeat(seat *models.SeatRequest) error {
	_, err := r.db.Exec("INSERT INTO seats (number, is_available) VALUES ($1, $2)", seat.Number, true)
	return err
}

// CheckReservation should check if the seat is reserved by the token
func (r *SeatRepository) CheckReservation(seat *models.SeatRequest, token string) (string, error) {
	pattern := fmt.Sprintf("seat:%d:*", seat.ID)

	var cursor uint64
	var keys []string
	var err error

	for {
		keys, cursor, err = r.redisClient.Scan(context.Background(), cursor, pattern, 10).Result()
		if err != nil {
			return "", err
		}

		if len(keys) > 0 {
			break
		}

		if cursor == 0 {
			break
		}
	}

	if len(keys) == 0 {
		return "", nil
	}

	expectedKey := fmt.Sprintf("seat:%d:%s", seat.ID, token)

	for _, key := range keys {
		if key == expectedKey {
			return "OWN_RESERVATION", nil
		}
	}

	return "RESERVED_BY_OTHER", nil
}

// ReserveSeat should create a temporary reservation in redis with the seat id and unique value with 1 minute expiration
func (r *SeatRepository) ReserveSeat(seat *models.SeatRequest, token string) error {
	_, err := r.redisClient.Set(context.Background(), fmt.Sprintf("seat:%d:%s", seat.ID, token), token, 1*time.Minute).Result()
	return err
}

// UnreserveSeat should remove the temporary reservation from redis
func (r *SeatRepository) UnreserveSeat(seat *models.SeatRequest, token string) error {
	_, err := r.redisClient.Del(context.Background(), fmt.Sprintf("seat:%d:%s", seat.ID, token)).Result()
	return err
}

// BuySeat should create a new row in the reservations table
func (r *SeatRepository) BuySeat(reservation *models.ReservationRequest) error {
	_, err := r.db.Exec("INSERT INTO reservations (seat_id, fname, lname, email) VALUES ($1, $2, $3, $4)", reservation.ID, reservation.Fname, reservation.Lname, reservation.Email)
	return err
}

// CancelReservation should remove the row in the reservations table
func (r *SeatRepository) CancelReservation(reservation *models.ReservationRequest) error {
	_, err := r.db.Exec("DELETE FROM reservations WHERE seat_id = $1", reservation.ID)
	return err
}

func (r *SeatRepository) UpdateSeat(seat *models.SeatRequest, isAvailable bool) error {
	_, err := r.db.Exec("UPDATE seats SET is_available = $1 WHERE id = $2", isAvailable, seat.ID)
	return err
}

// DeleteSeat should delete the seat from the seats table
func (r *SeatRepository) DeleteSeat(id int) error {
	_, err := r.db.Exec("DELETE FROM seats WHERE id = $1", id)
	return err
}
