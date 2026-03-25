package com.mediconnect.service;

import com.mediconnect.dto.AuthResponse;
import com.mediconnect.dto.DoctorRegisterRequest;
import com.mediconnect.dto.LoginRequest;
import com.mediconnect.dto.PatientRegisterRequest;
import com.mediconnect.entity.Doctor;
import com.mediconnect.entity.Patient;
import com.mediconnect.entity.Role;
import com.mediconnect.entity.User;
import com.mediconnect.repository.DoctorRepository;
import com.mediconnect.repository.PatientRepository;
import com.mediconnect.repository.UserRepository;
import com.mediconnect.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthResponse registerPatient(PatientRegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already exists");
        }
        if (patientRepository.existsByMobile(request.getMobile())) {
            throw new IllegalArgumentException("Mobile number already exists");
        }

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.ROLE_PATIENT)
                .active(true)
                .build();

        String patientId = "MC-P-" + (1000 + (int)(Math.random() * 9000));
        
        Patient patient = Patient.builder()
                .name(request.getName())
                .mobile(request.getMobile())
                .patientIdentifier(patientId)
                .user(user)
                .build();

        patientRepository.save(patient);
        String jwtToken = jwtService.generateToken(user);

        return AuthResponse.builder()
                .token(jwtToken)
                .role(Role.ROLE_PATIENT)
                .email(user.getEmail())
                .name(patient.getName())
                .build();
    }

    public AuthResponse registerDoctor(DoctorRegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already exists");
        }
        if (doctorRepository.existsByMobile(request.getMobile())) {
            throw new IllegalArgumentException("Mobile number already exists");
        }
        if (doctorRepository.existsByDoctorId(request.getDoctorId())) {
            throw new IllegalArgumentException("Doctor ID already exists");
        }

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.ROLE_DOCTOR)
                .active(false) // Doctors need admin approval, user account is inactive initially
                .build();

        Doctor doctor = Doctor.builder()
                .name(request.getName())
                .mobile(request.getMobile())
                .doctorId(request.getDoctorId())
                .specialization(request.getSpecialization())
                .experience(request.getExperience())
                .rating(0.0)
                .verificationStatus(Doctor.VerificationStatus.PENDING)
                .user(user)
                .build();

        doctorRepository.save(doctor);
        // Do not generate token as account is inactive pending verification

        return AuthResponse.builder()
                .token(null)
                .role(Role.ROLE_DOCTOR)
                .email(user.getEmail())
                .name(doctor.getName())
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );
        var user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));
                
        if (!user.isActive()) {
             throw new IllegalArgumentException("Account is inactive pending verification or disabled by admin.");
        }

        String jwtToken = jwtService.generateToken(user);
        String name = "";
        if (user.getRole() == Role.ROLE_PATIENT) {
            name = patientRepository.findByUserEmail(user.getEmail())
                    .map(Patient::getName).orElse("");
        } else if (user.getRole() == Role.ROLE_DOCTOR) {
             name = doctorRepository.findByUserEmail(user.getEmail())
                    .map(Doctor::getName).orElse("");
        } else if (user.getRole() == Role.ROLE_ADMIN) {
             name = "Administrator";
        }

        return AuthResponse.builder()
                .token(jwtToken)
                .role(user.getRole())
                .email(user.getEmail())
                .name(name)
                .build();
    }

    public List<Doctor> searchDoctors(String keyword) {
        return doctorRepository.findByVerificationStatus(Doctor.VerificationStatus.VERIFIED)
                .stream()
                .filter(d -> keyword == null || keyword.isBlank() ||
                             d.getName().toLowerCase().contains(keyword.toLowerCase()) ||
                             d.getSpecialization().toLowerCase().contains(keyword.toLowerCase()))
                .collect(Collectors.toList());
    }
}
