package com.dps.library.config;

import org.flywaydb.core.Flyway;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.flyway.FlywayMigrationStrategy;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class FlywayConfig {

    private static final Logger logger = LoggerFactory.getLogger(FlywayConfig.class);

    @Bean
    public FlywayMigrationStrategy flywayMigrationStrategy() {
        return flyway -> {
            logger.info("Executing Flyway repair to synchronize migration checksums...");
            try {
                flyway.repair();
                logger.info("Flyway repair executed successfully.");
            } catch (Exception e) {
                logger.warn("Flyway repair encountered an issue (proceeding with migrate): {}", e.getMessage());
            }
            logger.info("Executing Flyway migrate...");
            flyway.migrate();
            logger.info("Flyway migration completed successfully.");
        };
    }
}
