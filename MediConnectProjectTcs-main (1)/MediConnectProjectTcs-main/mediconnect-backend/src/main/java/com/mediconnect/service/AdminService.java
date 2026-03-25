package com.mediconnect.service;

import com.mediconnect.dto.AdminDashboardStats;
import com.mediconnect.entity.Appointment;
import com.mediconnect.entity.Doctor;
import com.mediconnect.entity.Patient;
import com.mediconnect.entity.User;
import com.mediconnect.repository.AppointmentRepository;
import com.mediconnect.repository.DoctorRepository;
import com.mediconnect.repository.PatientRepository;
import com.mediconnect.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final AppointmentRepository appointmentRepository;
    private final UserRepository userRepository;

    public AdminDashboardStats getDashboardStats() {
        return AdminDashboardStats.builder()
                .totalPatients(patientRepository.count())
                .totalDoctors(doctorRepository.count())
                .totalAppointments(appointmentRepository.count())
                .build();
    }

    public List<Doctor> getPendingDoctors() {
        return doctorRepository.findByVerificationStatus(Doctor.VerificationStatus.PENDING);
    }

    public List<Doctor> getAllDoctors() {
        return doctorRepository.findAll();
    }

    public List<Patient> getAllPatients() {
        return patientRepository.findAll();
    }

    @Transactional
    public void verifyDoctor(Long doctorId, boolean verify) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new IllegalArgumentException("Doctor not found: " + doctorId));

        if (verify) {
            doctor.setVerificationStatus(Doctor.VerificationStatus.VERIFIED);
            User user = doctor.getUser();
            if (user != null) {
                user.setActive(true);
                userRepository.save(user);
            }
        } else {
            doctor.setVerificationStatus(Doctor.VerificationStatus.REJECTED);
            User user = doctor.getUser();
            if (user != null) {
                user.setActive(false);
                userRepository.save(user);
            }
        }
        doctorRepository.save(doctor);
    }

    @Transactional
    public void toggleDoctorActiveStatus(Long doctorId) {
        Doctor doctor = doctorRepository.findById(doctorId)
                 .orElseThrow(() -> new IllegalArgumentException("Doctor not found"));
        User user = doctor.getUser();
        user.setActive(!user.isActive());
        userRepository.save(user);
    }

    public List<Appointment> getDoctorAppointments(Long doctorId) {
        return appointmentRepository.findByDoctorIdOrderByAppointmentDateDescTimeSlotDesc(doctorId);
    }
}

