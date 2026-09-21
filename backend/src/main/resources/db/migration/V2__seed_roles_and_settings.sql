-- ==============================================================================
-- V2__seed_roles_and_settings.sql
-- ==============================================================================

INSERT INTO roles (id, name, description) VALUES
(1, 'ADMIN', 'Full system access and configuration control'),
(2, 'LIBRARIAN', 'Library operations, catalog, issue, return, and resources approval'),
(3, 'FACULTY', 'Access to digital resources, research papers, and academic catalog'),
(4, 'STUDENT', 'Borrow books, view loans, make reservations, access digital notes');

INSERT INTO library_settings (setting_key, setting_value, description) VALUES
('library_name', 'Digital Library Management System', 'Official library portal branding name'),
('institution_name', 'Thakur Shree DPS College of Engineering and Management', 'Host engineering college institution'),
('loan_period_days', '10', 'Default loan borrowing period in days'),
('fine_per_day', '2.00', 'Fine charged per day after overdue'),
('max_active_loans', '4', 'Maximum physical books a student can borrow concurrently'),
('reservation_expiry_days', '3', 'Hold period for reserved book once collected/available'),
('reminder_days_before_due', '3,1,0', 'Days before due date to alert borrower'),
('email_notifications_enabled', 'false', 'SMTP notification toggle'),
('system_maintenance_mode', 'false', 'Global maintenance banner toggle');

