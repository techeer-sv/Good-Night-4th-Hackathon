package services

import "github.com/printSANO/hackathon4/cmd/repositories"

type Service struct {
	SeatService SeatService
}

func NewService(repo *repositories.Repository) *Service {
	return &Service{
		SeatService: NewSeatService(repo.SeatRepository),
	}
}
