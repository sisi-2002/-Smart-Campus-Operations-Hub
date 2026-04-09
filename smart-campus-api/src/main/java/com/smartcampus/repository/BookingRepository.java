package com.smartcampus.repository;

import com.smartcampus.entity.Booking;
import com.smartcampus.entity.BookingStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BookingRepository extends MongoRepository<Booking, String> {
    
    List<Booking> findByUserId(String userId);
    
    List<Booking> findByResourceId(String resourceId);
    
    List<Booking> findByStatus(BookingStatus status);
    
    @Query("{ 'resourceId': ?0, 'status': { $in: ['APPROVED', 'PENDING'] }, " +
           "$or: [ " +
           "  { 'startTime': { $lt: ?2, $gte: ?1 } }, " +
           "  { 'endTime': { $gt: ?1, $lte: ?2 } }, " +
           "  { 'startTime': { $lte: ?1 }, 'endTime': { $gte: ?2 } } " +
           "] }")
    List<Booking> findConflictingBookings(String resourceId, LocalDateTime startTime, LocalDateTime endTime);
    
    List<Booking> findByStatusAndStartTimeBefore(BookingStatus status, LocalDateTime time);
    
    @Query("{ 'status': 'APPROVED', 'startTime': { $gte: ?0, $lte: ?1 } }")
    List<Booking> findApprovedBookingsInRange(LocalDateTime start, LocalDateTime end);
    
    long countByStatus(BookingStatus status);
    
    long countByUserIdAndStatus(String userId, BookingStatus status);
}