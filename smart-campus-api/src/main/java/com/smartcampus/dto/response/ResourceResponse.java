package com.smartcampus.dto.response;

import com.smartcampus.entity.Resource;
import com.smartcampus.entity.ResourceStatus;
import com.smartcampus.entity.ResourceType;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ResourceResponse {

    private String id;
    private String name;
    private ResourceType type;
    private int capacity;
    private String location;
    private String building;
    private Integer floor;
    private List<Resource.AvailabilityWindow> availabilityWindows;
    private ResourceStatus status;
    private String description;

    // New fields
    private List<String> features;
    private String imageUrl;
    private Double hourlyRate;
    private boolean requiresApproval;
    private String department;
}