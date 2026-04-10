package com.smartcampus.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDashboardResponse {

    private UserSummary user;
    private DashboardStats stats;
    private List<RecentBookingItem> recentBookings;
    private List<ActiveTicketItem> activeTickets;
    private List<ActiveTicketItem> incidentTickets;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserSummary {
        private String id;
        private String name;
        private String email;
        private String role;
        private String provider;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DashboardStats {
        private long upcomingBookings;
        private long pendingRequests;
        private long openTickets;
        private long resolvedTickets;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecentBookingItem {
        private String id;
        private String resource;
        private String date;
        private String time;
        private String status;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ActiveTicketItem {
        private String id;
        private String ticketId;
        private String location;
        private String category;
        private String priority;
        private String description;
        private String preferredContact;
        private List<String> imageNames;
        private List<String> imageDataUrls;
        private List<TicketCommentDto> comments;
        private String status;
        private LocalDateTime createdAt;
        private LocalDateTime firstResponseAt;
        private LocalDateTime resolvedAt;
        private Long timeToFirstResponseMinutes;
        private Long timeToResolutionMinutes;
    }
}
