package com.vidumina.worklist.service;

import com.vidumina.worklist.dto.request.CategoryRequestDTO;
import com.vidumina.worklist.dto.response.CategoryResponseDTO;

import java.util.List;

public interface CategoryService {

    List<CategoryResponseDTO> getAllCategories();

    CategoryResponseDTO getCategoryById(String id);

    CategoryResponseDTO createCategory(CategoryRequestDTO request);

    CategoryResponseDTO updateCategory(String id, CategoryRequestDTO request);

    void deleteCategory(String id);

    void seedDefaultCategoriesIfEmpty();
}
