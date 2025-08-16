package com.example.demo.dto;

public class ReservationRequest {
    private String reservedBy;
    private String selectedBy;

    public ReservationRequest() {}

    public ReservationRequest(String reservedBy, String selectedBy) {
        this.reservedBy = reservedBy;
        this.selectedBy = selectedBy;
    }

    public String getReservedBy() {
        return reservedBy;
    }

    public void setReservedBy(String reservedBy) {
        this.reservedBy = reservedBy;
    }

    public String getSelectedBy() {
        return selectedBy;
    }

    public void setSelectedBy(String selectedBy) {
        this.selectedBy = selectedBy;
    }
}