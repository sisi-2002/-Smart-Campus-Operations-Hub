package com.smartcampus.controller;

import com.smartcampus.entity.Resource;
import com.smartcampus.entity.ResourceStatus;
import com.smartcampus.service.ResourceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/resources")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class ResourceController {

    private final ResourceService resourceService;

    // Get all resources (public - all users)
    @GetMapping
    public ResponseEntity<List<Resource>> getAllResources(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String status) {
        List<Resource> resources = resourceService.getAllResources(type, status);
        return ResponseEntity.ok(resources);
    }

    // Get available resources (active only)
    @GetMapping("/available")
    public ResponseEntity<List<Resource>> getAvailableResources() {
        List<Resource> resources = resourceService.getAvailableResources();
        return ResponseEntity.ok(resources);
    }

    // Get resource by ID
    @GetMapping("/{id}")
    public ResponseEntity<Resource> getResourceById(@PathVariable String id) {
        Resource resource = resourceService.getResourceById(id);
        return ResponseEntity.ok(resource);
    }

    // Get resources by type
    @GetMapping("/type/{type}")
    public ResponseEntity<List<Resource>> getResourcesByType(@PathVariable String type) {
        List<Resource> resources = resourceService.getResourcesByType(type);
        return ResponseEntity.ok(resources);
    }

    // Search resources
    @GetMapping("/search")
    public ResponseEntity<List<Resource>> searchResources(@RequestParam String query) {
        List<Resource> resources = resourceService.searchResources(query);
        return ResponseEntity.ok(resources);
    }

    // ===================== ADMIN ONLY =====================
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Resource> createResource(@Valid @RequestBody Resource resource) {
        Resource created = resourceService.createResource(resource);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // ===================== MANAGER + ADMIN =====================
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<Resource> updateResource(
            @PathVariable String id,
            @Valid @RequestBody Resource resource) {
        
        Resource updated = resourceService.updateResource(id, resource);
        return ResponseEntity.ok(updated);
    }

    // ===================== MANAGER + ADMIN =====================
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<Resource> updateResourceStatus(
            @PathVariable String id,
            @RequestParam ResourceStatus status) {
        
        Resource updated = resourceService.updateResourceStatus(id, status);
        return ResponseEntity.ok(updated);
    }

    // ===================== ADMIN ONLY =====================
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteResource(@PathVariable String id) {
        resourceService.deleteResource(id);
        return ResponseEntity.noContent().build();
    }
}