# Drawaing exec 가이드

도커 컴포즈 환경과 JDK17 환경으로 배포하였습니다. 

원할한 실행을 위한 도커 컴포즈 설정 정보를 드립니다.

## 컴포즈 설정 정보

```yaml
networks:
  compose-network:
    driver: bridge

volumes:
  mysql_data:
  mongo_data:
  grafana_data:
  prometheus_data:
  docker_data:
  loki_data:
  kafka_data:
  
services:
  nginx:
    container_name: nginx
    image: nginx:stable-perl
    ports:
      - 80:80
      - 443:443
    volumes:
      - ./settings/nginx/nginx.conf:/etc/nginx/nginx.conf
      - /etc/letsencrypt/live/www.drawaing.site/fullchain.pem:/etc/nginx/ssl/fullchain.pem:ro
      - /etc/letsencrypt/live/www.drawaing.site/privkey.pem:/etc/nginx/ssl/privkey.pem:ro
      - ./dist:/usr/share/nginx/html
    environment:
      - TZ=Asia/Seoul
    restart: always
    networks:
      - compose-network

  mysql:
    container_name: mysql
    image: mysql:latest
    environment:
      MYSQL_ROOT_PASSWORD: "dhrlack990298"
      TZ: Asia/Seoul
    volumes:
      - mysql_data:/var/lib/mysql
    ports:
      - 3306:3306
    healthcheck:
      test: ['CMD', 'mysqladmin', 'ping', '-h', 'localhost', '-u', 'root', '-proot']
      interval: 5s
      timeout: 10s
      retries: 5
    networks:
      - compose-network

  mongo:
    container_name: mongo
    image: mongodb/mongodb-community-server:latest
    environment:
      MONGODB_INITDB_ROOT_USERNAME: gkrdh99  
      MONGODB_INITDB_ROOT_PASSWORD: "dhrlack990298"
      TZ: Asia/Seoul
    volumes:
      - mongo_data:/data/db
    ports:
      - 27017:27017
        #- 27017:27017
    healthcheck:
      test: mongosh --eval 'db.runCommand("ping").ok' --quiet
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 10s
    networks:
      - compose-network

  redis:
    container_name: redis
    image: redis:latest
    ports:
      - 6379:6379
    command: redis-server --requirepass ckwjdans9*
    networks:
      - compose-network

  spring-eureka:
    container_name: spring-eureka
    build:
      context: ./backend
      dockerfile: Dockerfile
      args:
        SERVICE_NAME: eureka
        JAR_FILE: eureka.jar
    environment:
      - TZ=Asia/Seoul
    ports:
      - "8761:8761"
    restart: always  
    healthcheck:
      test: "curl --fail --silent 127.0.0.1:8761/actuator/health | grep UP || exit 1"
      interval: 20s
      timeout: 5s
      retries: 5
      start_period: 40s
    depends_on:
      mysql:
        condition: service_healthy
      mongo:
        condition: service_healthy
    networks:
      - compose-network

  spring-config:
    container_name: config-server
    build:
      context: ./backend
      dockerfile: Dockerfile
      args:
        SERVICE_NAME: config
        JAR_FILE: config.jar
    environment:
      - TZ=Asia/Seoul
    ports:
      - "127.0.0.1:8888:8888"
    env_file:
      - ./settings/.env.config-server
    restart: always
    networks:
      - compose-network

  spring-gateway:
    container_name: spring-gateway
    build:
      context: ./backend
      dockerfile: Dockerfile
      args:
        SERVICE_NAME: gateway
        JAR_FILE: gateway.jar
    environment:
      - TZ=Asia/Seoul
    env_file:
      - ./settings/.env.service-common
    ports:
      - "8080:8080"
    restart: always
    depends_on:
      spring-eureka:
        condition: service_healthy
    networks:
      - compose-network

  spring-auth:
    container_name: spring-auth
    build:
      context: ./backend
      dockerfile: Dockerfile
      args:
        SERVICE_NAME: auth-service
        JAR_FILE: auth-service.jar
    environment:
      - TZ=Asia/Seoul
    env_file:
      - ./settings/.env.service-common
    restart: always 
    depends_on:
      spring-eureka:
        condition: service_healthy
    networks:
      - compose-network

  spring-auth:
    container_name: spring-auth
    build:
      context: ./backend
      dockerfile: Dockerfile
      args:
        SERVICE_NAME: shop-service
        JAR_FILE: shop-service.jar
    environment:
      - TZ=Asia/Seoul
    env_file:
      - ./settings/.env.service-common
    restart: always 
    depends_on:
      spring-eureka:
        condition: service_healthy
    networks:
      - compose-network

  spring-game:
    container_name: spring-game
    build:
      context: ./backend
      dockerfile: Dockerfile
      args:
        SERVICE_NAME: game-service
        JAR_FILE: drawing-game-service.jar
    environment:
      - TZ=Asia/Seoul
      - SERVER_PORT=8081
    env_file:
      - ./settings/.env.service-common
    ports:
      - "8081:8081"
    restart: always
    depends_on:
      spring-eureka:
        condition: service_healthy
    networks:
      - compose-network

  spring-game-test:
    container_name: spring-game-test
    build:
      context: ./backend
      dockerfile: Dockerfile
      args:
        SERVICE_NAME: test-service
        JAR_FILE: drawing-game-service.jar
    environment:
      - TZ=Asia/Seoul
      - SERVER_PORT=8085
    env_file:
      - ./settings/.env.service-common
    ports:
      - "8085:8085"
    restart: always
    depends_on:
      spring-eureka:
        condition: service_healthy
    deploy:
      resources:
        limits:
          memory: "512M"
    networks:
      - compose-network

  rabbitmq:
    image: rabbitmq:3-management
    container_name: rabbitmq
    ports:
      - "5672:5672"
      - "15672:15672"
    environment:
      RABBITMQ_ERLANG_COOKIE: "Spring-MQ"
      RABBITMQ_DEFAULT_USER: "gkrdh99"
      RABBITMQ_DEFAULT_PASS: "aioi"
    healthcheck:
      test: [ "CMD", "rabbitmq-diagnostics", "ping" ]
      interval: 10s
      timeout: 5s
      retries: 10
    networks:
      - compose-network

  grafana:
    container_name: grafana
    image: grafana/grafana:latest
    environment:
      - TZ=Asia/Seoul
      - GF_SERVER_ROOT_URL=http://localhost/grafana
      - GF_SERVER_SERVE_FROM_SUB_PATH=true
    ports:
      - 3000:3000
    volumes:
      - grafana_data:/var/lib/grafana
    networks:
      - compose-network

  prometheus:
    container_name: prometheus
    image: bitnami/prometheus:latest
    environment:
      - TZ=Asia/Seoul
    volumes:
      - ./settings/prometheus/prometheus.yml:/opt/bitnami/prometheus/conf/prometheus.yml
      - prometheus_data:/opt/bitnami/prometheus/data
    ports:
      - 9090:9090
    networks:
      - compose-network

  loki:
    container_name: loki
    image: grafana/loki:latest
    ports:
      - 3100:3100
    environment:
      - TZ=Asia/Seoul
    volumes:
      - loki_data:/loki
      - ./settings/loki/local-config.yaml:/etc/loki/local-config.yaml
    command: -config.file=/etc/loki/local-config.yaml
    networks:
      - compose-network

  promtail:
    container_name: promtail
    image: grafana/promtail:latest
    environment:
      - TZ=Asia/Seoul
    volumes:
      - ./settings/promtail/config.yml:/etc/promtail/config.yml
      # EC2에 띄울 때 필요
      - /var/lib/docker/containers:/var/lib/docker/containers:ro
      - /var/run/docker.sock:/var/run/docker.sock
    command: -config.file=/etc/promtail/config.yml
    networks:
      - compose-network
  kafka:
    container_name: kafka
    image: bitnami/kafka:latest
    ports:
      - "9092:9092"
      - "9094:9094"
    environment:
      KAFKA_ALLOW_PLAINTEXT_LISTENER: "yes"
      # KRaft 모드에서 동작하도록 설정
      KAFKA_PROCESS_ROLES: "broker,controller"
      KAFKA_NODE_ID: 1
      KAFKA_LISTENERS: PLAINTEXT://:9092,CONTROLLER://:9093,EXTERNAL://:9094
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://kafka:9092,EXTERNAL://localhost:9094
      KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: CONTROLLER:PLAINTEXT,EXTERNAL:PLAINTEXT,PLAINTEXT:PLAINTEXT
      KAFKA_CONTROLLER_QUORUM_VOTERS: "1@kafka:9093"
      # ✅ 컨트롤러 리스너 이름을 명확하게 지정
      KAFKA_CONTROLLER_LISTENER_NAMES: "CONTROLLER"
      KAFKA_CFG_CONTROLLER_LISTENER_NAMES: "CONTROLLER"
      KAFKA_INTER_BROKER_LISTENER_NAME: "PLAINTEXT"
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
    volumes:
      - kafka_data:/var/lib/kafka/data
      - /var/run/docker.sock:/var/run/docker.sock
    networks:
      - compose-network

  kafka-connect:
    container_name: kafka-connect
    image: confluentinc/cp-kafka-connect:latest
    ports:
      - "8083:8083"
    environment:
      CONNECT_BOOTSTRAP_SERVERS: kafka00:9092,kafka01:9092,kafka02:9092
      CONNECT_REST_PORT: 8083
      CONNECT_GROUP_ID: "quickstart-avro"
      CONNECT_CONFIG_STORAGE_TOPIC: "quickstart-avro-config"
      CONNECT_OFFSET_STORAGE_TOPIC: "quickstart-avro-offsets"
      CONNECT_STATUS_STORAGE_TOPIC: "quickstart-avro-status"
      CONNECT_CONFIG_STORAGE_REPLICATION_FACTOR: 3
      CONNECT_OFFSET_STORAGE_REPLICATION_FACTOR: 3
      CONNECT_STATUS_STORAGE_REPLICATION_FACTOR: 3
      CONNECT_KEY_CONVERTER: "org.apache.kafka.connect.json.JsonConverter"
      CONNECT_VALUE_CONVERTER: "org.apache.kafka.connect.json.JsonConverter"
      CONNECT_INTERNAL_KEY_CONVERTER: "org.apache.kafka.connect.json.JsonConverter"
      CONNECT_INTERNAL_VALUE_CONVERTER: "org.apache.kafka.connect.json.JsonConverter"
      CONNECT_REST_ADVERTISED_HOST_NAME: "kafka"
      CONNECT_LOG4J_ROOT_LOGLEVEL: WARN
      CONNECT_PLUGIN_PATH: "/usr/share/java,/etc/kafka-connect/jars"
    volumes:
      - ./settings/kafka-connect/plugin:/etc/kafka-connect/jars
    networks:
      - compose-network
      
  kafka-ui:
    container_name: kafka-ui
    image: provectuslabs/kafka-ui:latest
    restart: unless-stopped
    ports:
      - "9000:8080"
    environment:
      - KAFKA_CLUSTERS_0_NAME=Local-Kraft-Cluster
      - KAFKA_CLUSTERS_0_BOOTSTRAPSERVERS=kafka00:9092,kafka01:9092,kafka02:9092
      - KAFKA_CLUSTERS_0_KAFKACONNECT_0_NAME=connect
      - KAFKA_CLUSTERS_0_KAFKACONNECT_0_ADDRESS=http://kafka-connect:8083
      - DYNAMIC_CONFIG_ENABLED=true
      - KAFKA_CLUSTERS_0_AUDIT_TOPICAUDITENABLED=true
      - KAFKA_CLUSTERS_0_AUDIT_CONSOLEAUDITENABLED=true
    networks:
      - compose-network
```

