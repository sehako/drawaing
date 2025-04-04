FROM openjdk:17-jdk
LABEL maintainer="sehako <dhtpgkr1999@gmail.com>"

ENV SERVICE_NAME=game-service

COPY ./build/libs/drawing-game-service.jar app.jar
ENTRYPOINT ["java", "-jar", "/app.jar"]