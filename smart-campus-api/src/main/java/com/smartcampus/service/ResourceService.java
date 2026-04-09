package com.smartcampus.service;

import com.smartcampus.entity.Resource;
import com.smartcampus.entity.ResourceStatus;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.repository.ResourceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ResourceService {

    private final ResourceRepository resourceRepository;

    // Get all resources with optional filters
    public List<Resource> getAllResources(String type, String status) {
        if (type != null && status != null) {
            return resourceRepository.findByTypeAndStatus(type, ResourceStatus.valueOf(status));
        } else if (type != null) {
            return resourceRepository.findByType(type);
        } else if (status != null) {
            return resourceRepository.findByStatus(ResourceStatus.valueOf(status));
        }
        return resourceRepository.findAll();
    }

    public List<Resource> getAvailableResources() {
        return resourceRepository.findByStatus(ResourceStatus.ACTIVE);
    }

    public Resource getResourceById(String id) {
        return resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + id));
    }

    public List<Resource> getResourcesByType(String type) {
        return resourceRepository.findByType(type.toUpperCase());
    }

    public List<Resource> searchResources(String query) {
        return resourceRepository.findAll().stream()
                .filter(r -> r.getName().toLowerCase().contains(query.toLowerCase()) ||
                            r.getType().name().toLowerCase().contains(query.toLowerCase()) ||
                            r.getLocation().toLowerCase().contains(query.toLowerCase()) ||
                            (r.getBuilding() != null && r.getBuilding().toLowerCase().contains(query.toLowerCase())))
                .collect(Collectors.toList());
    }

    public Resource createResource(Resource resource) {
        if (resource.getStatus() == null) {
            resource.setStatus(ResourceStatus.ACTIVE);
        }
        return resourceRepository.save(resource);
    }

    // Updated to support all fields from your latest Resource.java
    public Resource updateResource(String id, Resource resourceDetails) {
        Resource resource = getResourceById(id);

        resource.setName(resourceDetails.getName());
        resource.setType(resourceDetails.getType());
        resource.setCapacity(resourceDetails.getCapacity());
        resource.setLocation(resourceDetails.getLocation());
        resource.setBuilding(resourceDetails.getBuilding());
        resource.setFloor(resourceDetails.getFloor());
        resource.setAvailabilityWindows(resourceDetails.getAvailabilityWindows());
        resource.setStatus(resourceDetails.getStatus());
        resource.setDescription(resourceDetails.getDescription());

        // New fields added
        resource.setFeatures(resourceDetails.getFeatures());
        resource.setImageUrl(resourceDetails.getImageUrl());
        resource.setHourlyRate(resourceDetails.getHourlyRate());
        resource.setRequiresApproval(resourceDetails.isRequiresApproval());
        resource.setDepartment(resourceDetails.getDepartment());

        return resourceRepository.save(resource);
    }

    public void deleteResource(String id) {
        Resource resource = getResourceById(id);
        resourceRepository.delete(resource);
    }

    public Resource updateResourceStatus(String id, ResourceStatus status) {
        Resource resource = getResourceById(id);
        resource.setStatus(status);
        return resourceRepository.save(resource);
    }
}