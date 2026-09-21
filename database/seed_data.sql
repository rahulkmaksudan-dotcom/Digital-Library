-- ==============================================================================
-- DIGITAL LIBRARY MANAGEMENT SYSTEM - SEED DATA SCRIPT
-- Institution: Thakur Shree DPS College of Engineering and Management
-- Project Team: Ashish Yadav, Rahul Yadav, Priyanshu Yadav
-- ==============================================================================

-- 1. SEED ROLES
INSERT INTO roles (id, name, description) VALUES
(1, 'ADMIN', 'Full system access and configuration control'),
(2, 'LIBRARIAN', 'Library operations, catalog, issue, return, and resources approval'),
(3, 'FACULTY', 'Access to digital resources, research papers, and academic catalog'),
(4, 'STUDENT', 'Borrow books, view loans, make reservations, access digital notes')
ON CONFLICT (id) DO NOTHING;

-- 2. SEED LIBRARY SETTINGS
INSERT INTO library_settings (setting_key, setting_value, description) VALUES
('library_name', 'Digital Library Management System', 'Official name of the digital library'),
('institution_name', 'Thakur Shree DPS College of Engineering and Management', 'Institution name displayed on all headers and reports'),
('loan_period_days', '10', 'Default borrowing period in days'),
('fine_per_day', '2.00', 'Late fine per day in currency units (INR)'),
('max_active_loans', '4', 'Maximum number of physical books a student can hold simultaneously'),
('reservation_expiry_days', '3', 'Days a student has to collect a reserved book once made available'),
('reminder_days_before_due', '3,1,0', 'Days before due date to trigger automatic notifications'),
('email_notifications_enabled', 'false', 'Enable sending external SMTP notification emails'),
('system_maintenance_mode', 'false', 'Toggle maintenance window banner')
ON CONFLICT (setting_key) DO UPDATE SET setting_value = EXCLUDED.setting_value;

-- 3. SEED CATEGORIES (10 Academic Categories)
INSERT INTO categories (id, name, code, description) VALUES
(1, 'Computer Science & Engineering', 'CSE', 'Core computing, algorithms, programming languages, operating systems, and architectures'),
(2, 'Information Technology', 'IT', 'Software engineering, web architectures, cloud platforms, and cybersecurity'),
(3, 'Artificial Intelligence & Machine Learning', 'AIML', 'Neural networks, computer vision, natural language processing, and deep learning'),
(4, 'Electronics & Communication', 'ECE', 'Digital signal processing, VLSI design, embedded systems, and telecommunications'),
(5, 'Mechanical Engineering', 'ME', 'Thermodynamics, fluid mechanics, robotics, mechanics of machines, and CAD/CAM'),
(6, 'Civil Engineering', 'CE', 'Structural analysis, concrete technology, geotechnics, and environmental engineering'),
(7, 'Applied Mathematics', 'MATH', 'Linear algebra, calculus, discrete structures, and numerical methods'),
(8, 'Engineering Physics & Chemistry', 'BSCI', 'Solid state physics, quantum mechanics, material science, and applied chemistry'),
(9, 'Management & Humanities', 'MGMT', 'Engineering economics, industrial management, professional ethics, and communication skills'),
(10, 'Data Science & Analytics', 'DATA', 'Big data systems, statistical learning, data visualization, and predictive modeling')
ON CONFLICT (id) DO NOTHING;

-- 4. SEED AUTHORS (12 Prominent Engineering Authors)
INSERT INTO authors (id, name, biography, nationality) VALUES
(1, 'Thomas H. Cormen', 'Co-author of Introduction to Algorithms, Professor Emeritus at Dartmouth College', 'American'),
(2, 'Robert C. Martin', 'Software craftsman, author of Clean Code and Clean Architecture (Uncle Bob)', 'American'),
(3, 'Stuart Russell', 'Professor of Computer Science at UC Berkeley, author of Artificial Intelligence: A Modern Approach', 'British'),
(4, 'Andrew S. Tanenbaum', 'Professor Emeritus at Vrije Universiteit Amsterdam, author of Modern Operating Systems and Computer Networks', 'American/Dutch'),
(5, 'Abraham Silberschatz', 'Sidney J. Weinberg Professor of Computer Science at Yale, author of Operating System Concepts and Database System Concepts', 'Israeli/American'),
(6, 'Bjarne Stroustrup', 'Creator of C++, Technical Fellow and Managing Director at Morgan Stanley', 'Danish'),
(7, 'James F. Kurose', 'Distinguished Professor of Computer Science at University of Massachusetts Amherst', 'American'),
(8, 'Ian Sommerville', 'Emeritus Professor of Software Engineering at University of St Andrews, author of Software Engineering', 'British'),
(9, 'Richard Szeliski', 'Computer Vision researcher, author of Computer Vision: Algorithms and Applications', 'Canadian'),
(10, 'Herbert Schildt', 'Leading authority on Java, C, and C++, author of Java: The Complete Reference', 'American'),
(11, 'John L. Hennessy', 'Chairman of Alphabet Inc., co-author of Computer Architecture: A Quantitative Approach', 'American'),
(12, 'Erwin Kreyszig', 'German Canadian applied mathematician, author of Advanced Engineering Mathematics', 'German/Canadian')
ON CONFLICT (id) DO NOTHING;

-- Reset sequences if PostgreSQL
SELECT setval('roles_id_seq', (SELECT MAX(id) FROM roles), true);
SELECT setval('categories_id_seq', (SELECT MAX(id) FROM categories), true);
SELECT setval('authors_id_seq', (SELECT MAX(id) FROM authors), true);

