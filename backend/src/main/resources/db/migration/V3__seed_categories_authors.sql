-- ==============================================================================
-- V3__seed_categories_authors.sql
-- ==============================================================================

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
(10, 'Data Science & Analytics', 'DATA', 'Big data systems, statistical learning, data visualization, and predictive modeling');

INSERT INTO authors (id, name, biography, nationality) VALUES
(1, 'Thomas H. Cormen', 'Co-author of Introduction to Algorithms, Professor Emeritus at Dartmouth College', 'American'),
(2, 'Robert C. Martin', 'Software craftsman, author of Clean Code and Clean Architecture (Uncle Bob)', 'American'),
(3, 'Stuart Russell', 'Professor of Computer Science at UC Berkeley, author of Artificial Intelligence: A Modern Approach', 'British'),
(4, 'Andrew S. Tanenbaum', 'Professor Emeritus at Vrije Universiteit Amsterdam, author of Modern Operating Systems and Computer Networks', 'American/Dutch'),
(5, 'Abraham Silberschatz', 'Professor of Computer Science at Yale, author of Operating System Concepts and Database System Concepts', 'American'),
(6, 'Bjarne Stroustrup', 'Creator of C++, Technical Fellow and Managing Director at Morgan Stanley', 'Danish'),
(7, 'James F. Kurose', 'Distinguished Professor of Computer Science at University of Massachusetts Amherst', 'American'),
(8, 'Ian Sommerville', 'Emeritus Professor of Software Engineering at University of St Andrews', 'British'),
(9, 'Richard Szeliski', 'Computer Vision researcher, author of Computer Vision: Algorithms and Applications', 'Canadian'),
(10, 'Herbert Schildt', 'Leading authority on Java, C, and C++, author of Java: The Complete Reference', 'American'),
(11, 'John L. Hennessy', 'Chairman of Alphabet Inc., co-author of Computer Architecture: A Quantitative Approach', 'American'),
(12, 'Erwin Kreyszig', 'Applied mathematician, author of Advanced Engineering Mathematics', 'German');

