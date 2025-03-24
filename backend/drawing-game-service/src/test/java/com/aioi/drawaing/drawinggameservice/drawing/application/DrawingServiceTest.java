package com.aioi.drawaing.drawinggameservice.drawing.application;


import com.aioi.drawaing.drawinggameservice.drawing.domain.Keyword;
import com.aioi.drawaing.drawinggameservice.drawing.domain.Session;
import com.aioi.drawaing.drawinggameservice.drawing.infrastructure.KeywordRepository;
import com.aioi.drawaing.drawinggameservice.drawing.infrastructure.SessionRepository;
import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;

import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class DrawingServiceTest {

    @Mock
    private KeywordRepository keywordRepository;

    @InjectMocks
    private DrawingService drawingService;

    @BeforeEach
    void setUp() {
        List<Keyword> keywords = new ArrayList<>();
        keywords.add(Keyword.builder().keyword("바나나").build());
        keywords.add(Keyword.builder().keyword("사과").build());
        keywords.add(Keyword.builder().keyword("수박").build());
        keywords.add(Keyword.builder().keyword("감자").build());
        keywords.add(Keyword.builder().keyword("루피").build());
        keywords.add(Keyword.builder().keyword("폼폼푸린").build());
        keywords.add(Keyword.builder().keyword("컴퓨터").build());
        keywords.add(Keyword.builder().keyword("노트북").build());
        keywords.add(Keyword.builder().keyword("싸피").build());
        keywords.add(Keyword.builder().keyword("알파카파카파카파카").build());

        when(keywordRepository.findAll()).thenReturn(keywords);
    }

    @Test
    @DisplayName("게임 제시어를 정해진 개수만큼 리스트로 뽑는다.")
    public void 제시어_뽑기_개수에_맞게_뽑는지_성공_유무(){
        //given
        int count = 3;

        //when
        List<String> words = drawingService.extractWords(count);

        //then
        Assertions.assertThat(words)
                .describedAs("words: %s", words)
                .hasSize(count);
    }

    @Test
    @DisplayName("랜덤으로 게임 제시어를 정해진 개수만큼 리스트로 뽑는지 확인한다.")
    public void 제시어_뽑기가_랜덤으로_뽑는지_성공_유무(){
        //given
        int count = 3;

        //when
        List<String> words1 = drawingService.extractWords(count);
        List<String> words2 = drawingService.extractWords(count);

        //then
        Assertions.assertThat(words1)
                .describedAs("words1: %s, words2: %s", words1, words2)
                .isNotEqualTo(words2);
    }

}
