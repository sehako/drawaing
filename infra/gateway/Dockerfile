FROM openjdk:17-jdk

LABEL maintainer="sehako <dhtpgkr1999@gmail.com>"

COPY ./build/libs/gateway.jar app.jar

ENTRYPOINT ["java", "-jar", "/app.jar"]