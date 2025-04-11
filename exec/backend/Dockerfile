FROM openjdk:17-jdk

LABEL maintainer="sehako <dhtpgkr1999@gmail.com>"

ARG SERVICE_NAME

ARG JAR_FILE

ENV SERVICE_NAME=$SERVICE_NAME

COPY ./$JAR_FILE app.jar

ENTRYPOINT ["java", "-jar", "/app.jar"]