package com.mediconnect.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class PrescriptionRequest {
    @NotBlank(message = "Diagnosis is required")
    private String diagnosis;
    
    @NotBlank(message = "Medicines are required")
    private String medicines;
    
    private String notes;
}
