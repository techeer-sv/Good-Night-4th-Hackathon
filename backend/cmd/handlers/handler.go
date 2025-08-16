package handlers

import "github.com/printSANO/hackathon4/cmd/services"

type Handler struct {
	SeatHandler *SeatHandler
}

func NewHandler(service *services.Service) *Handler {
	return &Handler{
		SeatHandler: NewSeatHandler(service.SeatService),
	}
}
