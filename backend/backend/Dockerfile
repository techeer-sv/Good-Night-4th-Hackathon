# ---- Build stage (Gradle) ----
FROM eclipse-temurin:24-jdk AS builder
WORKDIR /workspace

# Copy Gradle wrapper and build files
COPY gradlew ./
COPY gradle ./gradle
COPY build.gradle settings.gradle ./
COPY src ./src

RUN chmod +x ./gradlew

# Build Spring Boot fat jar (cache Gradle deps between builds)
RUN --mount=type=cache,target=/root/.gradle ./gradlew --no-daemon clean bootJar -x test

# ---- Runtime stage ----
# The app is compiled for the Java toolchain in build.gradle (currently 24),
# so use a matching JRE at runtime.
FROM eclipse-temurin:24-jre
WORKDIR /app

# Copy fat jar
COPY --from=builder /workspace/build/libs/*.jar /app/app.jar

ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0" \
    TZ=Asia/Seoul

EXPOSE 8080
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar /app/app.jar"]


