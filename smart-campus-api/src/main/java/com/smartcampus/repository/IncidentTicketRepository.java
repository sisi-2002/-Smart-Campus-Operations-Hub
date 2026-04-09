package com.smartcampus.repository;

import com.smartcampus.entity.IncidentTicket;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface IncidentTicketRepository extends MongoRepository<IncidentTicket, String> {
    List<IncidentTicket> findByUserId(String userId);
    List<IncidentTicket> findByAssignedTechnicianId(String assignedTechnicianId);
}
