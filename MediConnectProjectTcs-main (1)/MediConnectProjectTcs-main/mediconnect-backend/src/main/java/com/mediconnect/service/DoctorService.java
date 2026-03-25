package com.mediconnect.service;

import com.mediconnect.dto.*;
import com.mediconnect.entity.*;
import com.mediconnect.repository.*;
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

@Service
@RequiredArgsConstructor
public class DoctorService {

    private final DoctorRepository doctorRepository;
    private final AppointmentRepository appointmentRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final MedicalRecordRepository medicalRecordRepository;
    private final DoctorAvailabilityRepository availabilityRepository;
    private final MedicalFileRepository medicalFileRepository;
    private final PatientRepository patientRepository;

    @Value("${file.upload-dir}")
    private String uploadDir;

    public Doctor getDoctorProfile(String email) {
        return doctorRepository.findByUserEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Doctor profile not found"));
    }

    public List<Appointment> getTodayAppointments(String email) {
        Doctor doctor = getDoctorProfile(email);
        return appointmentRepository.findByDoctorIdAndAppointmentDate(doctor.getId(), LocalDate.now());
    }

    public List<Appointment> getAllAppointments(String email) {
        Doctor doctor = getDoctorProfile(email);
        return appointmentRepository.findByDoctorIdOrderByAppointmentDateDescTimeSlotDesc(doctor.getId());
    }

    @Transactional
    public void updateAppointmentStatus(String email, Long appointmentId, Appointment.AppointmentStatus status) {
        Doctor doctor = getDoctorProfile(email);
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new IllegalArgumentException("Appointment not found"));

        if (!appointment.getDoctor().getId().equals(doctor.getId())) {
             throw new IllegalArgumentException("Unauthorized to update this appointment");
        }
        
