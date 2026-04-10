package com.smartcampus.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.List;

@Data
public class CreateIncidentTicketRequest {

    @NotBlank(message = "Resource/location is required")
    private String resourceLocation;

    @NotBlank(message = "Category is required")
    private String category;

    @NotBlank(message = "Priority is required")
    private String priority;

    @NotBlank(message = "Description is required")
    private String description;

    @NotBlank(message = "Preferred contact is required")
    private String preferredContact;

    private List<String> imageNames;

    private List<String> imageDataUrls;
}