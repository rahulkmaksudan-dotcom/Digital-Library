-- ==============================================================================
-- V5__seed_academic_resources.sql
-- Digital & Academic Resources for Thakur Shree DPS College
-- ==============================================================================

INSERT INTO digital_resources (
    id, title, description, file_name, file_url, file_type, file_size,
    category, subject, semester, department, academic_year, resource_type,
    uploaded_by, approved_by, status, downloads_count
) VALUES
(1, 'Data Structures & Algorithms Comprehensive Lecture Notes', 'Complete handwritten and digitized class notes covering trees, graphs, sorting, and dynamic programming.', 'CS301_DSA_Notes_2026.pdf', '/api/v1/resources/download/CS301_DSA_Notes_2026.pdf', 'application/pdf', 4852912, 'Computer Science & Engineering', 'Data Structures & Algorithms', 3, 'Computer Engineering', '2025-2026', 'NOTES', NULL, NULL, 'APPROVED', 142),

(2, 'Operating Systems Kernel Architecture Lab Manual', 'Lab guide for POSIX threads, process synchronization, CPU scheduling, and xv6 operating system exercises.', 'CS402_OS_Lab_Manual.pdf', '/api/v1/resources/download/CS402_OS_Lab_Manual.pdf', 'application/pdf', 3125600, 'Computer Science & Engineering', 'Operating Systems', 4, 'Computer Engineering', '2025-2026', 'LAB_MANUAL', NULL, NULL, 'APPROVED', 98),

(3, 'Computer Networks End-Semester Question Paper 2025', 'Previous year university examination question paper with detailed marking scheme and sample solutions.', 'IT501_CN_QP_2025.pdf', '/api/v1/resources/download/IT501_CN_QP_2025.pdf', 'application/pdf', 1245000, 'Information Technology', 'Computer Networks', 5, 'Information Technology', '2024-2025', 'QUESTION_PAPER', NULL, NULL, 'APPROVED', 215),

(4, 'B.Tech AI & ML Official Curriculum & Syllabus 2025-2029', 'Accredited university syllabus outlining course outcomes, credit structures, and recommended bibliography.', 'AIML_Curriculum_Syllabus_2025_2029.pdf', '/api/v1/resources/download/AIML_Curriculum_Syllabus_2025_2029.pdf', 'application/pdf', 2894100, 'Artificial Intelligence & Machine Learning', 'Curriculum', 1, 'AI & ML', '2025-2026', 'SYLLABUS', NULL, NULL, 'APPROVED', 340),

(5, 'Machine Learning & Neural Networks Practical Exercises', 'Jupyter notebook companions, backpropagation derivation sheets, and PyTorch introductory guide.', 'AIML601_DeepLearning_Notes.pdf', '/api/v1/resources/download/AIML601_DeepLearning_Notes.pdf', 'application/pdf', 6231900, 'Artificial Intelligence & Machine Learning', 'Machine Learning', 6, 'AI & ML', '2025-2026', 'STUDY_MATERIAL', NULL, NULL, 'APPROVED', 188),

(6, 'Digital Signal Processing Previous Year Solved Papers', 'Collection of 5-year university exam question papers with step-by-step mathematical proofs for FFT/DFT.', 'EC502_DSP_SolvedPapers.pdf', '/api/v1/resources/download/EC502_DSP_SolvedPapers.pdf', 'application/pdf', 3912000, 'Electronics & Communication', 'Digital Signal Processing', 5, 'Electronics', '2024-2025', 'QUESTION_PAPER', NULL, NULL, 'APPROVED', 87),

(7, 'VLSI Design & Embedded Systems Lab Manual', 'Verilog HDL simulation manuals, FPGA synthesis guide, and Cadence EDA tool reference walkthrough.', 'EC603_VLSI_LabManual.pdf', '/api/v1/resources/download/EC603_VLSI_LabManual.pdf', 'application/pdf', 4150000, 'Electronics & Communication', 'VLSI Design', 6, 'Electronics', '2025-2026', 'LAB_MANUAL', NULL, NULL, 'APPROVED', 65),

(8, 'Thermodynamics & Heat Transfer Formulas & Charts', 'Handy reference chart containing steam tables, psychrometric charts, and key thermodynamic governing equations.', 'ME401_Thermo_FormulaHandbook.pdf', '/api/v1/resources/download/ME401_Thermo_FormulaHandbook.pdf', 'application/pdf', 2410000, 'Mechanical Engineering', 'Thermodynamics', 4, 'Mechanical', '2025-2026', 'STUDY_MATERIAL', NULL, NULL, 'APPROVED', 114),

(9, 'B.Tech Civil Engineering Structural Design Syllabus', 'Detailed semester-wise syllabus for Structural Analysis, Concrete Technology, and Geotechnical Engineering.', 'CE_Syllabus_Scheme_2025.pdf', '/api/v1/resources/download/CE_Syllabus_Scheme_2025.pdf', 'application/pdf', 1890000, 'Civil Engineering', 'Structural Engineering', 5, 'Civil', '2025-2026', 'SYLLABUS', NULL, NULL, 'APPROVED', 92),

(10, 'Engineering Mathematics III (Discrete & Transforms) Notes', 'Classroom notes for Laplace Transforms, Z-transforms, Fourier series, and graph theory with worked examples.', 'MATH301_EnggMath_Notes.pdf', '/api/v1/resources/download/MATH301_EnggMath_Notes.pdf', 'application/pdf', 5120000, 'Applied Mathematics', 'Engineering Mathematics III', 3, 'Computer Engineering', '2025-2026', 'NOTES', NULL, NULL, 'APPROVED', 260),

(11, 'Advanced Database Management Systems Pending Submission', 'Student submitted lecture note on distributed query processing awaiting librarian approval.', 'IT602_Distributed_DBMS.pdf', '/api/v1/resources/download/IT602_Distributed_DBMS.pdf', 'application/pdf', 1980000, 'Information Technology', 'Distributed DBMS', 6, 'Information Technology', '2025-2026', 'NOTES', NULL, NULL, 'PENDING', 0);

