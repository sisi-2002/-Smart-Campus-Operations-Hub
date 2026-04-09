package com.smartcampus.service;

import com.smartcampus.dto.request.CreateIncidentTicketRequest;
import com.smartcampus.dto.response.UserDashboardResponse;
import com.smartcampus.entity.IncidentTicket;
import com.smartcampus.entity.ResourceBooking;
import com.smartcampus.entity.User;
import com.smartcampus.repository.IncidentTicketRepository;
import com.smartcampus.repository.ResourceBookingRepository;
import com.smartcampus.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserDashboardService {

    private final UserRepository userRepository;
    private final ResourceBookingRepository resourceBookingRepository;
    private final IncidentTicketRepository incidentTicketRepository;

    public Map<String, String> createIncidentTicket(String email, CreateIncidentTicketRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String generatedTicketId = "INC-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        IncidentTicket savedTicket = incidentTicketRepository.save(IncidentTicket.builder()
                .userId(user.getId())
                .ticketId(generatedTicketId)
                .location(trimToNull(request.getResourceLocation()))
                .category(trimToNull(request.getCategory()))
                .priority(trimToNull(request.getPriority()))
                .description(trimToNull(request.getDescription()))
                .preferredContact(trimToNull(request.getPreferredContact()))
                .imageNames(request.getImageNames() == null ? List.of() : request.getImageNames())
                .imageDataUrls(request.getImageDataUrls() == null ? List.of() : request.getImageDataUrls())
                .status("OPEN")
                .build());

        return Map.of(
                "message", "Incident ticket created successfully",
                "id", savedTicket.getId(),
                "ticketId", defaultValue(savedTicket.getTicketId(), savedTicket.getId())
        );
    }

    public UserDashboardResponse getOverview(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<ResourceBooking> bookings = resourceBookingRepository.findByUserId(user.getId());
        List<IncidentTicket> tickets = incidentTicketRepository.findByUserId(user.getId());

        long upcomingBookings = bookings.stream()
                .filter(b -> b.getDate() != null && !b.getDate().isBefore(LocalDate.now()))
                .count();

        long pendingRequests = bookings.stream()
                .filter(b -> equalsIgnoreCase(b.getStatus(), "PENDING"))
                .count();

        long openTickets = tickets.stream()
                .filter(t -> isOpenTicketStatus(t.getStatus()))
                .count();

        long resolvedTickets = tickets.stream()
                .filter(t -> equalsIgnoreCase(t.getStatus(), "RESOLVED"))
                .count();

        List<UserDashboardResponse.RecentBookingItem> recentBookings = bookings.stream()
                .sorted(Comparator.comparing(ResourceBooking::getCreatedAt,
                        Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(5)
                .map(b -> UserDashboardResponse.RecentBookingItem.builder()
                        .id(b.getId())
                        .resource(defaultValue(b.getResource(), "-"))
                        .date(b.getDate() != null ? b.getDate().toString() : "-")
                        .time(defaultValue(b.getTime(), "-"))
                        .status(defaultValue(b.getStatus(), "Unknown"))
                        .build())
                .toList();

        List<UserDashboardResponse.ActiveTicketItem> activeTickets = tickets.stream()
                .filter(t -> isOpenTicketStatus(t.getStatus()))
                .sorted(Comparator.comparing(IncidentTicket::getCreatedAt,
                        Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(5)
                .map(t -> UserDashboardResponse.ActiveTicketItem.builder()
                        .id(t.getId())
                        .ticketId(defaultValue(t.getTicketId(), t.getId()))
                        .location(defaultValue(t.getLocation(), "-"))
                        .category(defaultValue(t.getCategory(), "-"))
                        .imageNames(t.getImageNames() == null ? List.of() : t.getImageNames())
                        .imageDataUrls(t.getImageDataUrls() == null ? List.of() : t.getImageDataUrls())
                        .status(defaultValue(t.getStatus(), "Open"))
                        .build())
                .toList();

        List<UserDashboardResponse.ActiveTicketItem> incidentTickets = tickets.stream()
                .sorted(Comparator.comparing(IncidentTicket::getCreatedAt,
                        Comparator.nullsLast(Comparator.reverseOrder())))
                .map(t -> UserDashboardResponse.ActiveTicketItem.builder()
                        .id(t.getId())
                        .ticketId(defaultValue(t.getTicketId(), t.getId()))
                        .location(defaultValue(t.getLocation(), "-"))
                        .category(defaultValue(t.getCategory(), "-"))
                        .imageNames(t.getImageNames() == null ? List.of() : t.getImageNames())
                        .imageDataUrls(t.getImageDataUrls() == null ? List.of() : t.getImageDataUrls())
                        .status(defaultValue(t.getStatus(), "Open"))
                        .build())
                .toList();

        return UserDashboardResponse.builder()
                .user(UserDashboardResponse.UserSummary.builder()
                        .id(user.getId())
                        .name(user.getName())
                        .email(user.getEmail())
                        .role(user.getRole() != null ? user.getRole().name() : null)
                        .provider(user.getProvider() != null ? user.getProvider().name() : null)
                        .build())
                .stats(UserDashboardResponse.DashboardStats.builder()
                        .upcomingBookings(upcomingBookings)
                        .pendingRequests(pendingRequests)
                        .openTickets(openTickets)
                        .resolvedTickets(resolvedTickets)
                        .build())
                .recentBookings(recentBookings)
                .activeTickets(activeTickets)
                .incidentTickets(incidentTickets)
                .build();
    }

    private boolean isOpenTicketStatus(String status) {
        if (status == null) {
            return true;
        }
        String normalized = status.trim().toUpperCase();
                return !"RESOLVED".equals(normalized) && !"CLOSED".equals(normalized) && !"REJECTED".equals(normalized);
    }

    private boolean equalsIgnoreCase(String a, String b) {
        return a != null && b != null && a.trim().equalsIgnoreCase(b.trim());
    }

    private String defaultValue(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }

        private String trimToNull(String value) {
                if (value == null) {
                        return null;
                }
                String trimmed = value.trim();
                return trimmed.isEmpty() ? null : trimmed;
        }
}
