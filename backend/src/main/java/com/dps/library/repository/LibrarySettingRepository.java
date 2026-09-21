package com.dps.library.repository;

import com.dps.library.entity.LibrarySetting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LibrarySettingRepository extends JpaRepository<LibrarySetting, Long> {
    Optional<LibrarySetting> findBySettingKey(String settingKey);
    boolean existsBySettingKey(String settingKey);
}

