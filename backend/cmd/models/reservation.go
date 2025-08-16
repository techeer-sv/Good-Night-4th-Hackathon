package models

import "time"

type Reservation struct {
	ID        int       `json:"id"`
	Fname     string    `json:"fname"`
	Lname     string    `json:"lname"`
	Email     string    `json:"email"`
	CreatedAt time.Time `json:"created_at,omitempty"`
	UpdatedAt time.Time `json:"updated_at,omitempty"`
	Seat      Seat      `json:"seat"`
}

type ReservationRequest struct {
	ID    int    `json:"id"`
	Fname string `json:"fname"`
	Lname string `json:"lname"`
	Email string `json:"email,omitempty"`
}
