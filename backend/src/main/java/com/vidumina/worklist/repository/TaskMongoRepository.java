package com.vidumina.worklist.repository;

import com.vidumina.worklist.model.TaskDocument;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskMongoRepository extends MongoRepository<TaskDocument, String> {

    List<TaskDocument> findByDateKeyBetweenOrderByDateKeyAscOrderAsc(String startDate, String endDate);

    List<TaskDocument> findByDateKeyOrderByOrderAsc(String dateKey);

    List<TaskDocument> findAllByOrderByDateKeyAscOrderAsc();

    List<TaskDocument> findByCategoryId(String categoryId);

    long countByCategoryId(String categoryId);

    List<TaskDocument> findByStatusNotAndDateKeyBetween(String status, String startDate, String endDate);

    List<TaskDocument> findByStatusNotAndDateKeyBefore(String status, String dateKey);

    List<TaskDocument> findByIdIn(List<String> ids);
}
