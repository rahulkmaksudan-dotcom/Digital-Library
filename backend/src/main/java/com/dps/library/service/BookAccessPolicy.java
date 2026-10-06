package com.dps.library.service;

import java.util.Set;

public final class BookAccessPolicy {

    private static final Set<String> CATALOG_MANAGERS = Set.of("ADMIN", "LIBRARIAN", "FACULTY");
    private static final Set<String> ISSUE_APPROVERS = Set.of("ADMIN", "LIBRARIAN", "FACULTY");

    private BookAccessPolicy() {
    }

    public static boolean canManageCatalog(String role) {
        return role != null && CATALOG_MANAGERS.contains(role.trim().toUpperCase());
    }

    public static boolean canIssueBook(String role) {
        return role != null && ISSUE_APPROVERS.contains(role.trim().toUpperCase());
    }

    public static boolean canApproveBookRequest(String role) {
        return canIssueBook(role);
    }
}
