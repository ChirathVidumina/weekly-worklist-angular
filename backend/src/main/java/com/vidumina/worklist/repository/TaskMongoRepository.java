package com.vidumina.worklist.repository;

import com.vidumina.worklist.model.TaskDocument;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskMongoRepository extends MongoRepository<TaskDocument, String> {

    @Query(value = "{ 'dateKey': { '$gte': ?0, '$lte': ?1 } }", sort = "{ 'dateKey': 1, 'order': 1 }")
    List<TaskDocument> findByDateKeyBetweenOrderByDateKeyAscOrderAsc(String startDate, String endDate);

    List<TaskDocument> findByDateKeyOrderByOrderAsc(String dateKey);

    List<TaskDocument> findAllByOrderByDateKeyAscOrderAsc();

    List<TaskDocument> findByCategoryId(String categoryId);

    long countByCategoryId(String categoryId);

    @Query("{ 'status': { '$ne': ?0 }, 'dateKey': { '$gte': ?1, '$lte': ?2 } }")
    List<TaskDocument> findByStatusNotAndDateKeyBetween(String status, String startDate, String endDate);

    @Query("{ 'status': { '$ne': ?0 }, 'dateKey': { '$lt': ?1 } }")
    List<TaskDocument> findByStatusNotAndDateKeyBefore(String status, String dateKey);

    List<TaskDocument> findByIdIn(List<String> ids);
}
