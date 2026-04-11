package com.smartcampus.controller;

import com.smartcampus.dto.request.BookingApprovalRequest;
import com.smartcampus.dto.request.BookingCancellationRequest;
import com.smartcampus.dto.request.BookingCheckInRequest;
import com.smartcampus.dto.request.BookingRequest;
import com.smartcampus.dto.response.BookingResponse;
import com.smartcampus.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class BookingController {
    
    private final BookingService bookingService;
    
    // Create a new booking
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<BookingResponse> createBooking(@Valid @RequestBody BookingRequest request) {
        BookingResponse response = bookingService.createBooking(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

     // Add a test endpoint
    @GetMapping("/test")
    public ResponseEntity<?> test() {
        return ResponseEntity.ok(Map.of("message", "Booking API is working"));
    }

    // Get current user's bookings
    @GetMapping("/my")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<BookingResponse>> getMyBookings() {
        List<BookingResponse> bookings = bookingService.getUserBookings();
        return ResponseEntity.ok(bookings);
    }
    
    // Get all bookings (Admin and Manager)
    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<List<BookingResponse>> getAllBookings(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String resourceId) {
        List<BookingResponse> bookings = bookingService.getAllBookings(status, resourceId);
        return ResponseEntity.ok(bookings);
    }
    
    // Get booking by ID
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<BookingResponse> getBookingById(@PathVariable String id) {
        BookingResponse booking = bookingService.getBookingById(id);
        return ResponseEntity.ok(booking);
    }

    @GetMapping("/{id}/check-in-qr")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getCheckInQr(@PathVariable String id) {
        return ResponseEntity.ok(Map.of("qrData", bookingService.getCheckInQrData(id)));
    }

    @PostMapping("/check-in/verify")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<BookingResponse> verifyCheckIn(@RequestBody BookingCheckInRequest request) {
        BookingResponse booking = bookingService.verifyAndCheckInByQr(request.getQrData());
        return ResponseEntity.ok(booking);
    }
    
    // Approve/Reject booking (Admin and Manager)
    @PatchMapping("/{id}/approval")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<BookingResponse> approveBooking(
            @PathVariable String id,
            @Valid @RequestBody BookingApprovalRequest request) {
        BookingResponse booking = bookingService.approveBooking(
            id, 
            request.isApproved(), 
            request.getRejectionReason()
        );
        return ResponseEntity.ok(booking);
    }
    
    // Cancel booking
    @PatchMapping("/{id}/cancel")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<BookingResponse> cancelBooking(
            @PathVariable String id,
            @RequestBody(required = false) BookingCancellationRequest request) {
        String reason = request != null ? request.getCancellationReason() : "Cancelled by user";
        BookingResponse booking = bookingService.cancelBooking(id, reason);
        return ResponseEntity.ok(booking);
    }
    
    // Update booking
    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<BookingResponse> updateBooking(
            @PathVariable String id,
            @Valid @RequestBody BookingRequest request) {
        // Cancel existing booking and create new one
        bookingService.cancelBooking(id, "Updated by user");
        BookingResponse booking = bookingService.createBooking(request);
        return ResponseEntity.ok(booking);
    }
    
    // Get available time slots for a resource on a specific date
    @GetMapping("/available-slots")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<LocalDateTime[]>> getAvailableTimeSlots(
            @RequestParam String resourceId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime date) {
        List<LocalDateTime[]> slots = bookingService.getAvailableTimeSlots(resourceId, date);
        return ResponseEntity.ok(slots);
    }
    
    // Get booking statistics (Admin only)
    @GetMapping("/statistics")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getBookingStatistics() {
        // Implementation for dashboard statistics
        return ResponseEntity.ok().body("Statistics endpoint");
    }
}