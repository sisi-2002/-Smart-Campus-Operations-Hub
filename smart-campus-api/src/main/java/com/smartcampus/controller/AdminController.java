package com.smartcampus.controller;

import com.smartcampus.dto.request.UpdateRoleRequest;
import com.smartcampus.dto.response.AdminIncidentTicketDto;
import com.smartcampus.dto.response.UserSummaryDto;
import com.smartcampus.service.AdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")   // ✅ Entire controller — ADMIN only
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
}