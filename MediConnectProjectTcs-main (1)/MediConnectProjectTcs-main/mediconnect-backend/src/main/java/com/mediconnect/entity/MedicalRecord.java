package com.mediconnect.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/**
 * Logical aggregation of a patient's records related to a single doctor.
 * According to requirements, medical history is stored doctor-wise.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Table(name = "medical_records", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"patient_id", "doctor_id"})
})
public class MedicalRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "doctor_id", nullable = false)
    private Doctor doctor;

    @OneToMany(mappedBy = "medicalRecord", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private List<Prescription> prescriptions;

    @Transient
    private List<MedicalFile> medicalFiles;
}
