package com.mediconnect.controller;

import com.mediconnect.dto.AuthResponse;
import com.mediconnect.dto.DoctorRegisterRequest;
import com.mediconnect.dto.LoginRequest;
import com.mediconnect.dto.PatientRegisterRequest;
import com.mediconnect.entity.Doctor;
import com.mediconnect.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register/patient")
    public ResponseEntity<AuthResponse> registerPatient(@Valid @RequestBody PatientRegisterRequest request) {
        return ResponseEntity.ok(authService.registerPatient(request));
    }

    @PostMapping("/register/doctor")
    public ResponseEntity<?> registerDoctor(@Valid @RequestBody DoctorRegisterRequest request) {
        authService.registerDoctor(request);
        return ResponseEntity.ok().body(java.util.Collections.singletonMap("message", "Registration successful. Please wait for admin approval."));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @GetMapping("/search/doctors")
    public ResponseEntity<List<Doctor>> searchDoctors(@RequestParam(name = "keyword", required = false) String keyword) {
        return ResponseEntity.ok(authService.searchDoctors(keyword));
    }
}
