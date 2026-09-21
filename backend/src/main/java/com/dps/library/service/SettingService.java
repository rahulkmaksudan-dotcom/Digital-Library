package com.dps.library.service;

import com.dps.library.dto.SettingDto;
import com.dps.library.entity.LibrarySetting;
import com.dps.library.exception.ResourceNotFoundException;
import com.dps.library.repository.LibrarySettingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class SettingService {

    @Autowired
    private LibrarySettingRepository settingRepository;

    public String getSetting(String key, String defaultValue) {
        return settingRepository.findBySettingKey(key)
            .map(LibrarySetting::getSettingValue)
            .orElse(defaultValue);
    }

    public int getIntSetting(String key, int defaultValue) {
        try {
            return Integer.parseInt(getSetting(key, String.valueOf(defaultValue)));
        } catch (NumberFormatException e) {
            return defaultValue;
        }
    }

    public BigDecimal getDecimalSetting(String key, BigDecimal defaultValue) {
        try {
            return new BigDecimal(getSetting(key, defaultValue.toString()));
        } catch (Exception e) {
            return defaultValue;
        }
    }

    public List<SettingDto> getAllSettings() {
        return settingRepository.findAll().stream()
            .map(s -> new SettingDto(s.getSettingKey(), s.getSettingValue(), s.getDescription()))
            .collect(Collectors.toList());
    }

    public Map<String, String> getPublicSettings() {
        Map<String, String> settings = new HashMap<>();
        settings.put("libraryName", getSetting("library_name", "Digital Library Management System"));
        settings.put("institutionName", getSetting("institution_name", "Thakur Shree DPS College of Engineering and Management"));
        settings.put("loanPeriodDays", getSetting("loan_period_days", "10"));
        settings.put("finePerDay", getSetting("fine_per_day", "2.00"));
        settings.put("maxActiveLoans", getSetting("max_active_loans", "4"));
        settings.put("systemMaintenanceMode", getSetting("system_maintenance_mode", "false"));
        return settings;
    }

    @Transactional
    public SettingDto updateSetting(String key, String value, String description) {
        LibrarySetting setting = settingRepository.findBySettingKey(key)
            .orElse(new LibrarySetting(key, value, description));

        setting.setSettingValue(value);
        if (description != null) {
            setting.setDescription(description);
        }
        setting.setUpdatedAt(LocalDateTime.now());
        LibrarySetting saved = settingRepository.save(setting);

        return new SettingDto(saved.getSettingKey(), saved.getSettingValue(), saved.getDescription());
    }
}

