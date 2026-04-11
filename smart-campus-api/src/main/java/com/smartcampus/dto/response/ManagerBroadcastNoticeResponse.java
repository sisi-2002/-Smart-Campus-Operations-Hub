package com.smartcampus.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ManagerBroadcastNoticeResponse {
    private String title;
    private String resourceQuery;
    private LocalDateTime windowStart;
    private LocalDateTime windowEnd;
    private int matchedBookings;
    private int notifiedUsers;
}
