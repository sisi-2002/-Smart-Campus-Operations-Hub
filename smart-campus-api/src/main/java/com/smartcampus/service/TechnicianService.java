package com.smartcampus.service;

import com.smartcampus.dto.request.UpdateIncidentTicketRequest;
import com.smartcampus.dto.response.AdminIncidentTicketDto;
import com.smartcampus.dto.response.TechnicianDashboardResponse;
import com.smartcampus.entity.IncidentTicket;
import com.smartcampus.entity.Role;
import com.smartcampus.entity.User;
import com.smartcampus.repository.IncidentTicketRepository;
import com.smartcampus.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TechnicianService {

    private final UserRepository userRepository;
    private final IncidentTicketRepository incidentTicketRepository;

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

        if (request.getStatus() != null && !request.getStatus().isBlank()) {
            ticket.setStatus(request.getStatus().trim().toUpperCase());
        }

        if (request.getResolutionNotes() != null) {
            String notes = request.getResolutionNotes().trim();
            ticket.setResolutionNotes(notes.isEmpty() ? null : notes);
        }

        IncidentTicket saved = incidentTicketRepository.save(ticket);
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
        return status == null ? "OPEN" : status.trim().toUpperCase();
    }

    private AdminIncidentTicketDto toTicketDto(IncidentTicket ticket, User reporter) {
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
                .createdAt(ticket.getCreatedAt())
                .build();
    }
}
