# ==============================================================================
# Multi-stage Dockerfile for Digital Library Management System Backend
# Thakur Shree DPS College of Engineering and Management
# ==============================================================================

# Stage 1: Build JAR using Maven and Java 21
FROM maven:3.9.6-eclipse-temurin-21 AS builder
WORKDIR /app

# Copy pom.xml and download dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code and resources
COPY src ./src

# Package application (skip tests in container build since verified locally)
RUN mvn clean package -DskipTests -B

# Stage 2: Runtime Image with Eclipse Temurin JRE 21
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

# Create non-root system user for security
RUN groupadd -r dpslibrary && useradd -r -g dpslibrary dpsuser

# Copy built jar from builder stage
COPY --from=builder /app/target/digital-library-backend-1.0.0.jar app.jar

# Create directory for digital file uploads
RUN mkdir -p /app/uploads && chown -R dpsuser:dpslibrary /app

# Switch to non-root user
USER dpsuser

# Expose Spring Boot port
EXPOSE 8080

# Environment variables with sensible defaults (overridable on Render/Docker)
ENV SPRING_PROFILES_ACTIVE=postgres \
    SERVER_PORT=8080 \
    JAVA_OPTS="-Xms256m -Xmx512m"

# Healthcheck to verify Spring Boot Actuator / API status
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:8080/api/v1/health || exit 1

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]

