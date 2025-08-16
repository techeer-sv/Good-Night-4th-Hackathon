# 1. Gradle로 빌드된 JAR 실행용 이미지
FROM openjdk:21-jdk-slim

# 2. 애플리케이션 JAR 복사
ARG JAR_FILE=build/libs/*.jar
COPY ${JAR_FILE} app.jar

# 3. 실행 명령어
ENTRYPOINT ["java","-jar","/app.jar"]