## 스프링 부트 설정 정보

각 마이크로 서비스는 다음 설정을 공유합니다. 참고로 앞으로 명시하는 모든 설정 정보는 도커 컴포즈가 작성된 yaml 파일의 디렉터리 기준입니다 `./`의 디렉터리 구조는 대략 다음과 같습니다.

```
C:.
├─backend
├─dist
│  ├─assets
│  ├─images
│  └─Music
└─settings
    ├─kafka-connect
    │  └─plugin
    ├─loki
    │  └─loki-config.yaml
    ├─nginx
    ├─prometheus
    └─promtail
```

**./settings/.env.config-server**
```
RABBIT_MQ_URL=sehako.store
# RABBIT_MQ_URL=rabbitmq
RABBIT_MQ_PORT=5672
RABBIT_MQ_USERNAME=gkrdh99
RABBIT_MQ_PASSWORD=aioi
GITHUB_CONFIG_REPOSITORY=https://github.com/sehako/drawaing-config.git
GITHUB_USERNAME=sehako
GITHUB_SECRET=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
```

**./settings/.env.service-common**

```
EUREKA_URL=http://spring-eureka:8761
RABBIT_MQ_URL=sehako.store
# RABBIT_MQ_URL=rabbitmq
RABBIT_MQ_PORT=5672
RABBIT_MQ_USERNAME=gkrdh99
RABBIT_MQ_PASSWORD=aioi
CONFIG_SERVER_URL=http://spring-config:8888
```


