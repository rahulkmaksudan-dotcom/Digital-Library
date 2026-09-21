-- ==============================================================================
-- V6__seed_demo_users_and_activity.sql
-- Demo Users across ADMIN, LIBRARIAN, FACULTY, STUDENT
-- Sample Loans, Fines, Reservations, Favorites, Requests, Notifications
-- Default Password for all seed users will be verified/updated by Spring DataInitializer
-- ==============================================================================

-- 1. SEED USERS
-- Placeholder BCrypt hash: $2a$10$wE99Wk0b7zP7p0gGk/JcNuUf9Jq41v0c9C5Xp3f0UvM6zI7y6jM.2
INSERT INTO users (
    id, student_id, email, password_hash, full_name, phone,
    department, course, semester, role_id, active
) VALUES
-- Admin
(1, 'EMP001', 'admin@dpslibrary.edu', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOcd7hkBOQ6e2', 'Dr. Arvind Sharma', '+91 9820123450', 'Administration', 'Director', NULL, 1, TRUE),
-- Librarian
(2, 'EMP002', 'librarian@dpslibrary.edu', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOcd7hkBOQ6e2', 'Sunita Verma', '+91 9820123451', 'Central Library', 'Chief Librarian', NULL, 2, TRUE),
-- Faculty
(3, 'FAC001', 'faculty1@dpslibrary.edu', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOcd7hkBOQ6e2', 'Prof. Rajesh Kumar', '+91 9820123452', 'Computer Engineering', 'Professor & HOD', NULL, 3, TRUE),
(4, 'FAC002', 'faculty2@dpslibrary.edu', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOcd7hkBOQ6e2', 'Dr. Meenakshi Sundaram', '+91 9820123453', 'AI & ML', 'Associate Professor', NULL, 3, TRUE),
-- Students (including project team: Ashish Yadav, Rahul Yadav, Priyanshu Yadav)
(5, 'DPS2023CS001', 'student1@dpslibrary.edu', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOcd7hkBOQ6e2', 'Ashish Yadav', '+91 9820123454', 'Computer Engineering', 'B.Tech', 6, 4, TRUE),
(6, 'DPS2023CS002', 'student2@dpslibrary.edu', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOcd7hkBOQ6e2', 'Rahul Yadav', '+91 9820123455', 'Computer Engineering', 'B.Tech', 6, 4, TRUE),
(7, 'DPS2023CS003', 'student3@dpslibrary.edu', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOcd7hkBOQ6e2', 'Priyanshu Yadav', '+91 9820123456', 'Computer Engineering', 'B.Tech', 6, 4, TRUE),
(8, 'DPS2023IT004', 'student4@dpslibrary.edu', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOcd7hkBOQ6e2', 'Aarav Mehta', '+91 9820123457', 'Information Technology', 'B.Tech', 4, 4, TRUE),
(9, 'DPS2023AI005', 'student5@dpslibrary.edu', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOcd7hkBOQ6e2', 'Ananya Deshmukh', '+91 9820123458', 'AI & ML', 'B.Tech', 4, 4, TRUE),
(10, 'DPS2023EC006', 'student6@dpslibrary.edu', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOcd7hkBOQ6e2', 'Rohan Kulkarni', '+91 9820123459', 'Electronics', 'B.Tech', 6, 4, TRUE),
(11, 'DPS2022ME007', 'student7@dpslibrary.edu', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOcd7hkBOQ6e2', 'Neha Gupta', '+91 9820123460', 'Mechanical', 'B.Tech', 8, 4, TRUE),
(12, 'DPS2022CE008', 'student8@dpslibrary.edu', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOcd7hkBOQ6e2', 'Vikram Chauhan', '+91 9820123461', 'Civil', 'B.Tech', 8, 4, TRUE),
(13, 'DPS2024CS009', 'student9@dpslibrary.edu', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOcd7hkBOQ6e2', 'Sneha Nair', '+91 9820123462', 'Computer Engineering', 'B.Tech', 2, 4, TRUE),
(14, 'DPS2024AI010', 'student10@dpslibrary.edu', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOcd7hkBOQ6e2', 'Aditya Patil', '+91 9820123463', 'AI & ML', 'B.Tech', 2, 4, TRUE);

-- 2. SEED SAMPLE LOANS (10-day borrowing rule demonstrated)
-- Ashish Yadav (user_id=5) active loan: issued 3 days ago, due in 7 days
INSERT INTO loans (
    id, user_id, book_id, issue_date, due_date, return_date, status, fine_amount, issued_by
) VALUES
(1, 5, 1, CURRENT_DATE - 3, CURRENT_DATE + 7, NULL, 'ACTIVE', 0.00, 2),
-- Rahul Yadav (user_id=6) active loan: issued 2 days ago, due in 8 days
(2, 6, 2, CURRENT_DATE - 2, CURRENT_DATE + 8, NULL, 'ACTIVE', 0.00, 2),
-- Priyanshu Yadav (user_id=7) active loan: issued 1 day ago, due in 9 days
(3, 7, 3, CURRENT_DATE - 1, CURRENT_DATE + 9, NULL, 'ACTIVE', 0.00, 2),
-- Aarav Mehta (user_id=8) OVERDUE loan: issued 15 days ago, was due 5 days ago (10-day period)
(4, 8, 5, CURRENT_DATE - 15, CURRENT_DATE - 5, NULL, 'OVERDUE', 10.00, 2),
-- Ananya Deshmukh (user_id=9) RETURNED loan: issued 20 days ago, returned on time 12 days ago
(5, 9, 10, CURRENT_DATE - 20, CURRENT_DATE - 10, CURRENT_DATE - 12, 'RETURNED', 0.00, 2);

-- 3. SEED FINES (Aarav Mehta has 5 days overdue fine: 5 * 2.00 = 10.00)
INSERT INTO fines (id, loan_id, user_id, amount, days_overdue, status) VALUES
(1, 4, 8, 10.00, 5, 'PENDING');

-- 4. SEED RESERVATIONS (Sneha Nair reserves unavailable book 19)
INSERT INTO reservations (id, book_id, user_id, reservation_date, expiry_date, status) VALUES
(1, 19, 13, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '3' DAY, 'ACTIVE');

-- 5. SEED FAVORITES
INSERT INTO favorites (user_id, book_id) VALUES
(5, 1),
(5, 2),
(6, 2),
(6, 3),
(7, 3),
(7, 14),
(8, 5);

-- 6. SEED BOOK REQUESTS
INSERT INTO book_requests (id, user_id, title, author, isbn, reason, status, admin_comment) VALUES
(1, 5, 'Designing Machine Learning Systems', 'Chip Huyen', '978-1098107963', 'Required for final year B.Tech capstone project on production ML systems', 'PENDING', NULL),
(2, 6, 'Kubernetes in Action', 'Marko Luksa', '978-1617293726', 'Needed for distributed systems lab and cloud engineering research', 'APPROVED', 'Approved by Library Committee. Procurement initiated.');

-- 7. SEED NOTIFICATIONS
INSERT INTO notifications (id, user_id, title, message, type, is_read) VALUES
(1, 5, 'Welcome to DPS Digital Library', 'Your student account is active. Explore books, syllabus, and lecture notes.', 'INFO', TRUE),
(2, 5, 'Book Issued Successfully', 'You have borrowed "Introduction to Algorithms". Due date is in 7 days.', 'SUCCESS', TRUE),
(3, 8, 'OVERDUE NOTICE: Action Required', 'Your loan for "Database System Concepts" is 5 days overdue. Fine accrued: Rs. 10.00. Please return immediately.', 'OVERDUE', FALSE),
(4, 13, 'Reservation Confirmed', 'You have reserved "Operating System Concepts Essentials". You will be notified once a copy becomes available.', 'RESERVATION', FALSE);

-- 8. SEED AUDIT LOGS
INSERT INTO audit_logs (id, user_id, user_email, action, entity, entity_id, description, ip_address) VALUES
(1, 2, 'librarian@dpslibrary.edu', 'BOOK_ISSUED', 'Loan', '1', 'Issued "Introduction to Algorithms" to Ashish Yadav (DPS2023CS001)', '192.168.1.100'),
(2, 2, 'librarian@dpslibrary.edu', 'BOOK_ISSUED', 'Loan', '2', 'Issued "Clean Code" to Rahul Yadav (DPS2023CS002)', '192.168.1.100'),
(3, 2, 'librarian@dpslibrary.edu', 'BOOK_ISSUED', 'Loan', '3', 'Issued "Artificial Intelligence: A Modern Approach" to Priyanshu Yadav (DPS2023CS003)', '192.168.1.100'),
(4, 1, 'admin@dpslibrary.edu', 'RESOURCE_APPROVED', 'DigitalResource', '1', 'Approved DSA lecture notes for Computer Engineering', '192.168.1.10');

