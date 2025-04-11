package com.aioi.drawaing.drawinggameservice.drawing.infrastructure;

import com.aioi.drawaing.drawinggameservice.drawing.domain.Keyword;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface KeywordRepository extends MongoRepository<Keyword, String> {
}
