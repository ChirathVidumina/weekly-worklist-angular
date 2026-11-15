package com.vidumina.worklist.service.impl;

import com.vidumina.worklist.dto.request.CategoryRequestDTO;
import com.vidumina.worklist.dto.response.CategoryResponseDTO;
import com.vidumina.worklist.exception.DuplicateResourceException;
import com.vidumina.worklist.exception.ResourceNotFoundException;
import com.vidumina.worklist.mapper.CategoryMapper;
import com.vidumina.worklist.model.CategoryDocument;
import com.vidumina.worklist.model.TaskDocument;
import com.vidumina.worklist.repository.CategoryMongoRepository;
import com.vidumina.worklist.repository.TaskMongoRepository;
import com.vidumina.worklist.service.CategoryService;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CategoryServiceImpl implements CategoryService {

    private static final Logger log = LoggerFactory.getLogger(CategoryServiceImpl.class);

    private final CategoryMongoRepository categoryMongoRepository;
    private final TaskMongoRepository taskMongoRepository;
    private final CategoryMapper categoryMapper;

    public CategoryServiceImpl(CategoryMongoRepository categoryMongoRepository,
                               TaskMongoRepository taskMongoRepository,
                               CategoryMapper categoryMapper) {
        this.categoryMongoRepository = categoryMongoRepository;
        this.taskMongoRepository = taskMongoRepository;
        this.categoryMapper = categoryMapper;
    }

    @PostConstruct
    @Override
    public void seedDefaultCategoriesIfEmpty() {
        try {
            if (categoryMongoRepository.count() == 0) {
                log.info("No categories found. Seeding initial default categories...");
                List<CategoryDocument> defaults = Arrays.asList(
                        new CategoryDocument(null, "Work", "#3B82F6", true),
                        new CategoryDocument(null, "Study", "#8B5CF6", true),
                        new CategoryDocument(null, "Personal", "#10B981", true),
                        new CategoryDocument(null, "Urgent", "#EF4444", true)
                );
                categoryMongoRepository.saveAll(defaults);
                log.info("Successfully seeded {} default categories.", defaults.size());
            }
        } catch (Exception e) {
            log.warn("Could not seed default categories (Database might be initializing or offline): {}", e.getMessage());
        }
    }

    @Override
    public List<CategoryResponseDTO> getAllCategories() {
        return categoryMongoRepository.findAllByOrderByCreatedAtAsc()
                .stream()
                .map(categoryMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public CategoryResponseDTO getCategoryById(String id) {
        CategoryDocument category = categoryMongoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
        return categoryMapper.toResponseDTO(category);
    }

    @Override
    public CategoryResponseDTO createCategory(CategoryRequestDTO request) {
        String trimmedName = request.getName().trim();
        if (categoryMongoRepository.existsByNameIgnoreCase(trimmedName)) {
            throw new DuplicateResourceException("Category with name '" + trimmedName + "' already exists");
        }

        CategoryDocument category = categoryMapper.toDocument(request);
        CategoryDocument saved = categoryMongoRepository.save(category);
        log.info("Created new custom category: id={}, name={}", saved.getId(), saved.getName());
        return categoryMapper.toResponseDTO(saved);
    }

    @Override
    public CategoryResponseDTO updateCategory(String id, CategoryRequestDTO request) {
        CategoryDocument category = categoryMongoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));

        String trimmedName = request.getName().trim();
        if (categoryMongoRepository.existsByNameIgnoreCaseAndIdNot(trimmedName, id)) {
            throw new DuplicateResourceException("Another category with name '" + trimmedName + "' already exists");
        }

        String oldName = category.getName();
        categoryMapper.updateDocument(category, request);
        CategoryDocument updated = categoryMongoRepository.save(category);

        // If category name changed, update associated tasks
        if (!oldName.equalsIgnoreCase(trimmedName)) {
            List<TaskDocument> tasks = taskMongoRepository.findByCategoryId(id);
            if (!tasks.isEmpty()) {
                tasks.forEach(t -> t.setCategoryName(trimmedName));
                taskMongoRepository.saveAll(tasks);
                log.info("Updated category name on {} linked tasks.", tasks.size());
            }
        }

        return categoryMapper.toResponseDTO(updated);
    }

    @Override
    public void deleteCategory(String id) {
        CategoryDocument category = categoryMongoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));

        if (Boolean.TRUE.equals(category.getIsDefault())) {
            throw new IllegalArgumentException("Default category '" + category.getName() + "' cannot be deleted");
        }

        // Reassign affected tasks to "Uncategorized"
        List<TaskDocument> affectedTasks = taskMongoRepository.findByCategoryId(id);
        if (!affectedTasks.isEmpty()) {
            affectedTasks.forEach(task -> {
                task.setCategoryId(null);
                task.setCategoryName("Uncategorized");
            });
            taskMongoRepository.saveAll(affectedTasks);
            log.info("Reassigned {} tasks from deleted category '{}' to 'Uncategorized'", affectedTasks.size(), category.getName());
        }

        categoryMongoRepository.delete(category);
        log.info("Deleted category id={}, name={}", id, category.getName());
    }
}
