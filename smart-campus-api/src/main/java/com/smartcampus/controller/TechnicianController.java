package com.smartcampus.controller;

import com.smartcampus.dto.request.UpdateIncidentTicketRequest;
import com.smartcampus.dto.response.AdminIncidentTicketDto;
import com.smartcampus.dto.response.TechnicianDashboardResponse;
import com.smartcampus.security.oauth2.OAuth2UserPrincipal;
import com.smartcampus.service.TechnicianService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/technician")
@RequiredArgsConstructor
@PreAuthorize("hasRole('TECHNICIAN')")
public class TechnicianController {

    private final TechnicianService technicianService;

    @GetMapping("/overview")
    public ResponseEntity<?> getOverview(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        }

        Object principal = authentication.getPrincipal();

        if (principal instanceof UserDetails userDetails) {
            TechnicianDashboardResponse response = technicianService.getOverview(userDetails.getUsername());
            return ResponseEntity.ok(response);
        }

        if (principal instanceof OAuth2UserPrincipal oauth2User) {
            TechnicianDashboardResponse response = technicianService.getOverview(oauth2User.getUser().getEmail());
            return ResponseEntity.ok(response);
        }

        return ResponseEntity.status(401).body(Map.of("error", "Unknown authentication type"));
    }

    @PatchMapping("/tickets/{ticketId}")
    public ResponseEntity<?> updateAssignedTicket(
            Authentication authentication,
            @PathVariable String ticketId,
            @RequestBody UpdateIncidentTicketRequest request) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        }

        Object principal = authentication.getPrincipal();

        if (principal instanceof UserDetails userDetails) {
            AdminIncidentTicketDto response = technicianService.updateAssignedTicket(userDetails.getUsername(), ticketId, request);
            return ResponseEntity.ok(response);
        }

        if (principal instanceof OAuth2UserPrincipal oauth2User) {
            AdminIncidentTicketDto response = technicianService.updateAssignedTicket(oauth2User.getUser().getEmail(), ticketId, request);
            return ResponseEntity.ok(response);
        }

        return ResponseEntity.status(401).body(Map.of("error", "Unknown authentication type"));
    }
}
