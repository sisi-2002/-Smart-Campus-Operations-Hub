package com.smartcampus.repository;

import com.smartcampus.entity.ResourceBooking;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ResourceBookingRepository extends MongoRepository<ResourceBooking, String> {
    List<ResourceBooking> findByUserId(String userId);
}
