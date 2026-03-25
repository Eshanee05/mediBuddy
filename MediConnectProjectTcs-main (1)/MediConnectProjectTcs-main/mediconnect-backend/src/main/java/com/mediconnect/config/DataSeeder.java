package com.mediconnect.config;

import com.mediconnect.entity.Doctor;
import com.mediconnect.entity.DoctorAvailability;
import com.mediconnect.entity.Role;
import com.mediconnect.entity.User;
import com.mediconnect.repository.DoctorAvailabilityRepository;
import com.mediconnect.repository.DoctorRepository;
import com.mediconnect.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final DoctorRepository doctorRepository;
    private final DoctorAvailabilityRepository availabilityRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (!userRepository.existsByEmail("admin@mediconnect.com")) {
            log.info("Seeding Admin data...");

            // Create Admin
            User admin = User.builder()
                    .email("admin@mediconnect.com")
                    .password(passwordEncoder.encode("Admin@123"))
                    .role(Role.ROLE_ADMIN)
                    .active(true)
                    .build();
            userRepository.save(admin);
            log.info("Admin created: admin@mediconnect.com / Admin@123");
        }

        log.info("Current doctor count: {}", doctorRepository.count());
        if (doctorRepository.count() == 0) {
            log.info("Seeding sample doctors...");
            // Create Sample Doctors
            createDoctor("Dr. Sarah Jane", "sarah@mediconnect.com", "9876543210", "MMC1001", "Cardiology", 15, 4.8);
            createDoctor("Dr. Michael Chen", "michael@mediconnect.com", "9876543211", "MMC1002", "Neurology", 10, 4.5);
            createDoctor("Dr. Emily Davis", "emily@mediconnect.com", "9876543212", "MMC1003", "Pediatrics", 8, 4.9);
            createDoctor("Dr. Robert Wilson", "robert@mediconnect.com", "9876543213", "MMC1004", "Orthopedics", 20, 4.7);
            createDoctor("Dr. Lisa Patel", "lisa@mediconnect.com", "9876543214", "MMC1005", "Dermatology", 5, 4.2);
            
            log.info("Sample completely verified doctors created with availability.");
        }
    }

    private void createDoctor(String name, String email, String mobile, String doctorId, String spec, int exp, double rating) {
        User user = User.builder()
                .email(email)
                .password(passwordEncoder.encode("Doctor@123"))
                .role(Role.ROLE_DOCTOR)
                .active(true)
                .build();

        Doctor doctor = Doctor.builder()
                .name(name)
                .mobile(mobile)
                .doctorId(doctorId)
                .specialization(spec)
                .experience(exp)
                .rating(rating)
                .verificationStatus(Doctor.VerificationStatus.VERIFIED)
                .user(user)
                .build();

        Doctor savedDoctor = doctorRepository.save(doctor);

        // Add availability for all days
        for (DoctorAvailability.DayOfWeek day : DoctorAvailability.DayOfWeek.values()) {
            DoctorAvailability availability = DoctorAvailability.builder()
                    .doctor(savedDoctor)
                    .dayOfWeek(day)
                    .startTime(LocalTime.of(9, 0))
                    .endTime(LocalTime.of(17, 0))
                    .slotDuration(30)
                    .build();
            availabilityRepository.save(availability);
        }
    }
}
