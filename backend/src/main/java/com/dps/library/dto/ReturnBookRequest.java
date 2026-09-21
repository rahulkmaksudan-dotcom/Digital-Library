package com.dps.library.dto;

public class ReturnBookRequest {
    private String notes;
    private String paymentMethod; // if paying overdue fine immediately

    public ReturnBookRequest() {}

    public ReturnBookRequest(String notes) {
        this.notes = notes;
    }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
}

