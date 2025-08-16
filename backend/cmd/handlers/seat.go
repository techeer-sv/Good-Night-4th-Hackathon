package handlers

import (
	"fmt"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/printSANO/hackathon4/cmd/models"
	"github.com/printSANO/hackathon4/cmd/services"
)

type SeatHandler struct {
	service services.SeatService
}

func NewSeatHandler(service services.SeatService) *SeatHandler {
	return &SeatHandler{service: service}
}

// @Summary Get all seats
// @Description Get all seats
// @Accept json
// @Produce json
// @Success 200 {array} models.Seat
// @Router /seats [get]
func (h *SeatHandler) GetSeats(c *gin.Context) {
	seats, err := h.service.GetSeats()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, seats)
}

// @Summary Get a seat
// @Description Get a seat by number
// @Accept json
// @Produce json
// @Param id path string true "Seat ID"
// @Success 200 {object} models.Seat
// @Router /seats/{id} [get]
func (h *SeatHandler) GetSeat(c *gin.Context) {
	idStr := c.Param("id")
	if idStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "seat id is required"})
		return
	}

	// Convert string to int
	var id int
	_, err := fmt.Sscanf(idStr, "%d", &id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid seat id format"})
		return
	}

	seat, err := h.service.GetSeat(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, seat)
}

// @Summary Create a seat
// @Description Create a seat
// @Accept json
// @Produce json
// @Param seat body models.SeatRequest true "Seat"
// @Success 200 {object} models.SeatRequest
// @Router /seats [post]
func (h *SeatHandler) CreateSeat(c *gin.Context) {
	seat := &models.SeatRequest{}
	if err := c.ShouldBindJSON(seat); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	err := h.service.CreateSeat(seat)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, seat)
}

// @Summary Reserve a seat
// @Description Reserve a seat
// @Accept json
// @Produce json
// @Param seat body models.SeatRequest true "Seat"
// @Success 200 {object} models.SeatRequest
// @Router /seats/reserve [post]
// this function should check if the seat is available by first checking redis and then checking the database
// if the seat is available, it should store the seat in redis and return the seat
// if the seat is not available, it should return an error
func (h *SeatHandler) ReserveSeat(c *gin.Context) {
	seat := &models.SeatRequest{}
	if err := c.ShouldBindJSON(seat); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	err := h.service.ReserveSeat(seat, c.MustGet("hackathon4_token").(string))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, seat)
}

// @Summary Unreserve a seat
// @Description Unreserve a seat
// @Accept json
// @Produce json
// @Param seat body models.SeatRequest true "Seat"
// @Success 200 {object} models.SeatRequest
// @Router /seats/unreserve [delete]
// this function should check if the seat is reserved by first checking redis and then checking the database
// if the seat is reserved, it should remove the seat from redis and return the seat
// if the seat is not reserved, it should return an error
func (h *SeatHandler) UnreserveSeat(c *gin.Context) {
	seat := &models.SeatRequest{}
	if err := c.ShouldBindJSON(seat); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	err := h.service.UnreserveSeat(seat, c.MustGet("hackathon4_token").(string))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, seat)
}

// @Summary Cancel a reservation
// @Description Cancel a reservation
// @Accept json
// @Produce json
// @Param seat body models.ReservationRequest true "Reservation"
// @Success 200 {object} models.ReservationRequest
// @Router /seats/cancel [delete]
// this function should check if the seat is bought in database and then cancel the reservation
// if the seat is not bought, it should return an error
func (h *SeatHandler) CancelReservation(c *gin.Context) {
	reservation := &models.ReservationRequest{}
	if err := c.ShouldBindJSON(reservation); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, reservation)
}

// @Summary Buy a seat
// @Description Buy a seat
// @Accept json
// @Produce json
// @Param seat body models.ReservationRequest true "Reservation"
// @Success 200 {object} models.ReservationRequest
// @Router /seats/buy [post]
// this function should check if the seat is available by first checking redis and then checking the database
// if the seat is available, it should buy the ticket by creating a new row in the reservations table
// if the seat is not available, it should return an error
func (h *SeatHandler) BuySeat(c *gin.Context) {
	reservation := &models.ReservationRequest{}
	if err := c.ShouldBindJSON(reservation); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	err := h.service.BuySeat(reservation, c.MustGet("hackathon4_token").(string))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, reservation)
}

// @Summary Delete a seat
// @Description Delete a seat
// @Accept json
// @Produce json
// @Param id path string true "Seat ID"
// @Success 200 {object} models.Seat
// @Router /seats/{id} [delete]
func (h *SeatHandler) DeleteSeat(c *gin.Context) {
	idStr := c.Param("id")
	if idStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "seat id is required"})
		return
	}

	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid seat id format"})
		return
	}

	err = h.service.DeleteSeat(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Seat deleted successfully"})
}
