package com.smartcampus.service;

import com.smartcampus.dto.response.NotificationResponse;
import com.smartcampus.entity.Notification;
import com.smartcampus.entity.NotificationType;
import com.smartcampus.entity.User;
import com.smartcampus.repository.NotificationRepository;
import com.smartcampus.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    // ================================================================
    //  CORE CRUD METHODS
    // ================================================================

    // Get all notifications for a user (personal + role-based)
    public List<NotificationResponse> getNotificationsForUser(String userId, String role) {
        List<Notification> personal = notificationRepository
            .findByRecipientUserIdOrderByCreatedAtDesc(userId);

        List<Notification> roleBased = notificationRepository
            .findByTargetRoleOrderByCreatedAtDesc(role);

        // Merge, remove duplicates, sort by date
        return java.util.stream.Stream.concat(personal.stream(), roleBased.stream())
            .distinct()
            .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
            .map(this::toDto)
            .collect(Collectors.toList());
    }

    // Count unread for badge
    public long getUnreadCount(String userId, String role) {
        long personal  = notificationRepository.countByRecipientUserIdAndReadFalse(userId);
        long roleBased = notificationRepository.countByTargetRoleAndReadFalse(role);
        return personal + roleBased;
    }

    // Mark single notification as read
    public NotificationResponse markAsRead(String notificationId, String userId) {
        Notification notification = notificationRepository.findById(notificationId)
            .orElseThrow(() -> new RuntimeException("Notification not found"));

        // Security check — only owner or role match can mark as read
        if (!notification.getRecipientUserId().equals(userId)
                && notification.getTargetRole() == null) {
            throw new RuntimeException("Access denied");
        }

        notification.setRead(true);
        notificationRepository.save(notification);
        return toDto(notification);
    }

    // Mark ALL notifications as read for a user
    public void markAllAsRead(String userId, String role) {
        // Personal notifications
        List<Notification> personal = notificationRepository
            .findByRecipientUserIdAndReadFalseOrderByCreatedAtDesc(userId);
        personal.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(personal);

        // Role-based notifications
        List<Notification> roleBased = notificationRepository
            .findByTargetRoleAndReadFalseOrderByCreatedAtDesc(role);
        roleBased.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(roleBased);
    }

    // Delete a single notification
    public void deleteNotification(String notificationId, String userId) {
        Notification notification = notificationRepository.findById(notificationId)
            .orElseThrow(() -> new RuntimeException("Notification not found"));

        if (!notification.getRecipientUserId().equals(userId)) {
            throw new RuntimeException("Access denied");
        }
        notificationRepository.delete(notification);
    }

    // Delete all notifications for a user
    public void deleteAll(String userId) {
        notificationRepository.deleteAllByRecipientUserId(userId);
    }

    // ================================================================
    //  NOTIFICATION TRIGGER METHODS
    //  These are called from other services to create notifications
    // ================================================================

    // ─── Welcome notification ─────────────────────────────────────────
    // Called from: AuthService.register()
    public void sendWelcomeNotification(String userId, String userName) {
        create(Notification.builder()
            .recipientUserId(userId)
            .type(NotificationType.WELCOME)
            .title("Welcome to Smart Campus! 🎓")
            .message("Hi " + userName + "! Your account is ready. "
                + "You can now book resources and report incidents.")
            .relatedEntityType("USER")
            .build());
    }

    // ─── Role change notification ──────────────────────────────────────
    // Called from: AdminService.updateRole()
    public void sendRoleChangedNotification(String userId, String newRole) {
        String message = switch (newRole) {
            case "ADMIN"      -> "You have been granted System Administrator access. "
                                + "2FA setup required on next login.";
            case "TECHNICIAN" -> "You have been assigned the Technician role. "
                                + "You can now manage maintenance tickets. "
                                + "2FA setup required on next login.";
            case "MANAGER"    -> "You have been assigned the Manager role. "
                                + "2FA setup required on next login.";
            default           -> "Your account role has been updated to " + newRole + ".";
        };

        create(Notification.builder()
            .recipientUserId(userId)
            .type(NotificationType.ROLE_CHANGED)
            .title("Your role has been updated")
            .message(message)
            .relatedEntityType("USER")
            .build());
    }

    // ─── Account status notification ──────────────────────────────────
    // Called from: AdminService.toggleUserStatus()
    public void sendAccountStatusNotification(String userId, boolean enabled) {
        create(Notification.builder()
            .recipientUserId(userId)
            .type(enabled ? NotificationType.ACCOUNT_ENABLED
                          : NotificationType.ACCOUNT_DISABLED)
            .title(enabled ? "Account Enabled" : "Account Disabled")
            .message(enabled
                ? "Your account has been re-enabled. You can now log in."
                : "Your account has been disabled. Contact an administrator.")
            .relatedEntityType("USER")
            .build());
    }

    // ================================================================
    //  MODULE B — BOOKING NOTIFICATIONS
    //  TODO: Uncomment and call these from BookingService when Module B
    //        is implemented by your team member.
    // ================================================================

    /*
     * Called from: BookingService.createBooking()
     * Notifies all ADMINs that a new booking request is pending.
     *
    public void sendBookingCreatedNotification(String bookingId,
            String resourceName, String requestedByName) {
        // Notify all admins — use targetRole instead of specific userId
        create(Notification.builder()
            .targetRole("ADMIN")
            .type(NotificationType.BOOKING_CREATED)
            .title("New Booking Request")
            .message(requestedByName + " requested to book " + resourceName
                + ". Review and approve or reject.")
            .relatedEntityId(bookingId)
            .relatedEntityType("BOOKING")
            .build());
    }
    */

    /*
     * Called from: BookingService.approveBooking()
     * Notifies the user their booking was approved.
     *
    public void sendBookingApprovedNotification(String userId,
            String bookingId, String resourceName, String date) {
        create(Notification.builder()
            .recipientUserId(userId)
            .type(NotificationType.BOOKING_APPROVED)
            .title("Booking Approved ✓")
            .message("Your booking for " + resourceName + " on "
                + date + " has been approved.")
            .relatedEntityId(bookingId)
            .relatedEntityType("BOOKING")
            .build());
    }
    */

    /*
     * Called from: BookingService.rejectBooking()
     * Notifies the user their booking was rejected with a reason.
     *
    public void sendBookingRejectedNotification(String userId,
            String bookingId, String resourceName, String reason) {
        create(Notification.builder()
            .recipientUserId(userId)
            .type(NotificationType.BOOKING_REJECTED)
            .title("Booking Rejected")
            .message("Your booking for " + resourceName
                + " was rejected. Reason: " + reason)
            .relatedEntityId(bookingId)
            .relatedEntityType("BOOKING")
            .build());
    }
    */

    /*
     * Called from: BookingService.cancelBooking()
     * Notifies admin that a booking was cancelled.
     *
    public void sendBookingCancelledNotification(String adminId,
            String bookingId, String resourceName, String cancelledByName) {
        create(Notification.builder()
            .targetRole("ADMIN")
            .type(NotificationType.BOOKING_CANCELLED)
            .title("Booking Cancelled")
            .message(cancelledByName + " cancelled their booking for "
                + resourceName + ".")
            .relatedEntityId(bookingId)
            .relatedEntityType("BOOKING")
            .build());
    }
    */

    // ================================================================
    //  MODULE C — TICKET NOTIFICATIONS
    //  TODO: Uncomment and call these from TicketService /
    //        TicketCommentService when Module C is implemented.
    // ================================================================

    /*
     * Called from: TicketService.createTicket()
     * Notifies ADMINs and TECHNICIANs about a new incident ticket.
     *
    public void sendTicketCreatedNotification(String ticketId,
            String category, String priority, String reportedByName) {
        // Notify admins
        create(Notification.builder()
            .targetRole("ADMIN")
            .type(NotificationType.TICKET_CREATED)
            .title("New Incident Ticket [" + priority + "]")
            .message(reportedByName + " reported a " + category
                + " issue. Priority: " + priority)
            .relatedEntityId(ticketId)
            .relatedEntityType("TICKET")
            .build());

        // Also notify technicians
        create(Notification.builder()
            .targetRole("TECHNICIAN")
            .type(NotificationType.TICKET_CREATED)
            .title("New Incident Ticket [" + priority + "]")
            .message("New " + category + " incident reported by "
                + reportedByName + ". Priority: " + priority)
            .relatedEntityId(ticketId)
            .relatedEntityType("TICKET")
            .build());
    }
    */

    /*
     * Called from: TechnicianService.assignTicket()
     * Notifies a specific technician they were assigned a ticket.
     *
    public void sendTicketAssignedNotification(String technicianId,
            String ticketId, String category) {
        create(Notification.builder()
            .recipientUserId(technicianId)
            .type(NotificationType.TICKET_ASSIGNED)
            .title("Ticket Assigned to You")
            .message("You have been assigned a " + category
                + " incident ticket. Please review and begin work.")
            .relatedEntityId(ticketId)
            .relatedEntityType("TICKET")
            .build());
    }
    */

    /*
     * Called from: TechnicianService.updateTicketStatus()
     * Notifies the ticket owner their ticket status changed.
     *
    public void sendTicketStatusUpdatedNotification(String userId,
            String ticketId, String oldStatus, String newStatus) {
        create(Notification.builder()
            .recipientUserId(userId)
            .type(NotificationType.TICKET_STATUS_UPDATED)
            .title("Ticket Status Updated")
            .message("Your ticket status changed from "
                + oldStatus + " to " + newStatus + ".")
            .relatedEntityId(ticketId)
            .relatedEntityType("TICKET")
            .build());
    }
    */

    /*
     * Called from: TicketCommentService.addComment()
     * Notifies ticket owner when someone comments on their ticket.
     *
    public void sendCommentAddedNotification(String ticketOwnerId,
            String ticketId, String commenterName) {
        // Don't notify if commenting on own ticket
        create(Notification.builder()
            .recipientUserId(ticketOwnerId)
            .type(NotificationType.TICKET_COMMENT_ADDED)
            .title("New Comment on Your Ticket")
            .message(commenterName + " added a comment on your ticket.")
            .relatedEntityId(ticketId)
            .relatedEntityType("TICKET")
            .build());
    }
    */

    // ================================================================
    //  INTERNAL HELPERS
    // ================================================================

    // Save a notification to DB
    private void create(Notification notification) {
        notificationRepository.save(notification);
        log.info("Notification created: type={}, recipient={}, role={}",
            notification.getType(),
            notification.getRecipientUserId(),
            notification.getTargetRole());
    }

    // Convert entity to DTO
    private NotificationResponse toDto(Notification n) {
        return NotificationResponse.builder()
            .id(n.getId())
            .type(n.getType().name())
            .title(n.getTitle())
            .message(n.getMessage())
            .relatedEntityId(n.getRelatedEntityId())
            .relatedEntityType(n.getRelatedEntityType())
            .read(n.isRead())
            .createdAt(n.getCreatedAt())
            .build();
    }
}