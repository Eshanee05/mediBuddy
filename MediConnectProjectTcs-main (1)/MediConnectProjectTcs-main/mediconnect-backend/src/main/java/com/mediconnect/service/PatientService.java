package com.mediconnect.service;

import com.mediconnect.dto.*;
import com.mediconnect.repository.*;
import com.mediconnect.entity.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PatientService {

    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final AppointmentRepository appointmentRepository;
    private final MedicalRecordRepository medicalRecordRepository;
    private final MedicalFileRepository medicalFileRepository;
    private final DoctorAvailabilityRepository availabilityRepository;

    @Value("${file.upload-dir}")
    private String uploadDir;

    public Patient getPatientProfile(String email) {
        return patientRepository.findByUserEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Patient profile not found"));
    }

    public List<Doctor> searchDoctors(String keyword) {
        return doctorRepository.findByVerificationStatus(Doctor.VerificationStatus.VERIFIED)
                .stream()
                .filter(d -> d.getUser() != null && d.getUser().isActive())
                .filter(d -> {
                    boolean nameMatch = d.getName().toLowerCase().contains(keyword != null ? keyword.toLowerCase() : "");
                    boolean specMatch = d.getSpecialization().toLowerCase().contains(keyword != null ? keyword.toLowerCase() : "");
                    return keyword == null || keyword.isBlank() || nameMatch || specMatch;
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public Appointment bookAppointment(String email, AppointmentRequest request) {
        Patient patient = getPatientProfile(email);
        Doctor doctor = doctorRepository.findById(request.getDoctorId())
                .orElseThrow(() -> new IllegalArgumentException("Doctor not found"));

        if (doctor.getVerificationStatus() != Doctor.VerificationStatus.VERIFIED) {
             throw new IllegalArgumentException("Doctor is not yet verified");
        }

        boolean isBooked = appointmentRepository.existsByDoctorIdAndAppointmentDateAndTimeSlot(
                doctor.getId(), request.getAppointmentDate(), request.getTimeSlot());

        if (isBooked) {
            throw new IllegalArgumentException("Selected time slot is already booked");
        }

        if (request.getAppointmentDate().isEqual(LocalDate.now()) && request.getTimeSlot().isBefore(LocalTime.now())) {
             throw new IllegalArgumentException("Cannot book appointment in the past");
        }

        // Check Doctor Availability
        String dayOfWeekStr = request.getAppointmentDate().getDayOfWeek().name();
        DoctorAvailability.DayOfWeek dayOfWeek = DoctorAvailability.DayOfWeek.valueOf(dayOfWeekStr);
        List<DoctorAvailability> availabilities = availabilityRepository.findByDoctorIdAndDayOfWeek(doctor.getId(), dayOfWeek);

        if (availabilities.isEmpty()) {
            throw new IllegalArgumentException("Doctor is not available on this day of the week");
        }

        boolean withinAvailability = availabilities.stream().anyMatch(a -> 
            !request.getTimeSlot().isBefore(a.getStartTime()) && 
            !request.getTimeSlot().isAfter(a.getEndTime())
        );

        if (!withinAvailability) {
            throw new IllegalArgumentException("Doctor is not available at the selected time slot");
        }

        Appointment appointment = Appointment.builder()
                .patient(patient)
                .doctor(doctor)
                .appointmentDate(request.getAppointmentDate())
                .timeSlot(request.getTimeSlot())
                .status(Appointment.AppointmentStatus.CONFIRMED)
                .build();

        return appointmentRepository.save(appointment);
    }

    @Transactional(readOnly = true)
    public List<Appointment> getMyAppointments(String email) {
        Patient patient = getPatientProfile(email);
        return appointmentRepository.findByPatientId(patient.getId());
    }

    @Transactional(readOnly = true)
    public List<MedicalRecord> getMedicalHistory(String email) {
        Patient patient = getPatientProfile(email);
        return medicalRecordRepository.findByPatientId(patient.getId());
    }

    @Transactional
    public MedicalFile uploadMedicalFile(String email, MultipartFile file) {
        Patient patient = getPatientProfile(email);
        try {
            Path patientDir = Paths.get(uploadDir, String.valueOf(patient.getId()));
            Files.createDirectories(patientDir);

            String uniqueFileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            Path targetPath = patientDir.resolve(uniqueFileName);
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

            MedicalFile medicalFile = MedicalFile.builder()
                    .patient(patient)
                    .fileName(uniqueFileName)
                    .originalName(file.getOriginalFilename())
                    .filePath(targetPath.toString())
                    .fileSize(file.getSize())
                    .fileType(file.getContentType())
                    .uploadedAt(LocalDateTime.now())
                    .uploadedBy("PATIENT")
                    .build();

            return medicalFileRepository.save(medicalFile);
        } catch (IOException e) {
            throw new RuntimeException("Failed to upload file: " + e.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public List<MedicalFile> getMyMedicalFiles(String email) {
        Patient patient = getPatientProfile(email);
        return medicalFileRepository.findByPatientIdOrderByUploadedAtDesc(patient.getId());
    }
}
