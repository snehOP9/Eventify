FROM maven:3.9.9-eclipse-temurin-21 AS build

WORKDIR /workspace/backend

COPY backend/pom.xml ./
RUN mvn -B -DskipTests dependency:go-offline

COPY backend/src ./src
RUN mvn -B -DskipTests package

FROM eclipse-temurin:21-jre

WORKDIR /app

COPY --from=build /workspace/backend/target/event-platform-*.jar /app/app.jar

EXPOSE 8080

CMD ["sh", "-c", "java -Dserver.port=${PORT:-8080} -jar /app/app.jar"]
