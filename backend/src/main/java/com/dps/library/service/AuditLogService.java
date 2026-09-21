package com.dps.library.service;

import com.dps.library.dto.PagedResponse;
import com.dps.library.entity.AuditLog;
import com.dps.library.repository.AuditLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class AuditLogService {

    @Autowired
    private AuditLogRepository auditLogRepository;

    public void log(Long userId, String userEmail, String action, String entity, String entityId, String description, String ipAddress) {
        try {
            AuditLog auditLog = new AuditLog(userId, userEmail, action, entity, entityId, description, ipAddress);
            auditLogRepository.save(auditLog);
        } catch (Exception e) {
            // Logging failure should never block business operation
        }
    }

    public PagedResponse<AuditLog> getAuditLogs(String action, String entity, String query, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<AuditLog> logPage = auditLogRepository.searchLogs(
            (action != null && !action.isEmpty()) ? action : null,
            (entity != null && !entity.isEmpty()) ? entity : null,
            (query != null && !query.isEmpty()) ? query : null,
            pageable
        );

        return new PagedResponse<>(
            logPage.getContent(),
            logPage.getNumber(),
            logPage.getSize(),
            logPage.getTotalElements(),
            logPage.getTotalPages(),
            logPage.isLast()
        );
    }
}

