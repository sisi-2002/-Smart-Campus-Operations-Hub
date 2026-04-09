package com.smartcampus.dto.response;

import com.smartcampus.entity.TicketComment;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketCommentDto {

    private String id;
    private String parentCommentId;
    private String authorUserId;
    private String authorName;
    private String authorRole;
    private String message;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static TicketCommentDto from(TicketComment comment) {
        if (comment == null) {
            return null;
        }

        return TicketCommentDto.builder()
                .id(comment.getId())
                .parentCommentId(comment.getParentCommentId())
                .authorUserId(comment.getAuthorUserId())
                .authorName(comment.getAuthorName())
                .authorRole(comment.getAuthorRole())
                .message(comment.getMessage())
                .createdAt(comment.getCreatedAt())
                .updatedAt(comment.getUpdatedAt())
                .build();
    }

    public static List<TicketCommentDto> fromList(List<TicketComment> comments) {
        if (comments == null) {
            return List.of();
        }

        return comments.stream()
                .map(TicketCommentDto::from)
                .filter(item -> item != null)
                .toList();
    }
}
