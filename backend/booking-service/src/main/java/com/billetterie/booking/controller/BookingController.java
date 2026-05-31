package com.billetterie.booking.controller;

import com.billetterie.booking.client.EventClient;
import com.billetterie.booking.model.Booking;
import com.billetterie.booking.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.Element;
import java.awt.Color;
import java.time.format.DateTimeFormatter;

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
            
            Color orangeEventHub = new Color(255, 87, 34); // #FF5722
            Color darkGray = new Color(50, 50, 50);
            
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 28, orangeEventHub);
            Font subtitleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14, darkGray);
            Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 12, darkGray);
            Font boldFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, Color.BLACK);
            Font successFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, new Color(34, 197, 94)); 

            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy à HH:mm");
            String dateLisible = b.getDateReservation() != null ? b.getDateReservation().format(formatter) : "N/A";

            Paragraph title = new Paragraph("EventHUB", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(5);
            document.add(title);

            Paragraph subtitle = new Paragraph("BILLET OFFICIEL", subtitleFont);
            subtitle.setAlignment(Element.ALIGN_CENTER);
            subtitle.setSpacingAfter(30);
            document.add(subtitle);

            PdfPTable table = new PdfPTable(2);
            table.setWidthPercentage(100);
            table.setWidths(new float[]{65f, 35f}); 

            PdfPCell detailsCell = new PdfPCell();
            detailsCell.setBorder(com.lowagie.text.Rectangle.NO_BORDER);
            detailsCell.setPaddingTop(15);
            
            detailsCell.addElement(new Paragraph("Réservation N° : " + b.getId(), boldFont));
            detailsCell.addElement(new Paragraph("Événement ID : " + b.getEventId(), normalFont)); 
            detailsCell.addElement(new Paragraph("Nombre de places : " + b.getNombrePlaces(), normalFont));
            detailsCell.addElement(new Paragraph("Date d'achat : " + dateLisible, normalFont));
            
            Paragraph status = new Paragraph("\nStatut : " + b.getStatut(), 
                "CONFIRMEE".equals(b.getStatut()) ? successFont : boldFont);
            detailsCell.addElement(status);
            
            table.addCell(detailsCell);

            String qrCodeData = "EventHub-Ticket-" + b.getId() + "-User-" + b.getUserId() + "-Event-" + b.getEventId();
            QRCodeWriter qrCodeWriter = new QRCodeWriter();
            BitMatrix bitMatrix = qrCodeWriter.encode(qrCodeData, BarcodeFormat.QR_CODE, 180, 180);
            
            java.awt.image.BufferedImage bufferedImage = MatrixToImageWriter.toBufferedImage(bitMatrix);
            ByteArrayOutputStream pngOutputStream = new ByteArrayOutputStream();
            javax.imageio.ImageIO.write(bufferedImage, "PNG", pngOutputStream);
            
            Image qrImage = Image.getInstance(pngOutputStream.toByteArray());
            qrImage.setAlignment(Element.ALIGN_RIGHT);
            
            PdfPCell qrCell = new PdfPCell();
            qrCell.setBorder(com.lowagie.text.Rectangle.NO_BORDER);
            qrCell.addElement(qrImage);
            qrCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
            qrCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
            
            table.addCell(qrCell);

            document.add(table);

            Paragraph footer = new Paragraph("\n\nCe billet est unique et personnel. Veuillez le présenter lors du contrôle à l'entrée de l'événement. Toute falsification entraînera l'annulation immédiate de l'accès.", normalFont);
            footer.setAlignment(Element.ALIGN_JUSTIFIED);
            footer.setSpacingBefore(40);
            document.add(footer);

            document.close();

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=EventHub_Billet_" + id + ".pdf")
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(baos.toByteArray());
                    
        } catch (Exception e) {
            throw new RuntimeException("Erreur lors de la génération du billet PDF", e);
        }
    }
}