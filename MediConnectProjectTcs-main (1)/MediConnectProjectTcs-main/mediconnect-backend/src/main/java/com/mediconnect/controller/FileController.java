package com.mediconnect.controller;

import com.mediconnect.entity.MedicalFile;
import com.mediconnect.repository.MedicalFileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/api/v1/files")
@RequiredArgsConstructor
public class FileController {

    private final MedicalFileRepository medicalFileRepository;

    @GetMapping("/view/{id}")
    public ResponseEntity<Resource> viewFile(@PathVariable(name = "id") Long id) {
        MedicalFile medicalFile = medicalFileRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("File not found"));

        Path path = Paths.get(medicalFile.getFilePath());
        Resource resource = new FileSystemResource(path);

        if (!resource.exists()) {
            throw new RuntimeException("File does not exist on disk");
        }

        String contentType;
        try {
            contentType = Files.probeContentType(path);
        } catch (IOException e) {
            contentType = "application/octet-stream";
        }

        if (contentType == null) {
            contentType = "application/octet-stream";
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + medicalFile.getOriginalName() + "\"")
                .body(resource);
    }
}
