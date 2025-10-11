# backend/Dockerfile
# Build stage (Maven w/ Temurin 21)
FROM maven:3.9.5-eclipse-temurin-21 AS build
WORKDIR /workspace

# Copy only the files needed for building the backend
COPY pom.xml mvnw ./
COPY .mvn .mvn

# Make wrapper executable & pre-fetch dependencies for cache
RUN chmod +x ./mvnw || true
RUN ./mvnw -B -q -N -DskipTests dependency:go-offline

# Copy source and build
COPY src ./src
RUN ./mvnw -B -DskipTests clean package

# Runtime stage (lightweight JRE)
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

# Copy the built JAR from the build stage
COPY --from=build /workspace/target/*.jar /app/backend.jar

EXPOSE 8080
ENTRYPOINT ["java","-jar","/app/backend.jar"]