## 백엔드

각 서비스 별로 bd/deploy/{SERVICE_NAME} 브랜치가 배포하는 브랜치이며, 이때 be/deploy/shop은 빌드 후 jar 파일을 shop-service.jar로 변경하여야 합니다. 

be/deploy/shop, be/deploy/auth, be/deploy/drawing-game은 다음 application.yml 파일을 프로젝트루트 디렉터리 기준으로 src/main/resources에 생성해야 합니다.

```yaml
server:
  port: "${SERVER_PORT:0}"

eureka:
  client:
    register-with-eureka: true
    fetch-registry: true
    service-url:
      defaultZone: "${EUREKA_URL:http://127.0.0.1:8761}/eureka"
  instance:
    instance-id: ${spring.application.name}:${random.value}

spring:
  application:
    name: ${SERVICE_NAME}
  rabbitmq:
    host: "${RABBIT_MQ_URL:127.0.0.1}"
    port: ${RABBIT_MQ_PORT}
    username: ${RABBIT_MQ_USERNAME}
    password: ${RABBIT_MQ_PASSWORD}
  cloud:
    bus:
      destination: spring-cloud-bus
  config:
    import: "optional:configserver:${CONFIG_SERVER_URL:http://127.0.0.1:8888}"
    
management:
  endpoints:
    web:
      exposure:
        include: busrefresh, info, metrics, prometheus
```

