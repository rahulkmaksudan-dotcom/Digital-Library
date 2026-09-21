package com.dps.library.dto;

public class AuthResponse {
    private String token;
    private String type = "Bearer";
    private Long id;
    private String email;
    private String studentId;
    private String fullName;
    private String role;
    private String department;

    public AuthResponse() {}

    public AuthResponse(String token, Long id, String email, String studentId, String fullName, String role, String department) {
        this.token = token;
        this.id = id;
        this.email = email;
        this.studentId = studentId;
        this.fullName = fullName;
        this.role = role;
        this.department = department;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
}

