package com.mediconnect.controller;

import com.mediconnect.dto.AppointmentRequest;
import com.mediconnect.entity.Appointment;
import com.mediconnect.entity.Doctor;
import com.mediconnect.entity.MedicalFile;
import com.mediconnect.entity.MedicalRecord;
import com.mediconnect.entity.Patient;
import com.mediconnect.service.DoctorService;
import com.mediconnect.service.PatientService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@RestController
@RequestMapping("/api/v1/patient")
@PreAuthorize("hasRole('PATIENT')")
@RequiredArgsConstructor
public class PatientController {

    private final PatientService patientService;
    private final DoctorService doctorService;

    @GetMapping("/doctors/{id}/slots")
    public ResponseEntity<List<LocalTime>> getAvailableSlots(
            @PathVariable(name = "id") Long id,
            @RequestParam(name = "date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(doctorService.getAvailableSlots(id, date));
    }

    @GetMapping("/profile")
    public ResponseEntity<Patient> getProfile(Authentication auth) {
        return ResponseEntity.ok(patientService.getPatientProfile(auth.getName()));
    }

    @GetMapping("/doctors/search")
    public ResponseEntity<List<Doctor>> searchDoctors(@RequestParam(name = "keyword", required = false) String keyword) {
        return ResponseEntity.ok(patientService.searchDoctors(keyword));
    }

    @PostMapping("/appointments/book")
    public ResponseEntity<Appointment> bookAppointment(
            @Valid @RequestBody AppointmentRequest request,
            Authentication auth) {
        return ResponseEntity.ok(patientService.bookAppointment(auth.getName(), request));
    }

    @GetMapping("/appointments")
    public ResponseEntity<List<Appointment>> getMyAppointments(Authentication auth) {
        return ResponseEntity.ok(patientService.getMyAppointments(auth.getName()));
    }

    @GetMapping("/medical-history")
    public ResponseEntity<List<MedicalRecord>> getMedicalHistory(Authentication auth) {
        return ResponseEntity.ok(patientService.getMedicalHistory(auth.getName()));
    }

    @PostMapping("/medical-files/upload")
    public ResponseEntity<MedicalFile> uploadMedicalFile(
            @RequestParam("file") MultipartFile file,
            Authentication auth) {
        return ResponseEntity.ok(patientService.uploadMedicalFile(auth.getName(), file));
    }

    @GetMapping("/medical-files")
    public ResponseEntity<List<MedicalFile>> getMyMedicalFiles(Authentication auth) {
        return ResponseEntity.ok(patientService.getMyMedicalFiles(auth.getName()));
    }
}
