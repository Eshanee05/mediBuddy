package com.mediconnect.repository;

import com.mediconnect.entity.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Long> {
    Optional<Doctor> findByUserEmail(String email);
    Optional<Doctor> findByDoctorId(String doctorId);
    boolean existsByMobile(String mobile);
    boolean existsByDoctorId(String doctorId);
    List<Doctor> findByVerificationStatus(Doctor.VerificationStatus status);
}
