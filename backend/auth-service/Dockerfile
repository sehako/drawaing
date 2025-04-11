FROM openjdk:17-jdk
LABEL maintainer="sehako <dhtpgkr1999@gmail.com>"

ENV SERVICE_NAME=auth-service

COPY ./build/libs/auth-service.jar app.jar
ENTRYPOINT ["java", "-jar", "/app.jar"]
