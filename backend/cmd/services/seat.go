package services

import (
	"errors"

	"github.com/printSANO/hackathon4/cmd/models"
	"github.com/printSANO/hackathon4/cmd/repositories"
)

type SeatService interface {
	GetSeats() ([]*models.Seat, error)
	GetSeat(id int) (*models.Seat, error)
	CreateSeat(seat *models.SeatRequest) error
	ReserveSeat(seat *models.SeatRequest, token string) error
	UnreserveSeat(seat *models.SeatRequest, token string) error
	BuySeat(reservation *models.ReservationRequest, token string) error
	CancelReservation(reservation *models.ReservationRequest) error
	DeleteSeat(id int) error
}

type seatService struct {
	seatRepository *repositories.SeatRepository
}

func NewSeatService(repo *repositories.SeatRepository) SeatService {
	return &seatService{
		seatRepository: repo,
	}
}

func (s *seatService) GetSeats() ([]*models.Seat, error) {
	return s.seatRepository.GetSeats()
}

func (s *seatService) GetSeat(id int) (*models.Seat, error) {
	return s.seatRepository.GetSeat(id)
}

func (s *seatService) CreateSeat(seat *models.SeatRequest) error {
	return s.seatRepository.CreateSeat(seat)
}

func (s *seatService) ReserveSeat(seat *models.SeatRequest, token string) error {
	checkSeat, err := s.seatRepository.GetSeat(seat.ID)
	if err != nil {
		return err
	}
	if !checkSeat.IsAvailable {
		return errors.New("seat is not available")
	}
	reservation, err := s.seatRepository.CheckReservation(seat, token)
	if err != nil {
		return err
	}
	if reservation == "RESERVED_BY_OTHER" {
		return errors.New("seat is already reserved by other user")
	}
	if reservation == "OWN_RESERVATION" {
		return errors.New("seat is already reserved by you")
	}
	err = s.seatRepository.ReserveSeat(seat, token)
	if err != nil {
		return err
	}
	return nil
}

func (s *seatService) UnreserveSeat(seat *models.SeatRequest, token string) error {
	reservation, err := s.seatRepository.CheckReservation(seat, token)
	if err != nil {
		return err
	}
	if reservation == "RESERVED_BY_OTHER" {
		return errors.New("seat is not reserved by you")
	}
	return s.seatRepository.UnreserveSeat(seat, token)
}

func (s *seatService) BuySeat(reservation *models.ReservationRequest, token string) error {
	var seat models.SeatRequest
	seat.ID = reservation.ID
	isReserved, err := s.seatRepository.CheckReservation(&seat, token)
	if err != nil {
		return err
	}
	if isReserved == "RESERVED_BY_OTHER" {
		return errors.New("can not buy that seat because it is reserved by other user")
	}
	if isReserved == "" {
		return errors.New("can not buy that seat because it is not reserved")
	}
	err = s.seatRepository.BuySeat(reservation)
	if err != nil {
		return err
	}
	err = s.seatRepository.UpdateSeat(&seat, false)
	if err != nil {
		return err
	}
	return nil
}

func (s *seatService) CancelReservation(reservation *models.ReservationRequest) error {
	return s.seatRepository.CancelReservation(reservation)
}

func (s *seatService) DeleteSeat(id int) error {
	return s.seatRepository.DeleteSeat(id)
}