각 빌드한 jar 파일은 모두 컴포즈 파일이 존재하는 폴더를 기준으로 ./backend/ 디렉터리에 있어야 하며, 해당 디렉터리에는 다음과 같은 도커 파일이 존재합니다.

```Dockerfile
FROM openjdk:17-jdk

LABEL maintainer="sehako <dhtpgkr1999@gmail.com>"

ARG SERVICE_NAME

ARG JAR_FILE

ENV SERVICE_NAME=$SERVICE_NAME

COPY ./$JAR_FILE app.jar

ENTRYPOINT ["java", "-jar", "/app.jar"]
```

해당 도커 파일에 전달된 인자를 통하여 컴포즈 파일이 서비스를 실행시키는 구조입니다.

## 프론트엔드

프론트엔드는 fe/deploy 브랜치를 pull 받으시고 다음 명령어를 순차적으로 입력하면 됩니다.

```
npm install i
```

```
npm run build
```

그 다음 도커 컴포즈 파일이 존재하는 디렉터리에 첨부하시면 됩니다.

## 인프라

인프라는 nginx 설정과 프로메테우스, 로키 설정을 다음과 같이 작성하시면 됩니다.

**./settings/nginx/nginx.conf**

```
user  nginx;
worker_processes  auto;

error_log  /var/log/nginx/error.log debug;
pid        /var/run/nginx.pid;


events {
    worker_connections  1024;
}


http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;
    client_max_body_size 50M;

    log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
                      '$status $body_bytes_sent "$http_referer" '
                      '"$http_user_agent" "$http_x_forwarded_for"';

    access_log  /var/log/nginx/access.log  main;

    sendfile        on;
    #tcp_nopush     on;

    keepalive_timeout  65;

    #gzip  on;

    # conf에서 모든 것을 정의하면 필요가 없음
    # include /etc/nginx/conf.d/*.conf;

    map $http_upgrade $connection_upgrade {
        default upgrade;
        ''      close;
    }

    map $http_origin $allowed_origin {
        default "";
        "http://localhost:5173" $http_origin;
        "http://localhost:5500" $http_origin;
        "https://www.drawaing.site" $http_origin;
    }

    ssl_certificate /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;

    server {
        listen 80 default_server;
        listen [::]:80 default_server;
        server_name www.drawaing.site;
        # 모든 HTTP 요청을 HTTPS로 리디렉트
        return 301 https://$host$request_uri;
    }

    server {
        listen 443 ssl;
        listen [::]:443 ssl;
        server_name www.drawaing.site;

        location /service/actuator/busrefresh {
	        allow 127.0.0.1;
	        deny all;
            proxy_pass http://spring-gateway:8080/actuator/busrefresh;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_redirect off;
        }

        location /service/actuator/ {
            rewrite ^/service/(.*) /$1 break;
            allow 127.0.0.1;
            allow 172.17.0.0/16;
            deny all;
            proxy_pass http://spring-gateway:8080/;
        }

        location /service/auth/actuator/ {
            rewrite ^/service/(.*) /$1 break;
            allow 127.0.0.1;
            allow 172.17.0.0/16;
            deny all;
            proxy_pass http://spring-gateway:8080/;
        }

        location /service/game/ {
	    if ($request_method = 'OPTIONS') {
 	    add_header 'Access-Control-Allow-Origin' "$allowed_origin" always;
	    add_header 'Access-Control-Allow-Credentials' 'true' always;
    	    add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
	    add_header 'Access-Control-Allow-Headers' 'Origin, Content-Type, Accept, Authorization' always;
	    add_header 'Access-Control-Max-Age' 1728000;
    	    add_header 'Content-Type' 'text/plain charset=UTF-8';
    	    add_header 'Content-Length' 0;
    	    return 204;
	    }
            rewrite ^/service/game/(.*) /$1 break;
            proxy_pass http://spring-game:8081/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_redirect off;

            # 3. WebSocket 지원
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "Upgrade";
            proxy_read_timeout 3600;
            proxy_send_timeout 3600;

# 응답에 CORS 헤더 포함
    add_header 'Access-Control-Allow-Origin' "$allowed_origin" always;
    add_header 'Access-Control-Allow-Credentials' 'true' always;
    add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
    add_header 'Access-Control-Allow-Headers' 'Origin, Content-Type, Accept, Authorization' always;
        }
    

        location /service/ {
            rewrite ^/service/(.*) /$1 break;
            proxy_pass http://spring-gateway:8080/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_redirect off;
        }

        location /grafana/ {
       	    proxy_pass http://grafana:3000;
	        proxy_set_header Host $host;
        }

	    # Proxy Grafana Live WebSocket connections.
      	location /grafana/api/live/ {
            proxy_pass http://grafana:3000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection $connection_upgrade;
            proxy_set_header Host $host;
        }

        location / {
            root /usr/share/nginx/html;
            index index.html;
            error_page 404 /index.html;
            error_page 403 /index.html;
        }
    }
}
```

