package com.dps.library.config;

import com.dps.library.entity.Role;
import com.dps.library.entity.User;
import com.dps.library.repository.RoleRepository;
import com.dps.library.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.io.File;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Value("${app.storage.upload-dir:./uploads}")
    private String uploadDir;

    @Override
    public void run(String... args) throws Exception {
        // Ensure upload directory exists
        try {
            File dir = new File(uploadDir);
            if (!dir.exists()) {
                boolean created = dir.mkdirs();
                logger.info("Created upload directory: {} (status: {})", uploadDir, created);
            }
        } catch (Exception e) {
            logger.warn("Could not create upload directory {}: {}", uploadDir, e.getMessage());
        }

        // Ensure roles exist
        ensureRole("ADMIN", "Full system access and configuration control");
        ensureRole("LIBRARIAN", "Library operations, catalog, issue, return, and resources approval");
        ensureRole("FACULTY", "Access to digital resources, research papers, and academic catalog");
        ensureRole("STUDENT", "Borrow books, view loans, make reservations, access digital notes");

        // Verify and synchronize demo passwords
        syncUserPassword("admin@dpslibrary.edu", "Admin@123", "ADMIN", "EMP001", "Dr. Arvind Sharma", "Administration", "Director");
        syncUserPassword("librarian@dpslibrary.edu", "Librarian@123", "LIBRARIAN", "EMP002", "Sunita Verma", "Central Library", "Chief Librarian");
        syncUserPassword("faculty1@dpslibrary.edu", "Faculty@123", "FACULTY", "FAC001", "Prof. Rajesh Kumar", "Computer Engineering", "Professor & HOD");
        syncUserPassword("faculty2@dpslibrary.edu", "Faculty@123", "FACULTY", "FAC002", "Dr. Meenakshi Sundaram", "AI & ML", "Associate Professor");

        // Seed project team members
        syncUserPassword("student1@dpslibrary.edu", "Student@123", "STUDENT", "DPS2023CS001", "Ashish Yadav", "Computer Engineering", "B.Tech");
        syncUserPassword("student2@dpslibrary.edu", "Student@123", "STUDENT", "DPS2023CS002", "Rahul Yadav", "Computer Engineering", "B.Tech");
        syncUserPassword("student3@dpslibrary.edu", "Student@123", "STUDENT", "DPS2023CS003", "Priyanshu Yadav", "Computer Engineering", "B.Tech");

        // Additional students
        for (int i = 4; i <= 10; i++) {
            String email = "student" + i + "@dpslibrary.edu";
            String studentId = "DPS2023IT" + String.format("%03d", i);
            String name = "Student " + i;
            syncUserPassword(email, "Student@123", "STUDENT", studentId, name, "Computer Engineering", "B.Tech");
        }

        logger.info("Demo user credentials synchronized successfully.");
    }

    private void ensureRole(String name, String description) {
        if (roleRepository.findByName(name).isEmpty()) {
            Role role = new Role(name, description);
            roleRepository.save(role);
            logger.info("Created role: {}", name);
        }
    }

    private void syncUserPassword(String email, String rawPassword, String roleName, String studentId, String fullName, String dept, String course) {
        Role role = roleRepository.findByName(roleName).orElseGet(() -> {
            Role newRole = new Role(roleName, roleName + " role");
            return roleRepository.save(newRole);
        });

        userRepository.findByEmail(email).ifPresentOrElse(user -> {
            if (!passwordEncoder.matches(rawPassword, user.getPasswordHash())) {
                user.setPasswordHash(passwordEncoder.encode(rawPassword));
                userRepository.save(user);
                logger.info("Updated password hash for user: {}", email);
            }
        }, () -> {
            User newUser = new User();
            newUser.setEmail(email);
            newUser.setPasswordHash(passwordEncoder.encode(rawPassword));
            newUser.setStudentId(studentId);
            newUser.setFullName(fullName);
            newUser.setDepartment(dept);
            newUser.setCourse(course);
            newUser.setSemester(6);
            newUser.setPhone("+91 9820000000");
            newUser.setRole(role);
            newUser.setActive(true);
            userRepository.save(newUser);
            logger.info("Created demo user: {} ({})", email, roleName);
        });
    }
}

