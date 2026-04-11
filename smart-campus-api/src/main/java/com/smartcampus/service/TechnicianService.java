package com.smartcampus.service;

import com.smartcampus.dto.request.UpdateIncidentTicketRequest;
import com.smartcampus.dto.response.AdminIncidentTicketDto;
import com.smartcampus.dto.response.TicketCommentDto;
import com.smartcampus.dto.response.TechnicianDashboardResponse;
import com.smartcampus.entity.IncidentTicket;
import com.smartcampus.entity.Role;
import com.smartcampus.entity.User;
import com.smartcampus.repository.IncidentTicketRepository;
import com.smartcampus.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TechnicianService {

    private final UserRepository userRepository;
    private final IncidentTicketRepository incidentTicketRepository;
    private final NotificationService notificationService;

    public TechnicianDashboardResponse getOverview(String email) {
        User technician = findTechnicianByEmail(email);

        List<IncidentTicket> assignedTickets = incidentTicketRepository.findByAssignedTechnicianId(technician.getId())
                .stream()
                .sorted(Comparator.comparing(
                        IncidentTicket::getCreatedAt,
                        Comparator.nullsLast(Comparator.reverseOrder())
                ))
                .toList();

        Map<String, User> userMap = userRepository.findAllById(
                assignedTickets.stream().map(IncidentTicket::getUserId).collect(Collectors.toSet())
        ).stream().collect(Collectors.toMap(User::getId, u -> u));

        long open = assignedTickets.stream()
                .filter(t -> {
                    String status = normalizeStatus(t.getStatus());
                    return "OPEN".equals(status) || "PENDING".equals(status);
                })
                .count();

        long inProgress = assignedTickets.stream()
                .filter(t -> "IN_PROGRESS".equals(normalizeStatus(t.getStatus())))
                .count();

        long resolvedClosed = assignedTickets.stream()
                .filter(t -> {
                    String status = normalizeStatus(t.getStatus());
                    return "RESOLVED".equals(status) || "CLOSED".equals(status);
                })
                .count();

        List<AdminIncidentTicketDto> ticketDtos = assignedTickets.stream()
                .map(ticket -> toTicketDto(ticket, userMap.get(ticket.getUserId())))
                .toList();

        return TechnicianDashboardResponse.builder()
                .technician(TechnicianDashboardResponse.TechnicianSummary.builder()
                        .id(technician.getId())
                        .name(technician.getName())
                        .email(technician.getEmail())
                        .role(technician.getRole().name())
                        .build())
                .stats(TechnicianDashboardResponse.TicketStats.builder()
                        .assigned(assignedTickets.size())
                        .open(open)
                        .inProgress(inProgress)
                        .resolvedClosed(resolvedClosed)
                        .build())
                .assignedTickets(ticketDtos)
                .build();
    }

    public AdminIncidentTicketDto updateAssignedTicket(String email, String ticketId, UpdateIncidentTicketRequest request) {
        User technician = findTechnicianByEmail(email);

        IncidentTicket ticket = incidentTicketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        if (!technician.getId().equals(ticket.getAssignedTechnicianId())) {
            throw new RuntimeException("You can only update tickets assigned to you");
        }

                String currentStatus = normalizeStatus(ticket.getStatus());
                String requestedStatus = trimToNull(request.getStatus());
                String effectiveNotes = trimToNull(request.getResolutionNotes());
                String normalizedNextStatus = null;

                if (requestedStatus != null) {
                        normalizedNextStatus = requestedStatus.toUpperCase();
                        validateTechnicianTransition(currentStatus, normalizedNextStatus);

                        if ("REJECTED".equals(normalizedNextStatus) && effectiveNotes == null) {
                                throw new RuntimeException("Rejection reason is required when rejecting a ticket");
                        }

                        if ("RESOLVED".equals(normalizedNextStatus) && effectiveNotes == null) {
                                throw new RuntimeException("Resolution notes are required when marking a ticket as resolved");
                        }

                        ticket.setStatus(normalizedNextStatus);
        }

                if (ticket.getFirstResponseAt() == null) {
                        ticket.setFirstResponseAt(LocalDateTime.now());
                }

                if ("RESOLVED".equals(normalizedNextStatus)
                                && !"RESOLVED".equals(currentStatus)
                                && ticket.getResolvedAt() == null) {
                        ticket.setResolvedAt(LocalDateTime.now());
                }

        if (request.getResolutionNotes() != null) {
            String notes = request.getResolutionNotes().trim();
            ticket.setResolutionNotes(notes.isEmpty() ? null : notes);
        }

        IncidentTicket saved = incidentTicketRepository.save(ticket);

        if (requestedStatus != null && !currentStatus.equalsIgnoreCase(saved.getStatus())) {
            notificationService.sendTicketStatusUpdatedNotifications(technician, saved.getUserId(), technician.getId(), saved.getId(), currentStatus, saved.getStatus());
        }

        User reporter = userRepository.findById(saved.getUserId()).orElse(null);
        return toTicketDto(saved, reporter);
    }

    private User findTechnicianByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Technician not found"));
        if (user.getRole() != Role.TECHNICIAN) {
            throw new RuntimeException("Access denied: technician role required");
        }
        return user;
    }

    private String normalizeStatus(String status) {
                String normalized = trimToNull(status);
                return normalized == null ? "OPEN" : normalized.toUpperCase();
        }

        private String trimToNull(String value) {
                if (value == null) {
                        return null;
                }
                String trimmed = value.trim();
                return trimmed.isEmpty() ? null : trimmed;
        }

        private void validateTechnicianTransition(String currentStatus, String nextStatus) {
                if (nextStatus == null || nextStatus.isBlank()) {
                        throw new RuntimeException("Ticket status is required");
                }

                switch (currentStatus) {
                        case "OPEN", "PENDING" -> {
                                if (!"OPEN".equals(nextStatus) && !"IN_PROGRESS".equals(nextStatus)) {
                                        throw new RuntimeException("Technicians can only keep tickets OPEN or move them to IN_PROGRESS from " + currentStatus);
                                }
                        }
                        case "IN_PROGRESS" -> {
                                if (!"REJECTED".equals(nextStatus) && !"RESOLVED".equals(nextStatus)) {
                                        throw new RuntimeException("Allowed transitions from IN_PROGRESS are REJECTED or RESOLVED");
                                }
                        }
                        case "RESOLVED" -> {
                                if (!"RESOLVED".equals(nextStatus) && !"CLOSED".equals(nextStatus)) {
                                        throw new RuntimeException("Allowed transitions from RESOLVED are RESOLVED or CLOSED");
                                }
                        }
                        case "CLOSED" -> {
                                if (!"CLOSED".equals(nextStatus)) {
                                        throw new RuntimeException("Closed tickets cannot transition to another status");
                                }
                        }
                        case "REJECTED" -> {
                                if (!"REJECTED".equals(nextStatus)) {
                                        throw new RuntimeException("Rejected tickets cannot transition to another status");
                                }
                        }
                        default -> throw new RuntimeException("Unknown ticket status: " + currentStatus);
                }
    }

    private AdminIncidentTicketDto toTicketDto(IncidentTicket ticket, User reporter) {
                Long firstResponseMinutes = computeDurationMinutes(ticket.getCreatedAt(), ticket.getFirstResponseAt());
                Long resolutionMinutes = computeDurationMinutes(ticket.getCreatedAt(), ticket.getResolvedAt());

        return AdminIncidentTicketDto.builder()
                .id(ticket.getId())
                .userId(ticket.getUserId())
                .ticketId(ticket.getTicketId())
                .location(ticket.getLocation())
                .category(ticket.getCategory())
                .priority(ticket.getPriority())
                .description(ticket.getDescription())
                .preferredContact(ticket.getPreferredContact())
                                .reporterName(reporter != null ? reporter.getName() : null)
                                .reporterEmail(reporter != null ? reporter.getEmail() : null)
                .imageNames(ticket.getImageNames() == null ? List.of() : ticket.getImageNames())
                .imageDataUrls(ticket.getImageDataUrls() == null ? List.of() : ticket.getImageDataUrls())
                .status(ticket.getStatus())
                .assignedTechnicianId(ticket.getAssignedTechnicianId())
                .assignedTechnicianName(ticket.getAssignedTechnicianName())
                .resolutionNotes(ticket.getResolutionNotes())
                                .firstResponseAt(ticket.getFirstResponseAt())
                                .resolvedAt(ticket.getResolvedAt())
                                .timeToFirstResponseMinutes(firstResponseMinutes)
                                .timeToResolutionMinutes(resolutionMinutes)
                                .comments(TicketCommentDto.fromList(ticket.getComments()))
                .createdAt(ticket.getCreatedAt())
                .build();
    }

        private Long computeDurationMinutes(LocalDateTime start, LocalDateTime end) {
                if (start == null || end == null || end.isBefore(start)) {
                        return null;
                }
                return Duration.between(start, end).toMinutes();
        }
}
