package com.smartcampus.controller;

import com.smartcampus.dto.request.CreateIncidentTicketRequest;
import com.smartcampus.dto.response.UserDashboardResponse;
import com.smartcampus.security.oauth2.OAuth2UserPrincipal;
import com.smartcampus.service.UserDashboardService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class UserDashboardController {

    private final UserDashboardService userDashboardService;

    @GetMapping("/overview")
    public ResponseEntity<?> getOverview(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        }

        Object principal = authentication.getPrincipal();

        if (principal instanceof UserDetails userDetails) {
            UserDashboardResponse response = userDashboardService.getOverview(userDetails.getUsername());
            return ResponseEntity.ok(response);
        }

        if (principal instanceof OAuth2UserPrincipal oauth2User) {
            UserDashboardResponse response = userDashboardService.getOverview(oauth2User.getUser().getEmail());
            return ResponseEntity.ok(response);
        }

        return ResponseEntity.status(401).body(Map.of("error", "Unknown authentication type"));
    }

    @PostMapping("/incidents")
    public ResponseEntity<?> reportIncident(
            Authentication authentication,
            @Valid @RequestBody CreateIncidentTicketRequest request
    ) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        }

        Object principal = authentication.getPrincipal();

        if (principal instanceof UserDetails userDetails) {
            return ResponseEntity.ok(userDashboardService.createIncidentTicket(userDetails.getUsername(), request));
        }

        if (principal instanceof OAuth2UserPrincipal oauth2User) {
            return ResponseEntity.ok(userDashboardService.createIncidentTicket(oauth2User.getUser().getEmail(), request));
        }

        return ResponseEntity.status(401).body(Map.of("error", "Unknown authentication type"));
    }
}
