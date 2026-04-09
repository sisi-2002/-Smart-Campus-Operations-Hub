package com.smartcampus.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TechnicianDashboardResponse {

    private TechnicianSummary technician;
    private TicketStats stats;
    private List<AdminIncidentTicketDto> assignedTickets;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TechnicianSummary {
        private String id;
        private String name;
        private String email;
        private String role;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TicketStats {
        private long assigned;
        private long open;
        private long inProgress;
        private long resolvedClosed;
    }
}
