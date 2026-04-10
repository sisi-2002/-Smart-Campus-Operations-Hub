package com.smartcampus.controller;

import com.smartcampus.dto.request.UpdateRoleRequest;
import com.smartcampus.dto.request.UpdateIncidentTicketRequest;
import com.smartcampus.dto.response.AdminIncidentTicketDto;
import com.smartcampus.dto.response.UserSummaryDto;
import com.smartcampus.service.AdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")   // ADMIN and MANAGER can use shared dashboard APIs
public class AdminController {

    private final AdminService adminService;

    // GET /api/admin/users — get all users
    @GetMapping("/users")
    public ResponseEntity<List<UserSummaryDto>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    // GET /api/admin/users/{userId} — get single user
    @GetMapping("/users/{userId}")
    public ResponseEntity<UserSummaryDto> getUser(
            @PathVariable String userId) {
        return ResponseEntity.ok(adminService.getUserById(userId));
    }

    // PATCH /api/admin/users/{userId}/role — update role
    @PatchMapping("/users/{userId}/role")
    public ResponseEntity<UserSummaryDto> updateRole(
            @PathVariable String userId,
            @Valid @RequestBody UpdateRoleRequest request) {
        return ResponseEntity.ok(adminService.updateRole(userId, request));
    }

    // PATCH /api/admin/users/{userId}/toggle — enable/disable account
    @PatchMapping("/users/{userId}/toggle")
    public ResponseEntity<UserSummaryDto> toggleStatus(
            @PathVariable String userId) {
        return ResponseEntity.ok(adminService.toggleUserStatus(userId));
    }

    // DELETE /api/admin/users/{userId} — delete a user
    @DeleteMapping("/users/{userId}")
    public ResponseEntity<Void> deleteUser(@PathVariable String userId) {
        adminService.deleteUser(userId);
        return ResponseEntity.noContent().build();
    }

    // GET /api/admin/stats — quick summary numbers
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Long>> getStats() {
        List<UserSummaryDto> users = adminService.getAllUsers();
        return ResponseEntity.ok(Map.of(
            "total",      (long) users.size(),
            "admins",     users.stream().filter(u -> u.getRole().equals("ADMIN")).count(),
            "technicians",users.stream().filter(u -> u.getRole().equals("TECHNICIAN")).count(),
            "users",      users.stream().filter(u -> u.getRole().equals("USER")).count(),
            "mfaEnabled", users.stream().filter(UserSummaryDto::isMfaEnabled).count(),
            "disabled",   users.stream().filter(u -> !u.isEnabled()).count()
        ));
    }

    // GET /api/admin/tickets — all incident tickets
    @GetMapping("/tickets")
    public ResponseEntity<List<AdminIncidentTicketDto>> getAllIncidentTickets() {
        return ResponseEntity.ok(adminService.getAllIncidentTickets());
    }

    // PATCH/PUT/POST /api/admin/tickets/{ticketId} — update ticket status/assignment/notes
    @RequestMapping(value = "/tickets/{ticketId}", method = {RequestMethod.PATCH, RequestMethod.PUT, RequestMethod.POST})
    public ResponseEntity<AdminIncidentTicketDto> updateIncidentTicket(
            @PathVariable String ticketId,
            @RequestBody UpdateIncidentTicketRequest request,
            Authentication auth) {
        return ResponseEntity.ok(adminService.updateIncidentTicket(auth.getName(), ticketId, request));
    }

    // PATCH/PUT/POST /api/admin/tickets — fallback update by body id/ticketId
    @RequestMapping(value = "/tickets", method = {RequestMethod.PATCH, RequestMethod.PUT, RequestMethod.POST})
    public ResponseEntity<AdminIncidentTicketDto> updateIncidentTicketByBody(
            @RequestBody UpdateIncidentTicketRequest request,
            Authentication auth) {
        String idOrTicketId = request.getId();
        if (idOrTicketId == null || idOrTicketId.isBlank()) {
            idOrTicketId = request.getTicketId();
        }
        if (idOrTicketId == null || idOrTicketId.isBlank()) {
            throw new RuntimeException("Ticket id is required");
        }
        return ResponseEntity.ok(adminService.updateIncidentTicket(auth.getName(), idOrTicketId, request));
    }
}