package com.smartcampus.dto.request;

import com.smartcampus.entity.Resource;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ResourceRequest {

    private String name;
    private Resource.ResourceType type;
    private int capacity;
    private String location;
    private String building;
    private Integer floor;
    private List<Resource.AvailabilityWindow> availabilityWindows;
    private String description;
    
    // New fields added from your updated Resource entity
    private List<String> features;
    private String imageUrl;
    private Double hourlyRate;
    private boolean requiresApproval;
    private String department;
}