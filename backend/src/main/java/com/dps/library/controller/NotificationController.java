package com.dps.library.controller;

import com.dps.library.dto.ApiResponse;
import com.dps.library.dto.NotificationDto;
import com.dps.library.dto.PagedResponse;
import com.dps.library.security.UserPrincipal;
import com.dps.library.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/notifications")
@Tag(name = "Notifications", description = "Endpoints for user alerts, reminders, and notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @GetMapping
    @Operation(summary = "Get User Notifications (Paged)")
    public ResponseEntity<ApiResponse<PagedResponse<NotificationDto>>> getNotifications(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        PagedResponse<NotificationDto> result = notificationService.getUserNotifications(currentUser.getId(), page, size);
        return ResponseEntity.ok(ApiResponse.success("Notifications retrieved", result));
    }

    @GetMapping("/recent")
    @Operation(summary = "Get Recent Notifications (Dropdown)")
    public ResponseEntity<ApiResponse<List<NotificationDto>>> getRecentNotifications(
            @AuthenticationPrincipal UserPrincipal currentUser) {

        List<NotificationDto> list = notificationService.getRecentNotifications(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Recent notifications", list));
    }

    @GetMapping("/unread-count")
    @Operation(summary = "Get Unread Count")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getUnreadCount(
            @AuthenticationPrincipal UserPrincipal currentUser) {

        long count = notificationService.getUnreadCount(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Unread count", Map.of("count", count)));
    }

    @PatchMapping("/{id}/read")
    @Operation(summary = "Mark Notification as Read")
    public ResponseEntity<ApiResponse<NotificationDto>> markAsRead(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        NotificationDto dto = notificationService.markAsRead(id, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Marked as read", dto));
    }

    @PatchMapping("/read-all")
    @Operation(summary = "Mark All as Read")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead(
            @AuthenticationPrincipal UserPrincipal currentUser) {

        notificationService.markAllAsRead(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("All notifications marked as read"));
    }
}
