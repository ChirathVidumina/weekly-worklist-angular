package com.vidumina.worklist.service;

import com.vidumina.worklist.dto.request.CategoryRequestDTO;
import com.vidumina.worklist.dto.response.CategoryResponseDTO;
import com.vidumina.worklist.exception.DuplicateResourceException;
import com.vidumina.worklist.mapper.CategoryMapper;
import com.vidumina.worklist.model.CategoryDocument;
import com.vidumina.worklist.model.Priority;
import com.vidumina.worklist.model.TaskDocument;
import com.vidumina.worklist.repository.CategoryMongoRepository;
import com.vidumina.worklist.repository.TaskMongoRepository;
import com.vidumina.worklist.service.impl.CategoryServiceImpl;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CategoryServiceTest {

    @Mock
    private CategoryMongoRepository categoryMongoRepository;

    @Mock
    private TaskMongoRepository taskMongoRepository;

    @Spy
    private CategoryMapper categoryMapper = new CategoryMapper();

    @InjectMocks
    private CategoryServiceImpl categoryService;

    @Test
    @DisplayName("getAllCategories returns mapped category response DTOs")
    void getAllCategories_shouldReturnList() {
        CategoryDocument cat1 = new CategoryDocument("cat-1", "Work", "#3B82F6", true);
        CategoryDocument cat2 = new CategoryDocument("cat-2", "Sports", "#10B981", false);

        when(categoryMongoRepository.findAllByOrderByCreatedAtAsc()).thenReturn(List.of(cat1, cat2));

        List<CategoryResponseDTO> results = categoryService.getAllCategories();

        assertThat(results).hasSize(2);
        assertThat(results.get(0).getName()).isEqualTo("Work");
        assertThat(results.get(1).getName()).isEqualTo("Sports");
    }

    @Test
    @DisplayName("createCategory saves and returns new category when name is unique")
    void createCategory_shouldCheckDuplicateAndSave() {
        CategoryRequestDTO request = new CategoryRequestDTO("Gym", "#EC4899");

        when(categoryMongoRepository.existsByNameIgnoreCase("Gym")).thenReturn(false);
        when(categoryMongoRepository.save(any(CategoryDocument.class))).thenAnswer(inv -> {
            CategoryDocument doc = inv.getArgument(0);
            doc.setId("cat-gym");
            return doc;
        });

        CategoryResponseDTO created = categoryService.createCategory(request);

        assertThat(created).isNotNull();
        assertThat(created.getId()).isEqualTo("cat-gym");
        assertThat(created.getName()).isEqualTo("Gym");
        assertThat(created.getColor()).isEqualTo("#EC4899");
        assertThat(created.getIsDefault()).isFalse();
    }

    @Test
    @DisplayName("createCategory throws DuplicateResourceException if name already exists")
    void createCategory_duplicateName_shouldThrowException() {
        CategoryRequestDTO request = new CategoryRequestDTO("Work", "#3B82F6");

        when(categoryMongoRepository.existsByNameIgnoreCase("Work")).thenReturn(true);

        assertThatThrownBy(() -> categoryService.createCategory(request))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("Work");

        verify(categoryMongoRepository, never()).save(any());
    }

    @Test
    @DisplayName("deleteCategory throws IllegalArgumentException for default category")
    void deleteCategory_default_shouldThrowException() {
        CategoryDocument defaultCat = new CategoryDocument("cat-default", "Work", "#3B82F6", true);
        when(categoryMongoRepository.findById("cat-default")).thenReturn(Optional.of(defaultCat));

        assertThatThrownBy(() -> categoryService.deleteCategory("cat-default"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Default category");

        verify(categoryMongoRepository, never()).delete(any());
    }

    @Test
    @DisplayName("deleteCategory reassigns linked tasks to Uncategorized and deletes category")
    void deleteCategory_custom_shouldReassignTasksAndRemove() {
        CategoryDocument customCat = new CategoryDocument("cat-gym", "Gym", "#EC4899", false);
        TaskDocument task = new TaskDocument("task-1", "Bench press", null, "2026-11-16", Priority.LOW,
                "cat-gym", "Gym", "TODO", 30, 0, new ArrayList<>());

        when(categoryMongoRepository.findById("cat-gym")).thenReturn(Optional.of(customCat));
        when(taskMongoRepository.findByCategoryId("cat-gym")).thenReturn(List.of(task));

        categoryService.deleteCategory("cat-gym");

        assertThat(task.getCategoryId()).isNull();
        assertThat(task.getCategoryName()).isEqualTo("Uncategorized");
        verify(taskMongoRepository).saveAll(List.of(task));
        verify(categoryMongoRepository).delete(customCat);
    }
}
