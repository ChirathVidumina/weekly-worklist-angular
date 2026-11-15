package com.vidumina.worklist.mapper;

import com.vidumina.worklist.dto.request.CategoryRequestDTO;
import com.vidumina.worklist.dto.response.CategoryResponseDTO;
import com.vidumina.worklist.model.CategoryDocument;
import org.springframework.stereotype.Component;

@Component
public class CategoryMapper {

    public CategoryResponseDTO toResponseDTO(CategoryDocument doc) {
        if (doc == null) {
            return null;
        }

        CategoryResponseDTO dto = new CategoryResponseDTO();
        dto.setId(doc.getId());
        dto.setName(doc.getName());
        dto.setColor(doc.getColor());
        dto.setIsDefault(doc.getIsDefault() != null ? doc.getIsDefault() : false);
        dto.setCreatedAt(doc.getCreatedAt());
        dto.setUpdatedAt(doc.getUpdatedAt());

        return dto;
    }

    public CategoryDocument toDocument(CategoryRequestDTO dto) {
        if (dto == null) {
            return null;
        }

        CategoryDocument doc = new CategoryDocument();
        doc.setName(dto.getName().trim());
        doc.setColor(dto.getColor().trim());
        doc.setIsDefault(false);

        return doc;
    }

    public void updateDocument(CategoryDocument doc, CategoryRequestDTO dto) {
        if (doc == null || dto == null) {
            return;
        }

        if (dto.getName() != null && !dto.getName().trim().isEmpty()) {
            doc.setName(dto.getName().trim());
        }
        if (dto.getColor() != null && !dto.getColor().trim().isEmpty()) {
            doc.setColor(dto.getColor().trim());
        }
    }
}
