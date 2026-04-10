package com.smartcampus.controller;

import com.smartcampus.dto.response.NotificationResponse;
import com.smartcampus.entity.User;
import com.smartcampus.repository.UserRepository;
import com.smartcampus.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final UserRepository userRepository;

    // GET /api/notifications — get all for current user
    @GetMapping
    public ResponseEntity<List<NotificationResponse>> getMyNotifications(
            Authentication auth) {
        User user = getUser(auth);
        return ResponseEntity.ok(
            notificationService.getNotificationsForUser(
                user.getId(), user.getRole().name()));
    }

    // GET /api/notifications/unread-count — for badge number
    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(
            Authentication auth) {
        User user = getUser(auth);
        long count = notificationService.getUnreadCount(
            user.getId(), user.getRole().name());
        return ResponseEntity.ok(Map.of("count", count));
    }

    // PATCH /api/notifications/{id}/read — mark one as read
    @PatchMapping("/{id}/read")
    public ResponseEntity<NotificationResponse> markAsRead(
            @PathVariable String id,
            Authentication auth) {
        User user = getUser(auth);
        return ResponseEntity.ok(
            notificationService.markAsRead(id, user.getId()));
    }

    // PATCH /api/notifications/read-all — mark all as read
    @PatchMapping("/read-all")
    public ResponseEntity<Map<String, String>> markAllAsRead(
            Authentication auth) {
        User user = getUser(auth);
        notificationService.markAllAsRead(user.getId(), user.getRole().name());
        return ResponseEntity.ok(Map.of("message", "All notifications marked as read"));
    }

    // DELETE /api/notifications/{id} — delete one
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteOne(
            @PathVariable String id,
            Authentication auth) {
        User user = getUser(auth);
        notificationService.deleteNotification(id, user.getId());
        return ResponseEntity.ok(Map.of("message", "Notification deleted"));
    }

    // DELETE /api/notifications/clear-all — delete all
    @DeleteMapping("/clear-all")
    public ResponseEntity<Map<String, String>> deleteAll(Authentication auth) {
        User user = getUser(auth);
        notificationService.deleteAll(user.getId());
        return ResponseEntity.ok(Map.of("message", "All notifications cleared"));
    }

    // POST /api/notifications/client - create localized notification
    @PostMapping("/client")
    public ResponseEntity<NotificationResponse> createClientNotification(
            @RequestBody com.smartcampus.dto.request.ClientNotificationRequest request,
            Authentication auth) {
        User user = getUser(auth);
        return ResponseEntity.ok(
            notificationService.createClientNotification(user.getId(), request));
    }

    // Helper — extract User from Authentication
    private User getUser(Authentication auth) {
        UserDetails ud = (UserDetails) auth.getPrincipal();
        return userRepository.findByEmail(ud.getUsername())
            .orElseThrow(() -> new RuntimeException("User not found"));
    }
}