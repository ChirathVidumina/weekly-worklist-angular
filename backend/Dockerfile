# Stage 1: Build the JAR with Maven & Java 21
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

# Copy pom.xml and pre-fetch dependencies for efficient layer caching
COPY pom.xml .
RUN mvn dependency:go-offline -B || true

# Copy source code and package the Spring Boot application
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Minimal, secure Alpine JRE 21 runtime
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Create a non-root user for security best practices
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Copy repackaged JAR from the build stage
COPY --from=build /app/target/weekly-worklist-backend-*.jar /app/app.jar

# Default fallback port (Render automatically provides $PORT)
ENV PORT=8080
EXPOSE ${PORT}

# Start the Spring Boot application
ENTRYPOINT ["sh", "-c", "java -Djava.security.egd=file:/dev/./urandom -Dserver.port=${PORT} -jar /app/app.jar"]
