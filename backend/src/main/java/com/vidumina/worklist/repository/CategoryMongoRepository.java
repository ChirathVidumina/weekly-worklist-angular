package com.vidumina.worklist.repository;

import com.vidumina.worklist.model.CategoryDocument;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryMongoRepository extends MongoRepository<CategoryDocument, String> {

    Optional<CategoryDocument> findByNameIgnoreCase(String name);

    boolean existsByNameIgnoreCase(String name);

    boolean existsByNameIgnoreCaseAndIdNot(String name, String id);

    List<CategoryDocument> findAllByOrderByCreatedAtAsc();
}
