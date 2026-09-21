package com.dps.library.repository;

import com.dps.library.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByStudentId(String studentId);
    boolean existsByEmail(String email);
    boolean existsByStudentId(String studentId);

    @Query("SELECT u FROM User u WHERE u.email = :identifier OR u.studentId = :identifier")
    Optional<User> findByEmailOrStudentId(@Param("identifier") String identifier);

    @Query("SELECT COUNT(u) FROM User u WHERE u.role.name = :roleName")
    long countByRoleName(@Param("roleName") String roleName);

    long countByActiveTrue();

    List<User> findByRoleName(String roleName);

    @Query("SELECT u FROM User u WHERE " +
           "(:roleName IS NULL OR u.role.name = :roleName) AND " +
           "(:department IS NULL OR u.department = :department) AND " +
           "(:query IS NULL OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(u.email) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(u.studentId) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<User> searchUsers(@Param("roleName") String roleName,
                           @Param("department") String department,
                           @Param("query") String query,
                           Pageable pageable);
}

