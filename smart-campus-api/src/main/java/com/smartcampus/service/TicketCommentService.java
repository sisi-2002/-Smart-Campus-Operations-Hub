package com.smartcampus.service;

import com.smartcampus.dto.request.AddTicketCommentRequest;
import com.smartcampus.dto.request.UpdateTicketCommentRequest;
import com.smartcampus.dto.response.TicketCommentDto;
import com.smartcampus.entity.IncidentTicket;
import com.smartcampus.entity.Role;
import com.smartcampus.entity.TicketComment;
import com.smartcampus.entity.User;
import com.smartcampus.repository.IncidentTicketRepository;
import com.smartcampus.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TicketCommentService {

    private final UserRepository userRepository;
    private final IncidentTicketRepository incidentTicketRepository;

    public List<TicketCommentDto> listComments(String email, String ticketId) {
        User actor = findUserByEmail(email);
        IncidentTicket ticket = findTicket(ticketId);
        ensureCommentAccess(actor, ticket);

        return toSortedCommentDtos(ticket.getComments());
    }

    public TicketCommentDto addComment(String email, String ticketId, AddTicketCommentRequest request) {
        User actor = findUserByEmail(email);
        IncidentTicket ticket = findTicket(ticketId);
        ensureCommentAccess(actor, ticket);

        boolean isStaffActor = actor.getRole() == Role.ADMIN
                || actor.getRole() == Role.MANAGER
                || actor.getRole() == Role.TECHNICIAN;
        if (isStaffActor && ticket.getFirstResponseAt() == null) {
            ticket.setFirstResponseAt(LocalDateTime.now());
            incidentTicketRepository.save(ticket);
        }

        String message = trimToNull(request != null ? request.getMessage() : null);
        if (message == null) {
            throw new RuntimeException("Comment message is required");
        }

        String parentCommentId = trimToNull(request != null ? request.getParentCommentId() : null);
        List<TicketComment> comments = new ArrayList<>(ticket.getComments() == null ? List.of() : ticket.getComments());

        if (parentCommentId != null) {
            TicketComment parent = comments.stream()
                    .filter(comment -> parentCommentId.equals(comment.getId()))
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("Parent comment not found"));

            if (actor.getRole() == Role.USER) {
                throw new RuntimeException("Users can only add top-level comments. Replies are for staff");
            }

            // Prevent deep nesting to keep UI simple: only one reply level.
            if (trimToNull(parent.getParentCommentId()) != null) {
                throw new RuntimeException("You can only reply to top-level comments");
            }
        }

        LocalDateTime now = LocalDateTime.now();
        TicketComment created = TicketComment.builder()
                .id("COM-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .parentCommentId(parentCommentId)
                .authorUserId(actor.getId())
                .authorName(trimToNull(actor.getName()) == null ? "Unknown" : actor.getName())
                .authorRole(actor.getRole() == null ? null : actor.getRole().name())
                .message(message)
                .createdAt(now)
                .updatedAt(now)
                .build();

        comments.add(created);
        ticket.setComments(comments);
        incidentTicketRepository.save(ticket);

        return TicketCommentDto.from(created);
    }

    public TicketCommentDto updateComment(String email, String ticketId, String commentId, UpdateTicketCommentRequest request) {
        User actor = findUserByEmail(email);
        IncidentTicket ticket = findTicket(ticketId);
        ensureCommentAccess(actor, ticket);

        String message = trimToNull(request != null ? request.getMessage() : null);
        if (message == null) {
            throw new RuntimeException("Updated comment message is required");
        }

        List<TicketComment> comments = new ArrayList<>(ticket.getComments() == null ? List.of() : ticket.getComments());
        TicketComment comment = comments.stream()
                .filter(item -> commentId.equals(item.getId()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        if (!actor.getId().equals(comment.getAuthorUserId())) {
            throw new RuntimeException("You can only edit your own comments");
        }

        comment.setMessage(message);
        comment.setUpdatedAt(LocalDateTime.now());
        ticket.setComments(comments);
        incidentTicketRepository.save(ticket);

        return TicketCommentDto.from(comment);
    }

    public void deleteComment(String email, String ticketId, String commentId) {
        User actor = findUserByEmail(email);
        IncidentTicket ticket = findTicket(ticketId);
        ensureCommentAccess(actor, ticket);

        List<TicketComment> comments = new ArrayList<>(ticket.getComments() == null ? List.of() : ticket.getComments());
        TicketComment target = comments.stream()
                .filter(item -> commentId.equals(item.getId()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        boolean isOwner = actor.getId().equals(target.getAuthorUserId());
        boolean isModerator = actor.getRole() == Role.ADMIN || actor.getRole() == Role.MANAGER;
        if (!isOwner && !isModerator) {
            throw new RuntimeException("You are not allowed to delete this comment");
        }

        Set<String> deleteIds = new HashSet<>();
        deleteIds.add(target.getId());

        boolean changed;
        do {
            changed = false;
            for (TicketComment comment : comments) {
                if (comment == null) {
                    continue;
                }
                String parentId = trimToNull(comment.getParentCommentId());
                if (parentId != null && deleteIds.contains(parentId) && !deleteIds.contains(comment.getId())) {
                    deleteIds.add(comment.getId());
                    changed = true;
                }
            }
        } while (changed);

        List<TicketComment> nextComments = comments.stream()
                .filter(comment -> comment != null && !deleteIds.contains(comment.getId()))
                .toList();

        ticket.setComments(nextComments);
        incidentTicketRepository.save(ticket);
    }

    private User findUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private IncidentTicket findTicket(String ticketId) {
        return incidentTicketRepository.findById(ticketId)
                .or(() -> incidentTicketRepository.findByTicketId(ticketId))
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
    }

    private void ensureCommentAccess(User actor, IncidentTicket ticket) {
        Role role = actor.getRole();

        if (role == Role.ADMIN || role == Role.MANAGER) {
            return;
        }

        if (role == Role.USER && actor.getId().equals(ticket.getUserId())) {
            return;
        }

        if (role == Role.TECHNICIAN && actor.getId().equals(ticket.getAssignedTechnicianId())) {
            return;
        }

        throw new RuntimeException("You are not allowed to access comments for this ticket");
    }

    private List<TicketCommentDto> toSortedCommentDtos(List<TicketComment> comments) {
        if (comments == null) {
            return List.of();
        }

        return comments.stream()
                .filter(comment -> comment != null)
                .sorted(Comparator.comparing(TicketComment::getCreatedAt, Comparator.nullsLast(Comparator.naturalOrder())))
                .map(TicketCommentDto::from)
                .toList();
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
