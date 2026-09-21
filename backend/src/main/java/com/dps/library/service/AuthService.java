package com.dps.library.service;

import com.dps.library.dto.*;
import com.dps.library.entity.Role;
import com.dps.library.entity.User;
import com.dps.library.exception.BadRequestException;
import com.dps.library.exception.ResourceNotFoundException;
import com.dps.library.exception.UnauthorizedException;
import com.dps.library.repository.RoleRepository;
import com.dps.library.repository.UserRepository;
import com.dps.library.security.JwtTokenProvider;
import com.dps.library.security.UserPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    private AuditLogService auditLogService;

    @Autowired
    private NotificationService notificationService;

    public AuthResponse login(AuthRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getIdentifier(), request.getPassword())
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();

            if (!userPrincipal.isEnabled()) {
                throw new UnauthorizedException("Your account has been deactivated. Please contact the library administrator.");
            }

            String jwt = tokenProvider.generateToken(authentication);

            User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

            auditLogService.log(user.getId(), user.getEmail(), "USER_LOGIN", "User", String.valueOf(user.getId()),
                "User logged in successfully", "127.0.0.1");

            return new AuthResponse(
                jwt,
                user.getId(),
                user.getEmail(),
                user.getStudentId(),
                user.getFullName(),
                user.getRole().getName(),
                user.getDepartment()
            );
        } catch (BadCredentialsException e) {
            throw new BadRequestException("Invalid email/student ID or password");
        }
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("Passwords do not match");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already registered: " + request.getEmail());
        }

        if (userRepository.existsByStudentId(request.getStudentId())) {
            throw new BadRequestException("Student ID is already registered: " + request.getStudentId());
        }

        Role studentRole = roleRepository.findByName("STUDENT")
            .orElseThrow(() -> new ResourceNotFoundException("Student role not configured in system"));

        User user = new User();
        user.setEmail(request.getEmail().trim().toLowerCase());
        user.setStudentId(request.getStudentId().trim().toUpperCase());
        user.setFullName(request.getFullName().trim());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setPhone(request.getPhone());
        user.setDepartment(request.getDepartment());
        user.setCourse(request.getCourse());
        user.setSemester(request.getSemester());
        user.setRole(studentRole);
        user.setActive(true);

        User savedUser = userRepository.save(user);

        // Welcome notification
        notificationService.createNotification(
            savedUser.getId(),
            "Welcome to DPS Digital Library",
            "Welcome " + savedUser.getFullName() + "! Your student library account is now active.",
            "SUCCESS",
            "/student/dashboard"
        );

        auditLogService.log(savedUser.getId(), savedUser.getEmail(), "USER_REGISTERED", "User",
            String.valueOf(savedUser.getId()), "Student self-registered: " + savedUser.getFullName(), "127.0.0.1");

        UserPrincipal userPrincipal = UserPrincipal.create(savedUser);
        String jwt = tokenProvider.generateTokenFromUser(userPrincipal);

        return new AuthResponse(
            jwt,
            savedUser.getId(),
            savedUser.getEmail(),
            savedUser.getStudentId(),
            savedUser.getFullName(),
            savedUser.getRole().getName(),
            savedUser.getDepartment()
        );
    }

    public UserProfileResponse getProfile(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        UserProfileResponse response = new UserProfileResponse();
        response.setId(user.getId());
        response.setEmail(user.getEmail());
        response.setStudentId(user.getStudentId());
        response.setFullName(user.getFullName());
        response.setPhone(user.getPhone());
        response.setDepartment(user.getDepartment());
        response.setCourse(user.getCourse());
        response.setSemester(user.getSemester());
        response.setRole(user.getRole().getName());
        response.setActive(user.getActive());
        response.setCreatedAt(user.getCreatedAt());
        return response;
    }

    @Transactional
    public UserProfileResponse updateProfile(Long userId, UserProfileResponse request) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        if (request.getFullName() != null && !request.getFullName().isBlank()) {
            user.setFullName(request.getFullName().trim());
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone().trim());
        }
        if (request.getDepartment() != null) {
            user.setDepartment(request.getDepartment().trim());
        }
        if (request.getCourse() != null) {
            user.setCourse(request.getCourse().trim());
        }
        if (request.getSemester() != null) {
            user.setSemester(request.getSemester());
        }

        User updated = userRepository.save(user);
        return getProfile(updated.getId());
    }

    public String forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail().trim().toLowerCase())
            .orElseThrow(() -> new ResourceNotFoundException("No account registered with email: " + request.getEmail()));

        // In a live SMTP setup, an email with a signed token would be dispatched.
        // For development / demonstration, we generate a valid reset token.
        UserPrincipal principal = UserPrincipal.create(user);
        return tokenProvider.generateTokenFromUser(principal);
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        if (!tokenProvider.validateToken(request.getToken())) {
            throw new BadRequestException("Invalid or expired password reset token");
        }

        String email = tokenProvider.getUsernameFromJWT(request.getToken());
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        notificationService.createNotification(
            user.getId(),
            "Password Changed",
            "Your password has been successfully updated.",
            "INFO",
            "/profile"
        );
    }
}

