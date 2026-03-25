package com.mediconnect.repository;

import com.mediconnect.entity.MedicalFile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MedicalFileRepository extends JpaRepository<MedicalFile, Long> {
    List<MedicalFile> findByPatientIdOrderByUploadedAtDesc(Long patientId);
    List<MedicalFile> findByPatientIdAndDoctorId(Long patientId, Long doctorId);
}
