package com.smartcampus.entity;

public enum NotificationType {

    // ─── Booking notifications ──────────────────────────────────────
    // MODULE B: These are triggered from BookingService
    BOOKING_CREATED,        // Admin notified when user creates booking
    BOOKING_APPROVED,       // User notified when admin approves
    BOOKING_REJECTED,       // User notified when admin rejects
    BOOKING_CANCELLED,      // Admin notified when user cancels

    // ─── Ticket notifications ────────────────────────────────────────
    // MODULE C: These are triggered from TicketService
    TICKET_CREATED,         // Admin/Technician notified when ticket opened
    TICKET_UPDATED,         // Admin/Manager/User notified when details updated
    TICKET_ASSIGNED,        // Technician notified when ticket assigned to them
    TICKET_STATUS_UPDATED,  // User notified when their ticket status changes
    TICKET_RESOLVED,        // User notified when ticket is resolved
    TICKET_CLOSED,          // User notified when ticket is closed

    // ─── Comment notifications ───────────────────────────────────────
    // MODULE C: Triggered from TicketCommentService
    TICKET_COMMENT_ADDED,   // User notified when comment added to their ticket

    // ─── Role / account notifications ────────────────────────────────
    // Already works — triggered from AdminService
    ROLE_CHANGED,           // User notified when admin changes their role
    ACCOUNT_ENABLED,        // User notified when account is re-enabled
    ACCOUNT_DISABLED,       // User notified when account is disabled

    // ─── System notifications ─────────────────────────────────────────
    SYSTEM_ANNOUNCEMENT,    // Broadcast to all users
    WELCOME                 // Sent on registration
}