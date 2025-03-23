package com.aioi.drawaing.drawinggameservice.drawing.domain;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
@Document(collection = "keywords")
public class Keyword {
    @Id
    private String id;
    private String keyword;
}
