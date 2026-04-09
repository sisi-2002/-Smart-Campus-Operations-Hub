package com.smartcampus.service;

import com.smartcampus.dto.request.ChatRequest;
import com.smartcampus.dto.response.ChatResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatbotService {

    @Value("${groq.api.key}")
    private String groqApiKey;

    @Value("${groq.api.url}")
    private String groqApiUrl;

    @Value("${groq.model}")
    private String groqModel;

    private final WebClient.Builder webClientBuilder;

    // System prompt — tells the AI who it is and what it knows
    private static final String SYSTEM_PROMPT = """
        You are SmartBot, the official AI assistant for the Smart Campus Operations Hub
        at SLIIT university. You are helpful, friendly, and concise.
        
        You know about the following system features:
        
        BOOKING SYSTEM:
        - Users can book lecture halls, labs, meeting rooms, and equipment (projectors, cameras).
        - To make a booking: go to Bookings → New Booking → select resource, date, time, purpose.
        - Bookings start as PENDING and must be approved by an Admin.
        - Approved bookings can be cancelled by the user.
        - The system prevents double-booking (time conflicts are auto-detected).
        
        INCIDENT TICKETS:
        - Users can report faults or maintenance issues via the Tickets section.
        - Each ticket has a category, priority (LOW/MEDIUM/HIGH/CRITICAL), and description.
        - Up to 3 images can be attached as evidence.
        - Ticket flow: OPEN → IN_PROGRESS → RESOLVED → CLOSED.
        - A Technician is assigned to handle the ticket.
        
        USER ROLES:
        - USER: Can make bookings and submit tickets.
        - TECHNICIAN: Handles maintenance tickets.
        - MANAGER: Oversees operations.
        - ADMIN: Full system access, approves bookings, manages users.
        
        SECURITY:
        - Login with email/password or Google account.
        - Admin and Technician accounts require Google Authenticator 2-step verification.
        
        NOTIFICATIONS:
        - Users receive notifications for booking approvals/rejections.
        - Users are notified when ticket status changes.
        - Notifications appear in the bell icon in the top navigation.
        
        RULES:
        - Keep answers short and helpful (2-4 sentences max unless detail is needed).
        - If asked something unrelated to the campus system, politely redirect.
        - Never make up booking or ticket data — tell users to check the system.
        - Always be encouraging and professional.
        """;

    public ChatResponse chat(ChatRequest request, String userName, String userRole) {
        long start = System.currentTimeMillis();

        // Build message list for the API
        List<Map<String, String>> messages = new ArrayList<>();

        // System message with user context
        String systemWithContext = SYSTEM_PROMPT +
            "\nCurrent user: " + userName +
            "\nUser role: " + userRole +
            "\nAddress the user by their first name when appropriate.";

        messages.add(Map.of("role", "system", "content", systemWithContext));

        // Add conversation history (for multi-turn chat)
        if (request.getHistory() != null) {
            for (ChatRequest.ChatHistoryItem item : request.getHistory()) {
                messages.add(Map.of(
                    "role", item.getRole(),
                    "content", item.getContent()
                ));
            }
        }

        // Add current user message
        messages.add(Map.of("role", "user", "content", request.getMessage()));

        // Build request body for Groq API (OpenAI-compatible format)
        Map<String, Object> body = Map.of(
            "model", groqModel,
            "messages", messages,
            "max_tokens", 512,
            "temperature", 0.7
        );

        try {
            // Call Groq API
            Map response = webClientBuilder.build()
                .post()
                .uri(groqApiUrl)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + groqApiKey)
                .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .bodyValue(body)
                .retrieve()
                .bodyToMono(Map.class)
                .block();

            // Extract reply text from response
            List choices = (List) response.get("choices");
            Map firstChoice = (Map) choices.get(0);
            Map message = (Map) firstChoice.get("message");
            String reply = (String) message.get("content");

            long elapsed = System.currentTimeMillis() - start;
            log.info("Chatbot response in {}ms for user: {}", elapsed, userName);

            return ChatResponse.builder()
                    .reply(reply.trim())
                    .model(groqModel)
                    .responseTimeMs(elapsed)
                    .build();

        } catch (Exception e) {
            log.error("Chatbot error: {}", e.getMessage());
            throw new RuntimeException("Chatbot is temporarily unavailable. Please try again.");
        }
    }
}