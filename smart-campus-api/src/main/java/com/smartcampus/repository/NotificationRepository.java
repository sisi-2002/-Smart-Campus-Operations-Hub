package com.smartcampus.repository;

import com.smartcampus.entity.Notification;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.util.List;

public interface NotificationRepository extends MongoRepository<Notification, String> {

    // All notifications for a specific user — newest first
    List<Notification> findByRecipientUserIdOrderByCreatedAtDesc(String userId);

    // Only unread notifications for a user
    List<Notification> findByRecipientUserIdAndReadFalseOrderByCreatedAtDesc(String userId);

    // Count unread — used for badge number on bell icon
    long countByRecipientUserIdAndReadFalse(String userId);

    // Role-based notifications (e.g. all ADMINs see a booking request)
    List<Notification> findByTargetRoleOrderByCreatedAtDesc(String role);

    // Unread role-based notifications
    List<Notification> findByTargetRoleAndReadFalseOrderByCreatedAtDesc(String role);

    // Count unread role notifications
    long countByTargetRoleAndReadFalse(String role);

    // Delete old notifications for cleanup
    @Query(value = "{ 'recipientUserId': ?0 }", delete = true)
    void deleteAllByRecipientUserId(String userId);
}