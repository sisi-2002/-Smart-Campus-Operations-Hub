package com.smartcampus.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ChatRequest {

    @NotBlank(message = "Message cannot be empty")
    @Size(max = 1000, message = "Message too long")
    private String message;

    // Optional — frontend sends conversation history
    // so the bot remembers context
    private java.util.List<ChatHistoryItem> history;

    @Data
    public static class ChatHistoryItem {
        private String role;    // "user" or "assistant"
        private String content;
    }
}