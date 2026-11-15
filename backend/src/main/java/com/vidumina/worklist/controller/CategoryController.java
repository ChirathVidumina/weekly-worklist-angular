package com.vidumina.worklist.controller;

import com.vidumina.worklist.constant.ApiConstants;
import com.vidumina.worklist.dto.request.CategoryRequestDTO;
import com.vidumina.worklist.dto.response.CategoryResponseDTO;
import com.vidumina.worklist.service.CategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(ApiConstants.CATEGORIES_PATH)
@Tag(name = "Categories", description = "Operations for dynamic custom categories and palettes")
public class CategoryController {

    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @GetMapping
    @Operation(summary = "List categories", description = "Retrieve all custom and default categories")
    public ResponseEntity<List<CategoryResponseDTO>> getAllCategories() {
        List<CategoryResponseDTO> categories = categoryService.getAllCategories();
        return ResponseEntity.ok(categories);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get category by ID", description = "Retrieve category details by identifier")
    public ResponseEntity<CategoryResponseDTO> getCategoryById(@PathVariable String id) {
        CategoryResponseDTO category = categoryService.getCategoryById(id);
        return ResponseEntity.ok(category);
    }

    @PostMapping
    @Operation(summary = "Create category", description = "Create a custom category with name and hex color")
    public ResponseEntity<CategoryResponseDTO> createCategory(@Valid @RequestBody CategoryRequestDTO request) {
        CategoryResponseDTO created = categoryService.createCategory(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update category", description = "Modify an existing category's name or color")
    public ResponseEntity<CategoryResponseDTO> updateCategory(
            @PathVariable String id,
            @Valid @RequestBody CategoryRequestDTO request) {
        CategoryResponseDTO updated = categoryService.updateCategory(id, request);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete category", description = "Remove a custom category and reassign linked tasks to Uncategorized")
    public ResponseEntity<Void> deleteCategory(@PathVariable String id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }
}