**./settings/prometheus/prometheus.yml**

```
# my global config
global:
  scrape_interval: 15s # Set the scrape interval to every 15 seconds. Default is every 1 minute.
  evaluation_interval: 15s # Evaluate rules every 15 seconds. The default is every 1 minute.
  # scrape_timeout is set to the global default (10s).

# Alertmanager configuration
alerting:
  alertmanagers:
    - static_configs:
        - targets:
          # - alertmanager:9093

# Load rules once and periodically evaluate them according to the global 'evaluation_interval'.
rule_files:
  # - "first_rules.yml"
  # - "second_rules.yml"

# A scrape configuration containing exactly one endpoint to scrape:
# Here it's Prometheus itself.
scrape_configs:
  # The job name is added as a label `job=<job_name>` to any timeseries scraped from this config.
  - job_name: "prometheus"

    # metrics_path defaults to '/metrics'
    # scheme defaults to 'http'.

    static_configs:
      - targets: ["localhost:9090"]
  - job_name: "gateway-service"
    scrape_interval: 30s
    metrics_path: '/actuator/prometheus'
    static_configs:
    - targets: ["spring-gateway:8080"]

  - job_name: "auth-service"
    scrape_interval: 30s
    metrics_path: '/auth/actuator/prometheus'
    static_configs:
    - targets: ["spring-gateway:8080"]

  - job_name: "game-service"
    scrape_interval: 15s
    metrics_path: '/game/actuator/prometheus'
    static_configs:
    - targets: ["spring-gateway:8080"]
```

