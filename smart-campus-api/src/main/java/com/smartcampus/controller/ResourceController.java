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

    // ✅ මේක තමයි ඔයාගේ error එක fix කරන version එක
    @GetMapping
    public ResponseEntity<List<Resource>> getAllResources(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String minCapacity,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String status) {

        List<Resource> resources = resourceService.getAllResources(type, status);
        return ResponseEntity.ok(resources);
    }

    @GetMapping("/available")
    public ResponseEntity<List<Resource>> getAvailableResources() {
        return ResponseEntity.ok(resourceService.getAvailableResources());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Resource> getResourceById(@PathVariable String id) {
        return ResponseEntity.ok(resourceService.getResourceById(id));
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<List<Resource>> getResourcesByType(@PathVariable String type) {
        return ResponseEntity.ok(resourceService.getResourcesByType(type));
    }

    @GetMapping("/search")
    public ResponseEntity<List<Resource>> searchResources(@RequestParam String query) {
        return ResponseEntity.ok(resourceService.searchResources(query));
    }

<<<<<<< Updated upstream
    // ===================== MANAGER + ADMIN =====================
=======
>>>>>>> Stashed changes
    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<Resource> createResource(@Valid @RequestBody Resource resource) {
        Resource created = resourceService.createResource(resource);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<Resource> updateResource(@PathVariable String id, @Valid @RequestBody Resource resource) {
        Resource updated = resourceService.updateResource(id, resource);
        return ResponseEntity.ok(updated);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<Resource> updateResourceStatus(@PathVariable String id, @RequestParam ResourceStatus status) {
        Resource updated = resourceService.updateResourceStatus(id, status);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteResource(@PathVariable String id) {
        resourceService.deleteResource(id);
        return ResponseEntity.noContent().build();
    }
}