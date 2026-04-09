package com.smartcampus.controller;

import com.smartcampus.dto.request.ChatRequest;
import com.smartcampus.dto.response.ChatResponse;
import com.smartcampus.entity.User;
import com.smartcampus.repository.UserRepository;
import com.smartcampus.service.ChatbotService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chatbot")
@RequiredArgsConstructor
public class ChatbotController {

    private final ChatbotService chatbotService;
    private final UserRepository userRepository;

    // POST /api/chatbot/message
    @PostMapping("/message")
    public ResponseEntity<ChatResponse> sendMessage(
            @Valid @RequestBody ChatRequest request,
            Authentication authentication) {

        // Get current user's name and role for personalization
        String userName = "User";
        String userRole = "USER";

        if (authentication != null) {
            Object principal = authentication.getPrincipal();
            String email = null;

            if (principal instanceof UserDetails ud) {
                email = ud.getUsername();
            }

            if (email != null) {
                User user = userRepository.findByEmail(email).orElse(null);
                if (user != null) {
                    // Use first name only
                    userName = user.getName().split(" ")[0];
                    userRole = user.getRole().name();
                }
            }
        }

        return ResponseEntity.ok(
            chatbotService.chat(request, userName, userRole));
    }
}