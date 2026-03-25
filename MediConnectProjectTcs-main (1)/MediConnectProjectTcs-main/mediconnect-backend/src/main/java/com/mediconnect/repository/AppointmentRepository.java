package com.mediconnect.repository;

import com.mediconnect.entity.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findByPatientId(Long patientId);
    List<Appointment> findByDoctorIdOrderByAppointmentDateDescTimeSlotDesc(Long doctorId);
    List<Appointment> findByDoctorIdAndAppointmentDate(Long doctorId, LocalDate date);
    Optional<Appointment> findByDoctorIdAndAppointmentDateAndTimeSlot(Long doctorId, LocalDate date, LocalTime timeSlot);
    boolean existsByDoctorIdAndAppointmentDateAndTimeSlot(Long doctorId, LocalDate date, LocalTime timeSlot);
}
