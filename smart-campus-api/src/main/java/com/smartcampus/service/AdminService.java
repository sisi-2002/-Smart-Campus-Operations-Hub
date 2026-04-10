package com.smartcampus.service;

import com.smartcampus.dto.request.UpdateRoleRequest;
import com.smartcampus.dto.request.UpdateIncidentTicketRequest;
import com.smartcampus.dto.response.AdminIncidentTicketDto;
import com.smartcampus.dto.response.TicketCommentDto;
import com.smartcampus.dto.response.UserSummaryDto;
import com.smartcampus.entity.IncidentTicket;
import com.smartcampus.entity.Role;
import com.smartcampus.entity.TicketComment;
import com.smartcampus.entity.User;
import com.smartcampus.repository.IncidentTicketRepository;
import com.smartcampus.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.bson.Document;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.Comparator;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final IncidentTicketRepository incidentTicketRepository;
    private final MongoTemplate mongoTemplate;
    private final NotificationService notificationService;

    // GET all users — safe fields only
    public List<UserSummaryDto> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    // GET single user
    public UserSummaryDto getUserById(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return toDto(user);
    }

    // PATCH — update role
    public UserSummaryDto updateRole(String userId, UpdateRoleRequest request) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Validate the role string
        Role newRole;
        try {
            newRole = Role.valueOf(request.getRole().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid role: " + request.getRole()
                + ". Valid roles: USER, ADMIN, TECHNICIAN, MANAGER");
        }

        Role oldRole = user.getRole();
        user.setRole(newRole);

        // ✅ If promoted to privileged role — require 2FA setup on next login
        boolean wasPrivileged = isPrivileged(oldRole);
        boolean isNowPrivileged = isPrivileged(newRole);

        if (!wasPrivileged && isNowPrivileged) {
            // Reset MFA so they go through setup on next login
            user.setMfaEnabled(false);
            user.setMfaSecret(null);
            user.setMfaRequired(true);
        }

        // ✅ If demoted from privileged role — remove MFA requirement
        if (wasPrivileged && !isNowPrivileged) {
            user.setMfaEnabled(false);
            user.setMfaSecret(null);
            user.setMfaRequired(false);
        }

        userRepository.save(user);

        // ✅ Notify user their role changed
        notificationService.sendRoleChangedNotification(userId, newRole.name());

        return toDto(user);
    }

    // PATCH — enable or disable user account
    public UserSummaryDto toggleUserStatus(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setEnabled(!user.isEnabled());
        userRepository.save(user);

        // ✅ Notify user their account status changed
        notificationService.sendAccountStatusNotification(userId, user.isEnabled());

        return toDto(user);
    }

    // DELETE — delete user
    public void deleteUser(String userId) {
        if (!userRepository.existsById(userId)) {
            throw new RuntimeException("User not found");
        }
        userRepository.deleteById(userId);
    }

    // GET all incident tickets for ticket management
    public List<AdminIncidentTicketDto> getAllIncidentTickets() {
        try {
            return incidentTicketRepository.findAll()
                .stream()
                .sorted(Comparator.comparing(
                    IncidentTicket::getCreatedAt,
                    Comparator.nullsLast(Comparator.reverseOrder())
                ))
                .map(this::toIncidentTicketDto)
                .toList();
        } catch (Exception ignored) {
            return mongoTemplate.findAll(Document.class, "incident_tickets")
                .stream()
                .map(this::toIncidentTicketDtoFromDocument)
                .sorted(Comparator.comparing(
                    AdminIncidentTicketDto::getCreatedAt,
                    Comparator.nullsLast(Comparator.reverseOrder())
                ))
                .toList();
        }
    }

    public AdminIncidentTicketDto updateIncidentTicket(String ticketId, UpdateIncidentTicketRequest request) {
        IncidentTicket ticket = incidentTicketRepository.findById(ticketId)
            .or(() -> incidentTicketRepository.findByTicketId(ticketId))
            .orElseThrow(() -> new RuntimeException("Ticket not found"));

        String currentStatus = normalizeStatus(ticket.getStatus());
        String requestedStatus = trimToNull(request.getStatus());
        String effectiveNotes = trimToNull(request.getResolutionNotes());

        if (requestedStatus != null) {
            String normalizedNextStatus = requestedStatus.toUpperCase();
            validateAdminTransition(currentStatus, normalizedNextStatus);

            if ("REJECTED".equals(normalizedNextStatus) && effectiveNotes == null) {
                throw new RuntimeException("Rejection reason is required");
            }

            if ("RESOLVED".equals(normalizedNextStatus) && effectiveNotes == null) {
                throw new RuntimeException("Resolution notes are required when marking a ticket as resolved");
            }

            if ("CLOSED".equals(normalizedNextStatus) && !"CLOSED".equals(currentStatus) && effectiveNotes == null) {
                throw new RuntimeException("Resolution notes are required before closing a ticket");
            }

            ticket.setStatus(normalizedNextStatus);
        }

        if (request.getAssignedTechnicianId() != null) {
            String technicianId = request.getAssignedTechnicianId().trim();
            if (technicianId.isEmpty()) {
                ticket.setAssignedTechnicianId(null);
                ticket.setAssignedTechnicianName(null);
            } else {
                User technician = userRepository.findById(technicianId)
                        .orElseThrow(() -> new RuntimeException("Technician not found"));
                if (technician.getRole() != Role.TECHNICIAN) {
                    throw new RuntimeException("Selected user is not a technician");
                }
                if (!technician.isEnabled()) {
                    throw new RuntimeException("Selected technician account is disabled");
                }
                ticket.setAssignedTechnicianId(technician.getId());
                ticket.setAssignedTechnicianName(technician.getName());
            }
        }

        String normalizedDraftStatus = normalizeStatus(ticket.getStatus());
        boolean hasAssignedTechnician = trimToNull(ticket.getAssignedTechnicianId()) != null;
        boolean requestWantsOpenLikeStatus = requestedStatus == null
                || "OPEN".equalsIgnoreCase(requestedStatus)
                || "PENDING".equalsIgnoreCase(requestedStatus);

        if (hasAssignedTechnician && requestWantsOpenLikeStatus && isOpenLikeStatus(normalizedDraftStatus)) {
            ticket.setStatus("IN_PROGRESS");
        }

        if (request.getResolutionNotes() != null) {
            String notes = request.getResolutionNotes().trim();
            ticket.setResolutionNotes(notes.isEmpty() ? null : notes);
        }

        IncidentTicket saved = incidentTicketRepository.save(ticket);
        return toIncidentTicketDto(saved);
    }

    // Helper
    private boolean isPrivileged(Role role) {
        return role == Role.ADMIN
            || role == Role.TECHNICIAN
            || role == Role.MANAGER;
    }

    // Convert User → safe DTO
    private UserSummaryDto toDto(User user) {
        return UserSummaryDto.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .provider(user.getProvider().name())
                .mfaEnabled(user.isMfaEnabled())
                .enabled(user.isEnabled())
                .createdAt(user.getCreatedAt())
                .build();
    }

    private AdminIncidentTicketDto toIncidentTicketDto(IncidentTicket ticket) {
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

    private AdminIncidentTicketDto toIncidentTicketDtoFromDocument(Document doc) {
        Object idRaw = doc.get("_id");
        String id = idRaw instanceof ObjectId ? ((ObjectId) idRaw).toHexString() : safeString(idRaw);
            LocalDateTime createdAt = safeDateTime(doc.get("createdAt"));
            LocalDateTime firstResponseAt = safeDateTime(doc.get("firstResponseAt"));
            LocalDateTime resolvedAt = safeDateTime(doc.get("resolvedAt"));
            Long firstResponseMinutes = computeDurationMinutes(createdAt, firstResponseAt);
            Long resolutionMinutes = computeDurationMinutes(createdAt, resolvedAt);

        return AdminIncidentTicketDto.builder()
                .id(id)
                .userId(safeString(doc.get("userId")))
                .ticketId(safeString(doc.get("ticketId")))
                .location(safeString(doc.get("location")))
                .category(safeString(doc.get("category")))
                .priority(safeString(doc.get("priority")))
                .description(safeString(doc.get("description")))
                .preferredContact(safeString(doc.get("preferredContact")))
                .imageNames(safeStringList(doc.get("imageNames")))
                .imageDataUrls(safeStringList(doc.get("imageDataUrls")))
                .status(safeString(doc.get("status")))
                .assignedTechnicianId(safeString(doc.get("assignedTechnicianId")))
                .assignedTechnicianName(safeString(doc.get("assignedTechnicianName")))
                .resolutionNotes(safeString(doc.get("resolutionNotes")))
                .firstResponseAt(firstResponseAt)
                .resolvedAt(resolvedAt)
                .timeToFirstResponseMinutes(firstResponseMinutes)
                .timeToResolutionMinutes(resolutionMinutes)
                .comments(safeCommentList(doc.get("comments")))
                .createdAt(createdAt)
                .build();
    }

    private Long computeDurationMinutes(LocalDateTime start, LocalDateTime end) {
        if (start == null || end == null || end.isBefore(start)) {
            return null;
        }
        return Duration.between(start, end).toMinutes();
    }

    private String safeString(Object value) {
        if (value == null) {
            return null;
        }
        String str = String.valueOf(value).trim();
        return str.isEmpty() ? null : str;
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private String normalizeStatus(String status) {
        String normalized = trimToNull(status);
        return normalized == null ? "OPEN" : normalized.toUpperCase();
    }

    private boolean isOpenLikeStatus(String status) {
        return "OPEN".equals(status) || "PENDING".equals(status);
    }

    private void validateAdminTransition(String currentStatus, String nextStatus) {
        if (nextStatus == null || nextStatus.isBlank()) {
            throw new RuntimeException("Ticket status is required");
        }

        switch (currentStatus) {
            case "OPEN", "PENDING" -> {
                if (!"OPEN".equals(nextStatus) && !"IN_PROGRESS".equals(nextStatus) && !"REJECTED".equals(nextStatus)) {
                    throw new RuntimeException("Allowed transitions from " + currentStatus + " are OPEN, IN_PROGRESS, or REJECTED");
                }
            }
            case "IN_PROGRESS" -> {
                if (!"IN_PROGRESS".equals(nextStatus) && !"RESOLVED".equals(nextStatus) && !"REJECTED".equals(nextStatus)) {
                    throw new RuntimeException("Allowed transitions from IN_PROGRESS are IN_PROGRESS, RESOLVED, or REJECTED");
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

    private List<String> safeStringList(Object value) {
        if (value instanceof List<?> list) {
            return list.stream()
                    .map(item -> item == null ? null : String.valueOf(item))
                    .filter(item -> item != null && !item.isBlank())
                    .toList();
        }
        return List.of();
    }

    private List<TicketCommentDto> safeCommentList(Object value) {
        if (!(value instanceof List<?> list)) {
            return List.of();
        }

        return list.stream()
                .filter(item -> item instanceof Document)
                .map(item -> (Document) item)
                .map(doc -> TicketCommentDto.from(TicketComment.builder()
                        .id(safeString(doc.get("id")))
                        .parentCommentId(safeString(doc.get("parentCommentId")))
                        .authorUserId(safeString(doc.get("authorUserId")))
                        .authorName(safeString(doc.get("authorName")))
                        .authorRole(safeString(doc.get("authorRole")))
                        .message(safeString(doc.get("message")))
                        .createdAt(safeDateTime(doc.get("createdAt")))
                        .updatedAt(safeDateTime(doc.get("updatedAt")))
                        .build()))
                .filter(item -> item != null)
                .toList();
    }

    private LocalDateTime safeDateTime(Object value) {
        if (value == null) {
            return null;
        }
        if (value instanceof LocalDateTime localDateTime) {
            return localDateTime;
        }
        if (value instanceof Date date) {
            return LocalDateTime.ofInstant(date.toInstant(), ZoneId.systemDefault());
        }
        String raw = String.valueOf(value);
        try {
            return OffsetDateTime.parse(raw).toLocalDateTime();
        } catch (Exception ignored) {
            try {
                return LocalDateTime.parse(raw);
            } catch (Exception ignoredAgain) {
                return null;
            }
        }
    }
}