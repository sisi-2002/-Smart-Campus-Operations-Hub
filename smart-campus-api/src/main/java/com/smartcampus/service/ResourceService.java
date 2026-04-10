package com.smartcampus.service;

import com.smartcampus.entity.Resource;
import com.smartcampus.entity.ResourceStatus;
import com.smartcampus.entity.ResourceType;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.repository.ResourceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ResourceService {

    private final ResourceRepository resourceRepository;

    /**
     * Get all resources, optionally filtered by type and/or status
     */
    public List<Resource> getAllResources(String type, String status) {
        log.info("Fetching all resources with filters - type: {}, status: {}", type, status);
        
        List<Resource> resources;
        
        if (type != null && !type.isEmpty() && status != null && !status.isEmpty()) {
            ResourceType resourceType = ResourceType.valueOf(type.toUpperCase());
            ResourceStatus resourceStatus = ResourceStatus.valueOf(status.toUpperCase());
            resources = resourceRepository.findByTypeAndStatus(resourceType, resourceStatus);
        } else if (type != null && !type.isEmpty()) {
            ResourceType resourceType = ResourceType.valueOf(type.toUpperCase());
            resources = resourceRepository.findByType(resourceType);
        } else if (status != null && !status.isEmpty()) {
            ResourceStatus resourceStatus = ResourceStatus.valueOf(status.toUpperCase());
            resources = resourceRepository.findByStatus(resourceStatus);
        } else {
            resources = resourceRepository.findAll();
        }
        
        return resources;
    }

    /**
     * Get all available (ACTIVE) resources
     */
    public List<Resource> getAvailableResources() {
        log.info("Fetching available resources");
        return resourceRepository.findByStatus(ResourceStatus.ACTIVE);
    }

    /**
     * Get a resource by its ID
     */
    public Resource getResourceById(String id) {
        log.info("Fetching resource with ID: {}", id);
        return resourceRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("Resource not found with ID: {}", id);
                    return new ResourceNotFoundException("Resource not found with ID: " + id);
                });
    }

    /**
     * Get resources by type
     */
    public List<Resource> getResourcesByType(String type) {
        log.info("Fetching resources of type: {}", type);
        ResourceType resourceType = ResourceType.valueOf(type.toUpperCase());
        return resourceRepository.findByType(resourceType);
    }

    /**
     * Search resources by name, location, or building
     */
    public List<Resource> searchResources(String query) {
        log.info("Searching resources with query: {}", query);
        return resourceRepository.searchResources(query);
    }

    /**
     * Create a new resource (ADMIN ONLY)
     */
    @Transactional
    public Resource createResource(Resource resource) {
        log.info("Creating new resource: {}", resource.getName());
        
        if (resource.getStatus() == null) {
            resource.setStatus(ResourceStatus.ACTIVE);
        }
        
        Resource created = resourceRepository.save(resource);
        log.info("Resource created successfully with ID: {}", created.getId());
        return created;
    }

    /**
     * Update an existing resource (ADMIN or MANAGER)
     */
    @Transactional
    public Resource updateResource(String id, Resource resourceDetails) {
        log.info("Updating resource with ID: {}", id);
        
        Resource resource = getResourceById(id);
        
        // Update fields if provided
        if (resourceDetails.getName() != null) {
            resource.setName(resourceDetails.getName());
        }
        if (resourceDetails.getType() != null) {
            resource.setType(resourceDetails.getType());
        }
        if (resourceDetails.getCapacity() > 0) {
            resource.setCapacity(resourceDetails.getCapacity());
        }
        if (resourceDetails.getLocation() != null) {
            resource.setLocation(resourceDetails.getLocation());
        }
        if (resourceDetails.getBuilding() != null) {
            resource.setBuilding(resourceDetails.getBuilding());
        }
        if (resourceDetails.getFloor() != null) {
            resource.setFloor(resourceDetails.getFloor());
        }
        if (resourceDetails.getDescription() != null) {
            resource.setDescription(resourceDetails.getDescription());
        }
        if (resourceDetails.getFeatures() != null) {
            resource.setFeatures(resourceDetails.getFeatures());
        }
        if (resourceDetails.getImageUrl() != null) {
            resource.setImageUrl(resourceDetails.getImageUrl());
        }
        if (resourceDetails.getHourlyRate() != null) {
            resource.setHourlyRate(resourceDetails.getHourlyRate());
        }
        if (resourceDetails.getDepartment() != null) {
            resource.setDepartment(resourceDetails.getDepartment());
        }
        if (resourceDetails.getAvailabilityWindows() != null) {
            resource.setAvailabilityWindows(resourceDetails.getAvailabilityWindows());
        }
        resource.setRequiresApproval(resourceDetails.isRequiresApproval());
        
        Resource updated = resourceRepository.save(resource);
        log.info("Resource updated successfully with ID: {}", id);
        return updated;
    }

    /**
     * Update resource status (ADMIN or MANAGER)
     */
    @Transactional
    public Resource updateResourceStatus(String id, ResourceStatus status) {
        log.info("Updating resource status with ID: {}, new status: {}", id, status);
        
        Resource resource = getResourceById(id);
        resource.setStatus(status);
        
        Resource updated = resourceRepository.save(resource);
        log.info("Resource status updated successfully with ID: {}", id);
        return updated;
    }

    /**
     * Delete a resource (ADMIN ONLY)
     */
    @Transactional
    public void deleteResource(String id) {
        log.info("Deleting resource with ID: {}", id);
        
        if (!resourceRepository.existsById(id)) {
            log.error("Resource not found with ID: {}", id);
            throw new ResourceNotFoundException("Resource not found with ID: " + id);
        }
        
        resourceRepository.deleteById(id);
        log.info("Resource deleted successfully with ID: {}", id);
    }
}
