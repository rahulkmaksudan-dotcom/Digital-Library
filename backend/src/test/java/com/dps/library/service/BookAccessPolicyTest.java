package com.dps.library.service;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class BookAccessPolicyTest {

    @Test
    @DisplayName("Faculty, librarian and admin can manage catalog entries")
    void shouldAllowLibraryStaffToManageBooks() {
        assertTrue(BookAccessPolicy.canManageCatalog("ADMIN"));
        assertTrue(BookAccessPolicy.canManageCatalog("LIBRARIAN"));
        assertTrue(BookAccessPolicy.canManageCatalog("FACULTY"));
        assertFalse(BookAccessPolicy.canManageCatalog("STUDENT"));
    }

    @Test
    @DisplayName("Faculty, librarian and admin can approve issuing to students")
    void shouldAllowLibraryStaffToIssueBooks() {
        assertTrue(BookAccessPolicy.canIssueBook("ADMIN"));
        assertTrue(BookAccessPolicy.canIssueBook("LIBRARIAN"));
        assertTrue(BookAccessPolicy.canIssueBook("FACULTY"));
        assertFalse(BookAccessPolicy.canIssueBook("STUDENT"));
    }
}
