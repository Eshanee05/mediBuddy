package com.mediconnect.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AdminDashboardStats {
    private long totalPatients;
    private long totalDoctors;
    private long totalAppointments;
}
