package com.smartcampus.controller;

import com.smartcampus.dto.request.AddTicketCommentRequest;
import com.smartcampus.dto.request.UpdateTicketCommentRequest;
import com.smartcampus.dto.response.TicketCommentDto;
import com.smartcampus.security.oauth2.OAuth2UserPrincipal;
import com.smartcampus.service.TicketCommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping({"/api/tickets/{ticketId}/comments", "/api/dashboard/tickets/{ticketId}/comments"})
@RequiredArgsConstructor
public class TicketCommentController {

    private final TicketCommentService ticketCommentService;

    @GetMapping
    public ResponseEntity<?> listComments(Authentication authentication, @PathVariable String ticketId) {
        String email = resolveAuthenticatedEmail(authentication);
        if (email == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        }

        List<TicketCommentDto> comments = ticketCommentService.listComments(email, ticketId);
        return ResponseEntity.ok(comments);
    }

    @PostMapping
    public ResponseEntity<?> addComment(
            Authentication authentication,
            @PathVariable String ticketId,
            @RequestBody AddTicketCommentRequest request
    ) {
        String email = resolveAuthenticatedEmail(authentication);
        if (email == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        }

        TicketCommentDto created = ticketCommentService.addComment(email, ticketId, request);
        return ResponseEntity.ok(created);
    }

    @PatchMapping("/{commentId}")
    public ResponseEntity<?> updateComment(
            Authentication authentication,
            @PathVariable String ticketId,
            @PathVariable String commentId,
            @RequestBody UpdateTicketCommentRequest request
    ) {
        String email = resolveAuthenticatedEmail(authentication);
        if (email == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        }

        TicketCommentDto updated = ticketCommentService.updateComment(email, ticketId, commentId, request);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{commentId}")
    public ResponseEntity<?> deleteComment(
            Authentication authentication,
            @PathVariable String ticketId,
            @PathVariable String commentId
    ) {
        String email = resolveAuthenticatedEmail(authentication);
        if (email == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        }

        ticketCommentService.deleteComment(email, ticketId, commentId);
        return ResponseEntity.noContent().build();
    }

    private String resolveAuthenticatedEmail(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }

        Object principal = authentication.getPrincipal();
        if (principal instanceof UserDetails userDetails) {
            return userDetails.getUsername();
        }

        if (principal instanceof OAuth2UserPrincipal oauth2User) {
            return oauth2User.getUser().getEmail();
        }

        return null;
    }
}