        appointment.setStatus(status);
        appointmentRepository.save(appointment);
    }
    
    @Transactional
    public Prescription createPrescription(String email, Long appointmentId, PrescriptionRequest request) {
        Doctor doctor = getDoctorProfile(email);
        Appointment appointment = appointmentRepository.findById(appointmentId)
                 .orElseThrow(() -> new IllegalArgumentException("Appointment not found"));
                 
        if (!appointment.getDoctor().getId().equals(doctor.getId())) {
             throw new IllegalArgumentException("Unauthorized to prescribe for this appointment");
        }
        
        if (prescriptionRepository.findByAppointmentId(appointmentId).isPresent()) {
             throw new IllegalArgumentException("Prescription already exists for this appointment");
        }

        // Find or create medical record
        MedicalRecord medicalRecord = medicalRecordRepository.findByPatientIdAndDoctorId(appointment.getPatient().getId(), doctor.getId())
                .orElseGet(() -> {
                    MedicalRecord newRecord = MedicalRecord.builder()
                            .patient(appointment.getPatient())
                            .doctor(doctor)
                            .build();
                    return medicalRecordRepository.save(newRecord);
                });

        Prescription prescription = Prescription.builder()
                .appointment(appointment)
                .diagnosis(request.getDiagnosis())
                .medicines(request.getMedicines())
                .notes(request.getNotes())
                .medicalRecord(medicalRecord)
                .build();
                
        Prescription savedPrescription = prescriptionRepository.save(prescription);

        // Auto-generate .txt file for the prescription
        try {
            String content = String.format(
                "PRESCRIPTION SUMMARY\nDoctor: %s\nPatient: %s\nDate: %s\n\nDIAGNOSIS:\n%s\n\nMEDICINES:\n%s\n\nNOTES:\n%s",
                doctor.getName(), appointment.getPatient().getName(), LocalDateTime.now(),
                request.getDiagnosis(), request.getMedicines(), request.getNotes() != null ? request.getNotes() : "N/A"
            );
            
            String fileName = "Prescription_" + appointment.getAppointmentDate() + "_" + UUID.randomUUID().toString().substring(0, 8) + ".txt";
            Path patientDir = Paths.get(uploadDir, String.valueOf(appointment.getPatient().getId()));
            Files.createDirectories(patientDir);
            Path targetPath = patientDir.resolve(fileName);
            Files.write(targetPath, content.getBytes());

            MedicalFile medicalFile = MedicalFile.builder()
                    .patient(appointment.getPatient())
                    .fileName(fileName)
                    .originalName(fileName)
                    .filePath(targetPath.toString())
                    .fileSize((long) content.length())
                    .fileType("text/plain")
                    .uploadedAt(LocalDateTime.now())
                    .uploadedBy("DOCTOR")
                    .doctor(doctor)
                    .build();
            medicalFileRepository.save(medicalFile);
        } catch (IOException e) {
            // Log error but don't fail prescription creation
            System.err.println("Failed to generate prescription file: " + e.getMessage());
        }

        appointment.setStatus(Appointment.AppointmentStatus.COMPLETED);
        appointmentRepository.save(appointment);
        
        return savedPrescription;
    }
    
    public List<MedicalRecord> getPatientRecords(String email) {
        Doctor doctor = getDoctorProfile(email);
        List<MedicalRecord> records = medicalRecordRepository.findByDoctorId(doctor.getId());
        
        for (MedicalRecord record : records) {
            record.setMedicalFiles(medicalFileRepository.findByPatientIdAndDoctorId(record.getPatient().getId(), doctor.getId()));
        }
        
        return records;
    }

    @Transactional
    public void setAvailability(String email, List<DoctorAvailability> availabilities) {
        Doctor doctor = getDoctorProfile(email);
        // Clear existing availability for this doctor
        List<DoctorAvailability> current = availabilityRepository.findByDoctorId(doctor.getId());
        availabilityRepository.deleteAll(current);

        // Set new availability
        availabilities.forEach(a -> {
            a.setDoctor(doctor);
            availabilityRepository.save(a);
        });
    }

    public List<DoctorAvailability> getAvailability(String email) {
        Doctor doctor = getDoctorProfile(email);
        return availabilityRepository.findByDoctorId(doctor.getId());
    }

    @Transactional
    public MedicalFile uploadPatientFile(String doctorEmail, Long patientId, MultipartFile file) {
        Doctor doctor = getDoctorProfile(doctorEmail);
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new IllegalArgumentException("Patient not found"));

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
                    .uploadedBy("DOCTOR")
                    .doctor(doctor)
                    .build();

            return medicalFileRepository.save(medicalFile);
        } catch (IOException e) {
            throw new RuntimeException("Failed to upload file by doctor: " + e.getMessage());
        }
    }

    public List<LocalTime> getAvailableSlots(Long doctorId, LocalDate date) {
        String dayOfWeekStr = date.getDayOfWeek().name();
        DoctorAvailability.DayOfWeek dayOfWeek = DoctorAvailability.DayOfWeek.valueOf(dayOfWeekStr);
        List<DoctorAvailability> availabilities = availabilityRepository.findByDoctorIdAndDayOfWeek(doctorId, dayOfWeek);

        if (availabilities.isEmpty()) {
            return java.util.Collections.emptyList();
        }

        List<LocalTime> bookedSlots = appointmentRepository.findByDoctorIdAndAppointmentDate(doctorId, date)
                .stream()
                .map(Appointment::getTimeSlot)
                .toList();

        java.util.List<LocalTime> allSlots = new java.util.ArrayList<>();
        for (DoctorAvailability avail : availabilities) {
            LocalTime current = avail.getStartTime();
            while (current.isBefore(avail.getEndTime())) {
                boolean isPast = date.equals(LocalDate.now()) && current.isBefore(LocalTime.now());
                if (!bookedSlots.contains(current) && !isPast) {
                    allSlots.add(current);
                }
                current = current.plusMinutes(avail.getSlotDuration());
            }
        }
        
        java.util.Collections.sort(allSlots);
        return allSlots;
    }
}
