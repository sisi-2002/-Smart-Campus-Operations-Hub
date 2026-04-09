package com.smartcampus.repository;

import com.smartcampus.entity.IncidentTicket;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface IncidentTicketRepository extends MongoRepository<IncidentTicket, String> {
    List<IncidentTicket> findByUserId(String userId);
    List<IncidentTicket> findByAssignedTechnicianId(String assignedTechnicianId);
    Optional<IncidentTicket> findByTicketId(String ticketId);
}
