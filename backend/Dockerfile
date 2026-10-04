# ==========================================
# Stage 1: Build the Spring Boot application
# ==========================================
FROM maven:3.9.9-eclipse-temurin-17 AS builder

WORKDIR /build

# Copy dependency definition first
COPY pom.xml .

# Copy application source
COPY src ./src

# Always build the JAR from source
RUN mvn -B clean package -DskipTests

# ==========================================
# Stage 2: Production runtime
# ==========================================
FROM eclipse-temurin:17-jre

WORKDIR /app

# Create a non-root user
RUN groupadd --system appgroup && \
    useradd --system --gid appgroup appuser

# Copy freshly built JAR
COPY --from=builder /build/target/food-delivery-backend-1.0.0.jar app.jar

# Give application user ownership
RUN chown -R appuser:appgroup /app

# Run as non-root user
USER appuser

EXPOSE 8080

# Container-aware JVM configuration
ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar"]
