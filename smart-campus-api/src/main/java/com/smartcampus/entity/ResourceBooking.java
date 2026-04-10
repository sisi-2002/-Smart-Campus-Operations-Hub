package com.smartcampus.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Document(collection = "resource_bookings")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResourceBooking {

    @Id
    private String id;

    private String userId;

    private String resource;

    private LocalDate date;

    private String time;

    private String status;

    @CreatedDate
    private LocalDateTime createdAt;
}
