package com.dps.library.security;

import com.dps.library.entity.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;
import java.util.List;

public class UserPrincipal implements UserDetails {

    private Long id;
    private String email;
    private String studentId;
    private String fullName;
    private String password;
    private String role;
    private boolean active;
    private Collection<? extends GrantedAuthority> authorities;

    public UserPrincipal(Long id, String email, String studentId, String fullName, String password, String role, boolean active, Collection<? extends GrantedAuthority> authorities) {
        this.id = id;
        this.email = email;
        this.studentId = studentId;
        this.fullName = fullName;
        this.password = password;
        this.role = role;
        this.active = active;
        this.authorities = authorities;
    }

    public static UserPrincipal create(User user) {
        String roleName = user.getRole() != null ? user.getRole().getName() : "STUDENT";
        List<GrantedAuthority> authorities = Collections.singletonList(
            new SimpleGrantedAuthority("ROLE_" + roleName)
        );

        return new UserPrincipal(
            user.getId(),
            user.getEmail(),
            user.getStudentId(),
            user.getFullName(),
            user.getPasswordHash(),
            roleName,
            user.getActive() != null && user.getActive(),
            authorities
        );
    }

    public Long getId() { return id; }
    public String getEmail() { return email; }
    public String getStudentId() { return studentId; }
    public String getFullName() { return fullName; }
    public String getRole() { return role; }

    @Override
    public String getUsername() { return email; }

    @Override
    public String getPassword() { return password; }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() { return authorities; }

    @Override
    public boolean isAccountNonExpired() { return true; }

    @Override
    public boolean isAccountNonLocked() { return active; }

    @Override
    public boolean isCredentialsNonExpired() { return true; }

    @Override
    public boolean isEnabled() { return active; }
}

