package com.smartcampus.entity;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum ResourceStatus {
    ACTIVE, 
    OUT_OF_SERVICE, 
    MAINTENANCE;

    @JsonCreator
    public static ResourceStatus fromValue(String raw) {
        if (raw == null) {
            return null;
        }
        String normalized = raw.trim().toUpperCase().replaceAll("[\\s-]+", "_");
        return ResourceStatus.valueOf(normalized);
    }
}