package com.mediconnect.controller;

import com.mediconnect.dto.PrescriptionRequest;
import com.mediconnect.entity.*;
import com.mediconnect.service.DoctorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/doctor")
@PreAuthorize("hasRole('DOCTOR')")
@RequiredArgsConstructor
public class DoctorController {

    private final DoctorService doctorService;

    @GetMapping("/profile")
    public ResponseEntity<Doctor> getProfile(Authentication auth) {
        return ResponseEntity.ok(doctorService.getDoctorProfile(auth.getName()));
    }

    @GetMapping("/appointments/today")
    public ResponseEntity<List<Appointment>> getTodayAppointments(Authentication auth) {
        return ResponseEntity.ok(doctorService.getTodayAppointments(auth.getName()));
    }

    @GetMapping("/appointments")
    public ResponseEntity<List<Appointment>> getAllAppointments(Authentication auth) {
        return ResponseEntity.ok(doctorService.getAllAppointments(auth.getName()));
    }

    @PutMapping("/appointments/{id}/status")
    public ResponseEntity<?> updateAppointmentStatus(
            @PathVariable(name = "id") Long id, 
            @RequestParam(name = "status") Appointment.AppointmentStatus status,
            Authentication auth) {
        doctorService.updateAppointmentStatus(auth.getName(), id, status);
        return ResponseEntity.ok(java.util.Collections.singletonMap("message", "Appointment status updated"));
    }

    @PostMapping("/appointments/{id}/prescription")
    public ResponseEntity<Prescription> createPrescription(
            @PathVariable(name = "id") Long id,
            @Valid @RequestBody PrescriptionRequest request,
            Authentication auth) {
        return ResponseEntity.ok(doctorService.createPrescription(auth.getName(), id, request));
    }
    
    @GetMapping("/records")
    public ResponseEntity<List<MedicalRecord>> getPatientRecords(Authentication auth) {
        return ResponseEntity.ok(doctorService.getPatientRecords(auth.getName()));
    }

    @PostMapping("/availability")
    public ResponseEntity<?> setAvailability(@RequestBody List<DoctorAvailability> availabilities, Authentication auth) {
        doctorService.setAvailability(auth.getName(), availabilities);
        return ResponseEntity.ok(java.util.Collections.singletonMap("message", "Availability updated successfully"));
    }

    @GetMapping("/availability")
    public ResponseEntity<List<DoctorAvailability>> getAvailability(Authentication auth) {
        return ResponseEntity.ok(doctorService.getAvailability(auth.getName()));
    }

    @PostMapping("/upload-clinical-file/{patientId}")
    public ResponseEntity<MedicalFile> uploadFileForPatient(
            @PathVariable(name = "patientId") Long patientId,
            @RequestParam("file") MultipartFile file,
            Authentication auth) {
        return ResponseEntity.ok(doctorService.uploadPatientFile(auth.getName(), patientId, file));
    }
}
