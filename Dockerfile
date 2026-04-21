FROM maven:3.9.9-eclipse-temurin-21 AS build

WORKDIR /workspace/backend

# Keep Maven build memory within typical cloud build container limits.
ENV MAVEN_OPTS="-Xmx384m -XX:MaxMetaspaceSize=192m"

COPY backend/pom.xml ./
RUN mvn -B -DskipTests dependency:go-offline

COPY backend/src ./src
RUN mvn -B -DskipTests package

FROM eclipse-temurin:21-jre

WORKDIR /app

# Keep runtime JVM memory under small cloud plan limits.
ENV JAVA_TOOL_OPTIONS="-XX:MaxRAMPercentage=60 -XX:InitialRAMPercentage=20 -XX:MaxMetaspaceSize=192m -XX:MaxDirectMemorySize=64m -XX:+UseSerialGC -XX:+ExitOnOutOfMemoryError"

COPY --from=build /workspace/backend/target/event-platform-*.jar /app/app.jar

EXPOSE 8080

CMD ["sh", "-c", "java -Dserver.port=${PORT:-8080} -jar /app/app.jar"]
