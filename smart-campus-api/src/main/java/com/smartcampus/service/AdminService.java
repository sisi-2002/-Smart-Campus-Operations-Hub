package com.smartcampus.service;

import com.smartcampus.dto.request.UpdateRoleRequest;
import com.smartcampus.dto.response.AdminIncidentTicketDto;
import com.smartcampus.dto.response.UserSummaryDto;
import com.smartcampus.entity.IncidentTicket;
import com.smartcampus.entity.Role;
import com.smartcampus.entity.User;
import com.smartcampus.repository.IncidentTicketRepository;
import com.smartcampus.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final IncidentTicketRepository incidentTicketRepository;

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
        return toDto(user);
    }

    // PATCH — enable or disable user account
    public UserSummaryDto toggleUserStatus(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setEnabled(!user.isEnabled());
        userRepository.save(user);
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
        return incidentTicketRepository.findAll()
                .stream()
                .sorted(Comparator.comparing(
                        IncidentTicket::getCreatedAt,
                        Comparator.nullsLast(Comparator.reverseOrder())
                ))
                .map(this::toIncidentTicketDto)
                .toList();
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
                .createdAt(ticket.getCreatedAt())
                .build();
    }
}