FROM openjdk:17-jdk-slim

WORKDIR /app

COPY . .

RUN chmod +x ./gradlew && ./gradlew bootJar --no-daemon

EXPOSE 8080

CMD ["java", "-jar", "build/libs/*.jar"]
