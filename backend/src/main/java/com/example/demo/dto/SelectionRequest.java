package com.example.demo.dto;

public class SelectionRequest {
    private String selectedBy;

    public SelectionRequest() {}

    public SelectionRequest(String selectedBy) {
        this.selectedBy = selectedBy;
    }

    public String getSelectedBy() {
        return selectedBy;
    }

    public void setSelectedBy(String selectedBy) {
        this.selectedBy = selectedBy;
    }
}