package com.smartcampus.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Document(collection = "resources")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class Resource {

    @Id
    private String id;

    private String name;
    private ResourceType type;
    private int capacity;
    private String location;           // e.g. "Main Building"
    private String building;           // e.g. "Block A"
    private Integer floor;             // e.g. 2
    private List<AvailabilityWindow> availabilityWindows;
    private ResourceStatus status = ResourceStatus.ACTIVE;
    private String description;

    // Extra useful fields (from your screenshot)
    private List<String> features;           // e.g. ["Projector", "Whiteboard", "AC"]
    private String imageUrl;
    private Double hourlyRate;               // for paid equipment
    private boolean requiresApproval;
    private String department;               // e.g. "CS", "Engineering", "Business"

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AvailabilityWindow {
        private String dayOfWeek;   // MONDAY, TUESDAY, ...
        private String startTime;   // "08:00"
        private String endTime;     // "17:00"
    }
}