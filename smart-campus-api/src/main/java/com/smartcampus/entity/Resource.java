package com.smartcampus.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "resources")
public class Resource {
    
    @Id
    private String id;
    
    private String name;
    private String type; // LECTURE_HALL, LAB, MEETING_ROOM, EQUIPMENT
    private Integer capacity;
    private String location;
    private String building;
    private Integer floor;
    
    private ResourceStatus status; // ACTIVE, OUT_OF_SERVICE, MAINTENANCE
    
    private List<String> availableDays; // MONDAY, TUESDAY, etc.
    private String availableFrom; // "08:00"
    private String availableTo; // "20:00"
    
    private List<String> features; // Projector, AC, Whiteboard, etc.
    private String imageUrl;
    
    private Double hourlyRate; // For paid resources
    private boolean requiresApproval;
    
    private String department; // CS, Engineering, Business, etc.
}