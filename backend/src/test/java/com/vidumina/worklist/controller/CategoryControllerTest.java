package com.vidumina.worklist.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vidumina.worklist.dto.request.CategoryRequestDTO;
import com.vidumina.worklist.dto.response.CategoryResponseDTO;
import com.vidumina.worklist.exception.DuplicateResourceException;
import com.vidumina.worklist.exception.GlobalExceptionHandler;
import com.vidumina.worklist.exception.ResourceNotFoundException;
import com.vidumina.worklist.service.CategoryService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class CategoryControllerTest {

    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Mock
    private CategoryService categoryService;

    @InjectMocks
    private CategoryController categoryController;

    private CategoryResponseDTO sampleCategory;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(categoryController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();

        sampleCategory = new CategoryResponseDTO("cat-work", "Work", "#3B82F6", true);
    }

    @Test
    @DisplayName("GET /api/v1/categories returns 200 and list of categories")
    void getAllCategories_shouldReturnList() throws Exception {
        when(categoryService.getAllCategories()).thenReturn(List.of(sampleCategory));

        mockMvc.perform(get("/api/v1/categories"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].name", is("Work")))
                .andExpect(jsonPath("$[0].color", is("#3B82F6")));
    }

    @Test
    @DisplayName("POST /api/v1/categories returns 201 Created for valid category")
    void createCategory_valid_shouldReturn201() throws Exception {
        CategoryRequestDTO request = new CategoryRequestDTO("Health", "#10B981");
        CategoryResponseDTO created = new CategoryResponseDTO("cat-health", "Health", "#10B981", false);

        when(categoryService.createCategory(any(CategoryRequestDTO.class))).thenReturn(created);

        mockMvc.perform(post("/api/v1/categories")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", is("cat-health")))
                .andExpect(jsonPath("$.name", is("Health")));
    }

    @Test
    @DisplayName("POST /api/v1/categories returns 409 Conflict when name already exists")
    void createCategory_duplicate_shouldReturn409() throws Exception {
        CategoryRequestDTO request = new CategoryRequestDTO("Work", "#3B82F6");

        when(categoryService.createCategory(any(CategoryRequestDTO.class)))
                .thenThrow(new DuplicateResourceException("Category with name 'Work' already exists"));

        mockMvc.perform(post("/api/v1/categories")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error", is("DUPLICATE_RESOURCE")));
    }

    @Test
    @DisplayName("DELETE /api/v1/categories/{id} returns 204 No Content")
    void deleteCategory_shouldReturn204() throws Exception {
        doNothing().when(categoryService).deleteCategory("cat-custom");

        mockMvc.perform(delete("/api/v1/categories/cat-custom"))
                .andExpect(status().isNoContent());

        verify(categoryService).deleteCategory("cat-custom");
    }

    @Test
    @DisplayName("DELETE /api/v1/categories/{id} returns 400 when attempting to delete default category")
    void deleteCategory_defaultCategory_shouldReturn400() throws Exception {
        doThrow(new IllegalArgumentException("Default category cannot be deleted"))
                .when(categoryService).deleteCategory("cat-default");

        mockMvc.perform(delete("/api/v1/categories/cat-default"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error", is("VALIDATION_FAILED")));
    }
}
