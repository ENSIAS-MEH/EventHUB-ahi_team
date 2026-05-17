package com.billetterie.event.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.*;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/upload")
@CrossOrigin(origins = "*")
public class UploadController {

    @Value("${upload.dir:/app/uploads}")
    private String uploadDir;

    @Value("${upload.base-url:http://localhost:8082}")
    private String baseUrl;

    @PostMapping("/image")
    public ResponseEntity<?> uploadImage(@RequestParam("file") MultipartFile file) throws IOException {
        String original = file.getOriginalFilename();
        String ext = (original != null && original.contains("."))
            ? original.substring(original.lastIndexOf("."))
            : ".jpg";
        String filename = UUID.randomUUID() + ext;
        Path dest = Paths.get(uploadDir, filename);
        Files.createDirectories(dest.getParent());
        Files.write(dest, file.getBytes());
        return ResponseEntity.ok(Map.of("url", baseUrl + "/uploads/" + filename));
    }
}
