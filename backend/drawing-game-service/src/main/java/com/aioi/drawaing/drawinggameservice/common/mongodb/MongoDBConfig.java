package com.aioi.drawaing.drawinggameservice.common.mongodb;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.MongoDatabaseFactory;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.SimpleMongoClientDatabaseFactory;

@Configuration
public class MongoDBConfig {

    @Bean
    public MongoDatabaseFactory mongoDatabaseFactory() {
        // MongoDB URL과 데이터베이스 이름 설정
        return new SimpleMongoClientDatabaseFactory("mongodb://localhost:27017/drawing_game");
    }

    @Bean
    public MongoTemplate mongoTemplate(MongoDatabaseFactory mongoDatabaseFactory) {
        // MongoTemplate 빈 등록
        return new MongoTemplate(mongoDatabaseFactory);
    }
}

