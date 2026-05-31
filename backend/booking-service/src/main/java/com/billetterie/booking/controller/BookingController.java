package com.billetterie.booking.controller;

import com.billetterie.booking.client.EventClient;
import com.billetterie.booking.model.Booking;
import com.billetterie.booking.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import com.lowagie.text.Document;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfWriter;
import com.lowagie.text.Image;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.qrcode.QRCodeWriter;
import com.google.zxing.common.BitMatrix;

import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {
    
    private final BookingRepository repo;
    private final EventClient eventClient;

    @PostMapping
    public Booking create(@RequestBody Booking b) {
        b.setStatut("EN_ATTENTE_PAIEMENT");
        b.setDateReservation(LocalDateTime.now());
        Booking saved = repo.save(b);
        return saved;
    }

    @GetMapping("/user/{userId}")
    public List<Booking> getByUser(@PathVariable Long userId) {
        return repo.findByUserId(userId);
    }

    @GetMapping("/event/{eventId}")
    public List<Booking> getByEvent(@PathVariable Long eventId) {
        return repo.findByEventId(eventId);
    }

    @GetMapping
    public List<Booking> getAll() { return repo.findAll(); }

    @PutMapping("/{id}/confirmer")
    public Booking confirmer(@PathVariable Long id) {
        Booking b = repo.findById(id).orElseThrow();
        
        if ("EN_ATTENTE_PAIEMENT".equals(b.getStatut())) {
            b.setStatut("CONFIRMEE");
            eventClient.decrementPlaces(b.getEventId(), b.getNombrePlaces());
        }
        return repo.save(b);
    }

    @PutMapping("/{id}/annuler")
    public Booking annuler(@PathVariable Long id) {
        Booking b = repo.findById(id).orElseThrow();
        b.setStatut("ANNULEE");
        return repo.save(b);
    }

    @GetMapping("/{id}/ticket")
    public ResponseEntity<byte[]> genererBilletPdf(@PathVariable Long id) {
        Booking b = repo.findById(id).orElseThrow();
        
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            Document document = new Document();
            PdfWriter.getInstance(document, baos);
            document.open();
            
            document.add(new Paragraph("=========================================="));
            document.add(new Paragraph("EVENTHUB - BILLET OFFICIEL"));
            document.add(new Paragraph("=========================================="));
            document.add(new Paragraph(" "));
            document.add(new Paragraph("Reservation N : " + b.getId()));
            document.add(new Paragraph("Nombre de places : " + b.getNombrePlaces()));
            document.add(new Paragraph("Statut : " + b.getStatut()));
            document.add(new Paragraph("Date de reservation : " + b.getDateReservation()));
            document.add(new Paragraph(" "));
            document.add(new Paragraph("Ce billet doit etre presente a l'entree."));
            document.add(new Paragraph(" "));
            
            String qrCodeData = "EventHub-Ticket-" + b.getId() + "-User-" + b.getUserId() + "-Event-" + b.getEventId();
            QRCodeWriter qrCodeWriter = new QRCodeWriter();
            BitMatrix bitMatrix = qrCodeWriter.encode(qrCodeData, BarcodeFormat.QR_CODE, 200, 200);
            
            java.awt.image.BufferedImage bufferedImage = MatrixToImageWriter.toBufferedImage(bitMatrix);
            ByteArrayOutputStream pngOutputStream = new ByteArrayOutputStream();
            javax.imageio.ImageIO.write(bufferedImage, "PNG", pngOutputStream);
            
            Image qrImage = Image.getInstance(pngOutputStream.toByteArray());
            document.add(qrImage);
            
            document.close();

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=billet_" + id + ".pdf")
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(baos.toByteArray());
                    
        } catch (Exception e) {
            throw new RuntimeException("Erreur lors de la generation du billet PDF", e);
        }
    }
}