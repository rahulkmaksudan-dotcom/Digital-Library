package com.dps.library.service;

import com.dps.library.dto.PagedResponse;
import com.dps.library.dto.UserDto;
import com.dps.library.entity.Role;
import com.dps.library.entity.User;
import com.dps.library.exception.BadRequestException;
import com.dps.library.exception.ResourceNotFoundException;
import com.dps.library.repository.RoleRepository;
import com.dps.library.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuditLogService auditLogService;

    public PagedResponse<UserDto> searchUsers(String roleName, String department, String query, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<User> userPage = userRepository.searchUsers(
            (roleName != null && !roleName.isEmpty()) ? roleName : null,
            (department != null && !department.isEmpty()) ? department : null,
            (query != null && !query.isEmpty()) ? query : null,
            pageable
        );

        List<UserDto> dtos = userPage.getContent().stream()
            .map(this::mapToDto)
            .collect(Collectors.toList());

        return new PagedResponse<>(dtos, userPage.getNumber(), userPage.getSize(),
            userPage.getTotalElements(), userPage.getTotalPages(), userPage.isLast());
    }

    public UserDto getUserById(Long id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return mapToDto(user);
    }

    @Transactional
    public UserDto createUser(UserDto dto, Long adminId, String adminEmail) {
        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new BadRequestException("Email is already registered: " + dto.getEmail());
        }

        if (dto.getStudentId() != null && !dto.getStudentId().isBlank() && userRepository.existsByStudentId(dto.getStudentId())) {
            throw new BadRequestException("Student/Employee ID already exists: " + dto.getStudentId());
        }

        Role role = roleRepository.findByName(dto.getRole().toUpperCase())
            .orElseThrow(() -> new ResourceNotFoundException("Role not found: " + dto.getRole()));

        User user = new User();
        user.setEmail(dto.getEmail().trim().toLowerCase());
        user.setFullName(dto.getFullName().trim());
        user.setStudentId(dto.getStudentId() != null ? dto.getStudentId().trim().toUpperCase() : null);
        user.setPhone(dto.getPhone());
        user.setDepartment(dto.getDepartment());
        user.setCourse(dto.getCourse());
        user.setSemester(dto.getSemester());
        user.setRole(role);
        user.setActive(dto.getActive() != null ? dto.getActive() : true);

        String initialPassword = (dto.getPassword() != null && !dto.getPassword().isBlank())
            ? dto.getPassword()
            : "Welcome@123";
        user.setPasswordHash(passwordEncoder.encode(initialPassword));

        User saved = userRepository.save(user);

        auditLogService.log(adminId, adminEmail, "USER_CREATED", "User",
            String.valueOf(saved.getId()), "Created user: " + saved.getEmail() + " (" + role.getName() + ")", "127.0.0.1");

        return mapToDto(saved);
    }

    @Transactional
    public UserDto updateUser(Long id, UserDto dto, Long adminId, String adminEmail) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        user.setFullName(dto.getFullName().trim());
        user.setPhone(dto.getPhone());
        user.setDepartment(dto.getDepartment());
        user.setCourse(dto.getCourse());
        user.setSemester(dto.getSemester());

        if (dto.getActive() != null) {
            user.setActive(dto.getActive());
        }

        if (dto.getRole() != null && !dto.getRole().equalsIgnoreCase(user.getRole().getName())) {
            Role role = roleRepository.findByName(dto.getRole().toUpperCase())
                .orElseThrow(() -> new ResourceNotFoundException("Role not found: " + dto.getRole()));
            user.setRole(role);
        }

        if (dto.getPassword() != null && !dto.getPassword().isBlank()) {
            user.setPasswordHash(passwordEncoder.encode(dto.getPassword()));
        }

        User updated = userRepository.save(user);

        auditLogService.log(adminId, adminEmail, "USER_UPDATED", "User",
            String.valueOf(updated.getId()), "Updated profile for: " + updated.getEmail(), "127.0.0.1");

        return mapToDto(updated);
    }

    @Transactional
    public void toggleUserActive(Long id, Long adminId, String adminEmail) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        user.setActive(!user.getActive());
        userRepository.save(user);

        String action = user.getActive() ? "USER_ACTIVATED" : "USER_DEACTIVATED";
        auditLogService.log(adminId, adminEmail, action, "User",
            String.valueOf(user.getId()), action + " for " + user.getEmail(), "127.0.0.1");
    }

    public UserDto mapToDto(User u) {
        UserDto dto = new UserDto();
        dto.setId(u.getId());
        dto.setStudentId(u.getStudentId());
        dto.setEmail(u.getEmail());
        dto.setFullName(u.getFullName());
        dto.setPhone(u.getPhone());
        dto.setDepartment(u.getDepartment());
        dto.setCourse(u.getCourse());
        dto.setSemester(u.getSemester());
        dto.setRole(u.getRole().getName());
        dto.setActive(u.getActive());
        dto.setCreatedAt(u.getCreatedAt());
        dto.setUpdatedAt(u.getUpdatedAt());
        return dto;
    }
}

