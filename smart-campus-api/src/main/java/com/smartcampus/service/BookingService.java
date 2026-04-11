package com.smartcampus.service;

import com.smartcampus.dto.request.BookingRequest;
import com.smartcampus.dto.response.BookingResponse;
import com.smartcampus.entity.Booking;
import com.smartcampus.entity.BookingStatus;
import com.smartcampus.entity.Role;
import com.smartcampus.entity.User;
import com.smartcampus.exception.BookingConflictException;
import com.smartcampus.exception.UnauthorizedException;
import com.smartcampus.repository.BookingRepository;
import com.smartcampus.repository.UserRepository;
import com.smartcampus.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import jakarta.servlet.http.HttpServletRequest;
import java.net.URI;
import java.net.URLDecoder;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookingService {

    private static final String QR_PREFIX = "SCHECKIN";

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;
    
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    
    @Transactional
    public BookingResponse createBooking(BookingRequest request) {
        log.info("Creating booking for resource: {}", request.getResourceId());
        
        User currentUser = getCurrentUser();
        log.info("Current user: {} ({})", currentUser.getEmail(), currentUser.getId());
        
        validateBookingTime(request.getStartTime(), request.getEndTime());
        
        // During creation: Check against BOTH PENDING and APPROVED bookings
        checkConflictsForCreation(request.getResourceId(), request.getStartTime(), request.getEndTime());
        
        Booking booking = Booking.builder()
                .user(currentUser)
                .resourceId(request.getResourceId())
                .resourceName(request.getResourceName() != null ? request.getResourceName() : "General Resource")
                .resourceType(request.getResourceType() != null ? request.getResourceType() : "GENERAL")
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .purpose(request.getPurpose())
                .expectedAttendees(request.getExpectedAttendees())
                .status(BookingStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
        
        Booking savedBooking = bookingRepository.save(booking);
        log.info("Booking created successfully with id: {}", savedBooking.getId());
        
        return mapToResponse(savedBooking);
    }
    
    @Transactional
    public BookingResponse approveBooking(String id, boolean approved, String rejectionReason) {
        User currentUser = getCurrentUser();
        
        if (currentUser.getRole() != Role.ADMIN) {
            throw new UnauthorizedException("Only admins can approve/reject bookings");
        }
        
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found with id: " + id));
        
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new IllegalStateException("Booking is not in pending state. Current status: " + booking.getStatus());
        }
        
        if (approved) {
            // During approval: Check ONLY against APPROVED bookings (ignore PENDING ones)
            checkConflictsForApproval(booking.getResourceId(), booking.getStartTime(), booking.getEndTime());
            booking.setStatus(BookingStatus.APPROVED);
            booking.setApprovedAt(LocalDateTime.now());
            booking.setApprovedBy(currentUser.getEmail());
            if (booking.getCheckInToken() == null || booking.getCheckInToken().isBlank()) {
                booking.setCheckInToken(UUID.randomUUID().toString());
            }
            log.info("Booking {} approved by admin {}", id, currentUser.getEmail());
        } else {
            if (rejectionReason == null || rejectionReason.trim().isEmpty()) {
                throw new IllegalArgumentException("Rejection reason is required when rejecting a booking");
            }
            booking.setStatus(BookingStatus.REJECTED);
            booking.setRejectionReason(rejectionReason);
            log.info("Booking {} rejected by admin {}. Reason: {}", id, currentUser.getEmail(), rejectionReason);
        }
        
        booking.setUpdatedAt(LocalDateTime.now());
        Booking updatedBooking = bookingRepository.save(booking);
        
        return mapToResponse(updatedBooking);
    }
    
    // Check conflicts during creation - check against PENDING and APPROVED
    private void checkConflictsForCreation(String resourceId, LocalDateTime startTime, LocalDateTime endTime) {
        List<Booking> conflicts = bookingRepository.findConflictingBookings(resourceId, startTime, endTime);
        
        if (!conflicts.isEmpty()) {
            Booking conflict = conflicts.get(0);
            throw new BookingConflictException(String.format(
                "Time slot conflict with existing %s booking: %s to %s", 
                conflict.getStatus(),
                conflict.getStartTime().toString().replace("T", " "),
                conflict.getEndTime().toString().replace("T", " ")
            ));
        }
    }
    
    // Check conflicts during approval - ONLY check against APPROVED bookings
    private void checkConflictsForApproval(String resourceId, LocalDateTime startTime, LocalDateTime endTime) {
        List<Booking> conflicts = bookingRepository.findConflictingBookings(resourceId, startTime, endTime);
        
        // Filter to only APPROVED bookings (ignore PENDING ones during approval)
        List<Booking> approvedConflicts = conflicts.stream()
                .filter(b -> b.getStatus() == BookingStatus.APPROVED)
                .collect(Collectors.toList());
        
        if (!approvedConflicts.isEmpty()) {
            Booking conflict = approvedConflicts.get(0);
            throw new BookingConflictException(String.format(
                "Time slot conflict with existing APPROVED booking: %s to %s", 
                conflict.getStartTime().toString().replace("T", " "),
                conflict.getEndTime().toString().replace("T", " ")
            ));
        }
    }
    
    private void validateBookingTime(LocalDateTime startTime, LocalDateTime endTime) {
        if (startTime == null || endTime == null) {
            throw new IllegalArgumentException("Start time and end time are required");
        }
        
        if (startTime.isAfter(endTime)) {
            throw new IllegalArgumentException("Start time must be before end time");
        }
        
        if (startTime.equals(endTime)) {
            throw new IllegalArgumentException("Start time and end time cannot be the same");
        }
        
        if (startTime.isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Start time must be in the future");
        }
        
        long durationMinutes = ChronoUnit.MINUTES.between(startTime, endTime);
        if (durationMinutes < 30) {
            throw new IllegalArgumentException("Minimum booking duration is 30 minutes");
        }
        
        if (durationMinutes > 480) {
            throw new IllegalArgumentException("Maximum booking duration is 8 hours");
        }
    }
    
    // UPDATED: Allow cancellation for both APPROVED (with time constraint) and PENDING bookings
    private BookingResponse mapToResponse(Booking booking) {
        LocalDateTime now = LocalDateTime.now();
        
        // User can cancel if:
        // 1. Booking is APPROVED AND start time is more than 2 hours away
        // 2. OR Booking is PENDING (user can cancel their request before approval)
        boolean canCancel = (booking.getStatus() == BookingStatus.APPROVED && 
                            booking.getStartTime().minusHours(2).isAfter(now)) ||
                            (booking.getStatus() == BookingStatus.PENDING);
        
        boolean canModify = booking.getStatus() == BookingStatus.PENDING &&
                           booking.getStartTime().minusHours(24).isAfter(now);
        
        return BookingResponse.builder()
                .id(booking.getId())
                .userId(booking.getUser().getId())
                .userName(booking.getUser().getName())
                .userEmail(booking.getUser().getEmail())
                .resourceId(booking.getResourceId())
                .resourceName(booking.getResourceName())
                .resourceType(booking.getResourceType())
                .startTime(booking.getStartTime())
                .endTime(booking.getEndTime())
                .purpose(booking.getPurpose())
                .expectedAttendees(booking.getExpectedAttendees())
                .status(booking.getStatus().toString())
                .rejectionReason(booking.getRejectionReason())
                .createdAt(booking.getCreatedAt())
                .updatedAt(booking.getUpdatedAt())
                .canCancel(canCancel)
                .canModify(canModify)
                .checkedIn(booking.isCheckedIn())
                .checkedInAt(booking.getCheckedInAt())
                .checkedInBy(booking.getCheckedInBy())
                .checkInQrData(buildQrData(booking))
                .build();
    }

    public String getCheckInQrData(String bookingId) {
        Booking booking = getBookingAndValidateAccess(bookingId);

        if (booking.getStatus() != BookingStatus.APPROVED) {
            throw new IllegalStateException("QR check-in is only available for approved bookings");
        }

        if (booking.getCheckInToken() == null || booking.getCheckInToken().isBlank()) {
            booking.setCheckInToken(UUID.randomUUID().toString());
            booking.setUpdatedAt(LocalDateTime.now());
            bookingRepository.save(booking);
        }

        return buildQrData(booking);
    }

    @Transactional
    public BookingResponse verifyAndCheckInByQr(String qrData) {
        User currentUser = getCurrentUser();
        if (currentUser.getRole() != Role.ADMIN && currentUser.getRole() != Role.MANAGER) {
            throw new UnauthorizedException("Only admin or manager can verify check-in");
        }

        String payload = normalizeQrPayload(qrData);
        String[] parts = payload.split("\\|");
        if (parts.length != 3 || !QR_PREFIX.equals(parts[0])) {
            throw new IllegalArgumentException("Invalid QR code format");
        }

        String bookingId = parts[1];
        String token = parts[2];

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found with id: " + bookingId));

        if (booking.getStatus() != BookingStatus.APPROVED) {
            throw new IllegalStateException("Only approved bookings can be checked in");
        }

        if (booking.getCheckInToken() == null || !booking.getCheckInToken().equals(token)) {
            throw new IllegalArgumentException("QR token is invalid or expired");
        }

        if (booking.isCheckedIn()) {
            throw new IllegalStateException("Booking is already checked in");
        }

        booking.setCheckedIn(true);
        booking.setCheckedInAt(LocalDateTime.now());
        booking.setCheckedInBy(currentUser.getEmail());
        booking.setUpdatedAt(LocalDateTime.now());

        Booking saved = bookingRepository.save(booking);
        return mapToResponse(saved);
    }
    
    public List<BookingResponse> getUserBookings() {
        User currentUser = getCurrentUser();
        return bookingRepository.findByUserId(currentUser.getId())
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    public List<BookingResponse> getAllBookings(String status, String resourceId) {
        User currentUser = getCurrentUser();
        if (currentUser.getRole() != Role.ADMIN) {
            throw new UnauthorizedException("Only admins can view all bookings");
        }
        
        List<Booking> bookings;
        if (status != null && !status.isEmpty()) {
            bookings = bookingRepository.findByStatus(BookingStatus.valueOf(status.toUpperCase()));
        } else if (resourceId != null && !resourceId.isEmpty()) {
            bookings = bookingRepository.findByResourceId(resourceId);
        } else {
            bookings = bookingRepository.findAll();
        }
        
        return bookings.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    public BookingResponse getBookingById(String id) {
        Booking booking = getBookingAndValidateAccess(id);
        return mapToResponse(booking);
    }
    
    @Transactional
    public BookingResponse cancelBooking(String id, String cancellationReason) {
        User currentUser = getCurrentUser();
        Booking booking = getBookingAndValidateAccess(id);
        
        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new IllegalStateException("Booking is already cancelled");
        }
        
        if (booking.getStatus() == BookingStatus.REJECTED) {
            throw new IllegalStateException("Cannot cancel a rejected booking");
        }
        
        LocalDateTime now = LocalDateTime.now();
        
        // Check cancellation rules:
        // For APPROVED bookings: cannot cancel less than 2 hours before start time
        // For PENDING bookings: can always cancel
        if (booking.getStatus() == BookingStatus.APPROVED && 
            booking.getStartTime().minusHours(2).isBefore(now)) {
            throw new IllegalStateException("Cannot cancel booking less than 2 hours before start time");
        }
        
        booking.setStatus(BookingStatus.CANCELLED);
        booking.setCancellationReason(cancellationReason != null ? cancellationReason : "Cancelled by user");
        booking.setCancelledAt(LocalDateTime.now());
        booking.setUpdatedAt(LocalDateTime.now());
        
        Booking updatedBooking = bookingRepository.save(booking);
        log.info("Booking {} cancelled by user {}", id, currentUser.getEmail());
        
        return mapToResponse(updatedBooking);
    }
    
    private Booking getBookingAndValidateAccess(String id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found with id: " + id));
        
        User currentUser = getCurrentUser();
        
        if (currentUser.getRole() == Role.ADMIN) {
            return booking;
        }
        
        if (!booking.getUser().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException("You don't have access to this booking");
        }
        
        return booking;
    }

    private String buildQrData(Booking booking) {
        if (booking.getStatus() != BookingStatus.APPROVED) {
            return null;
        }
        if (booking.getCheckInToken() == null || booking.getCheckInToken().isBlank()) {
            return null;
        }
        String payload = QR_PREFIX + "|" + booking.getId() + "|" + booking.getCheckInToken();
        return frontendUrl + "/check-in?qr=" + URLEncoder.encode(payload, StandardCharsets.UTF_8);
    }

    private String normalizeQrPayload(String value) {
        String input = String.valueOf(value == null ? "" : value).trim();
        if (input.isBlank()) {
            throw new IllegalArgumentException("QR payload is required");
        }

        // If scanner returns a URL, extract the "qr" query parameter.
        if (input.startsWith("http://") || input.startsWith("https://")) {
            try {
                URI uri = URI.create(input);
                String query = uri.getQuery();
                if (query != null) {
                    for (String pair : query.split("&")) {
                        String[] kv = pair.split("=", 2);
                        if (kv.length == 2 && "qr".equals(kv[0])) {
                            return URLDecoder.decode(kv[1], StandardCharsets.UTF_8);
                        }
                    }
                }
            } catch (Exception ignored) {
                // Fall back to raw input parsing below.
            }
        }

        // Accept direct encoded payload pasted from some scanners.
        return URLDecoder.decode(input, StandardCharsets.UTF_8);
    }
    
    public List<LocalDateTime[]> getAvailableTimeSlots(String resourceId, LocalDateTime date) {
        List<LocalDateTime[]> availableSlots = new ArrayList<>();
        
        LocalDateTime startOfDay = date.withHour(8).withMinute(0).withSecond(0).withNano(0);
        LocalDateTime endOfDay = date.withHour(20).withMinute(0).withSecond(0).withNano(0);
        
        List<Booking> existingBookings = bookingRepository.findApprovedBookingsInRange(startOfDay, endOfDay);
        
        LocalDateTime currentSlot = startOfDay;
        while (currentSlot.plusMinutes(30).isBefore(endOfDay) || currentSlot.plusMinutes(30).equals(endOfDay)) {
            LocalDateTime slotEnd = currentSlot.plusMinutes(30);
            
            boolean isAvailable = true;
            for (Booking booking : existingBookings) {
                if (booking.getResourceId().equals(resourceId)) {
                    if (!(slotEnd.isBefore(booking.getStartTime()) || currentSlot.isAfter(booking.getEndTime()))) {
                        isAvailable = false;
                        break;
                    }
                }
            }
            
            if (isAvailable) {
                availableSlots.add(new LocalDateTime[]{currentSlot, slotEnd});
            }
            
            currentSlot = currentSlot.plusMinutes(30);
        }
        
        return availableSlots;
    }
    
    private User getCurrentUser() {
        try {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes == null) {
                throw new UnauthorizedException("No request context found");
            }
            
            HttpServletRequest request = attributes.getRequest();
            String authHeader = request.getHeader("Authorization");
            
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                throw new UnauthorizedException("No valid authorization header found");
            }
            
            String token = authHeader.substring(7);
            String email = jwtUtil.extractEmail(token);
            
            if (email == null) {
                throw new UnauthorizedException("No email found in token");
            }
            
            return userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
                    
        } catch (Exception e) {
            log.error("Error getting current user: {}", e.getMessage(), e);
            throw new UnauthorizedException("Unable to authenticate user: " + e.getMessage());
        }
    }
}