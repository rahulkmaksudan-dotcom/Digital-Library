package com.dps.library.dto;

import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;

public class SettingDto {
    private Long id;

    @NotBlank(message = "Key is required")
    private String settingKey;

    @NotBlank(message = "Value is required")
    private String settingValue;

    private String description;
    private LocalDateTime updatedAt;

    public SettingDto() {}

    public SettingDto(String settingKey, String settingValue, String description) {
        this.settingKey = settingKey;
        this.settingValue = settingValue;
        this.description = description;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getSettingKey() { return settingKey; }
    public void setSettingKey(String settingKey) { this.settingKey = settingKey; }

    public String getSettingValue() { return settingValue; }
    public void setSettingValue(String settingValue) { this.settingValue = settingValue; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}