**./settings/promtail/config.yml**

```
server:
  http_listen_port: 9080
  grpc_listen_port: 0

positions:
  filename: /tmp/positions.yaml

clients:
  - url: http://loki:3100/loki/api/v1/push

scrape_configs:
  - job_name: springboot-docker-logs
    docker_sd_configs:
      - host: unix:///var/run/docker.sock
        refresh_interval: 10s

    relabel_configs:
      # 1. spring- 접두사 붙은 컨테이너만 수집
      - source_labels: [__meta_docker_container_name]
        regex: .*spring.*
        action: keep

      # 2. 컨테이너 이름을 라벨로
      - source_labels: [__meta_docker_container_name]
        target_label: container

      # 3. 로그 파일 경로 지정
      - source_labels: [__meta_docker_container_log_path]
        target_label: __path__

  # nginx 로그 스크레이퍼
  - job_name: nginx-docker-logs
    docker_sd_configs:
      - host: unix:///var/run/docker.sock
        refresh_interval: 1s
    relabel_configs:
      - source_labels: [__meta_docker_container_name]
        regex: .*nginx.*
        action: keep
      - source_labels: [__meta_docker_container_name]
        target_label: container
      - source_labels: [__meta_docker_container_log_path]
        target_label: __path__
```

**./settings/loki/local-config.yaml**

```
auth_enabled: false

server:
  http_listen_port: 3100

common:
  instance_addr: 127.0.0.1
  path_prefix: /loki
  storage:
    filesystem:
      chunks_directory: /loki/chunks
      rules_directory: /loki/rules
  replication_factor: 1
  ring:
    kvstore:
      store: inmemory

schema_config:
  configs:
    - from: 2020-10-24
      store: tsdb
      object_store: filesystem
      schema: v13
      index:
        prefix: index_
        period: 24h

ruler:
  alertmanager_url: http://localhost:9093

# By default, Loki will send anonymous, but uniquely-identifiable usage and configuration
# analytics to Grafana Labs. These statistics are sent to https://stats.grafana.org/
#
# Statistics help us better understand how Loki is used, and they show us performance
# levels for most users. This helps us prioritize features and documentation.
# For more information on what's sent, look at
# https://github.com/grafana/loki/blob/main/pkg/usagestats/stats.go
# Refer to the buildReport method to see what goes into a report.
#
# If you would like to disable reporting, uncomment the following lines:
#analytics:
#  reporting_enabled: false
```
