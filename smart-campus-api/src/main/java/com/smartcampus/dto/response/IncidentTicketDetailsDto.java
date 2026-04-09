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
public class IncidentTicketDetailsDto {
    private String id;
    private String ticketId;
    private String resourceLocation;
    private String category;
    private String priority;
    private String description;
    private String preferredContact;
    private List<String> imageNames;
    private List<String> imageDataUrls;
    private String status;
}
