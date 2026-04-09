package com.smartcampus.repository;

import com.smartcampus.entity.Resource;
import com.smartcampus.entity.ResourceStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResourceRepository extends MongoRepository<Resource, String> {
    
    List<Resource> findByType(String type);
    
    List<Resource> findByStatus(ResourceStatus status);
    
    List<Resource> findByTypeAndStatus(String type, ResourceStatus status);
    
    List<Resource> findByCapacityGreaterThanEqual(Integer capacity);
    
    @Query("{ 'type': ?0, 'capacity': { $gte: ?1 }, 'status': 'ACTIVE' }")
    List<Resource> findAvailableResourcesByTypeAndCapacity(String type, Integer capacity);
    
    List<Resource> findByBuildingAndFloor(String building, Integer floor);
    
    @Query("{ 'features': { $in: [?0] }, 'status': 'ACTIVE' }")
    List<Resource> findByFeature(String feature);
    
    @Query("{ 'name': { $regex: ?0, $options: 'i' }, 'status': 'ACTIVE' }")
    List<Resource> searchByName(String name);
}