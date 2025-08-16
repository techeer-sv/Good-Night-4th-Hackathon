package models

import "time"

type Seat struct {
	ID          int       `json:"id"`
	Number      int       `json:"number"`
	IsAvailable bool      `json:"is_available"`
	CreatedAt   time.Time `json:"created_at,omitempty"`
	UpdatedAt   time.Time `json:"updated_at,omitempty"`
}

type SeatResponse struct {
	ID          int  `json:"id"`
	Number      int  `json:"number"`
	IsAvailable bool `json:"is_available"`
}

type SeatRequest struct {
	ID     int `json:"id"`
	Number int `json:"number"`
}
