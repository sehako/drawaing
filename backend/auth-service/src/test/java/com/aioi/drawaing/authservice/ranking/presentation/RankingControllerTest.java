package com.aioi.drawaing.authservice.ranking.presentation;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doReturn;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.aioi.drawaing.authservice.ranking.application.RankingService;
import com.aioi.drawaing.authservice.ranking.domain.DrawingGameRecord;
import com.aioi.drawaing.authservice.ranking.presentation.request.GameResultRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

@ExtendWith(MockitoExtension.class)
class RankingControllerTest {

    @Mock
    private RankingService rankingService;

    @InjectMocks
    private RankingController rankingController;

    private MockMvc mockMvc;

    @BeforeEach
    public void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(rankingController).build();
    }

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    @DisplayName("성공: 게임 결과 업데이트")
    void updateRecord_Success() throws Exception {
        // given
        Long memberId = 1L;
        GameResultRequest request = new GameResultRequest(memberId, RankingController.GameStatus.WIN, 100);
        DrawingGameRecord mockRecord = DrawingGameRecord.builder()
                .id(memberId)
                .win(1)
                .rankScore(100)
                .build();

        doReturn(mockRecord).when(rankingService).updateGameRecord(any(GameResultRequest.class));

        //when
        ResultActions resultActions = mockMvc.perform(patch("/api/v1/ranking")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)));

        // then
        resultActions.andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("SUCCESS"))
                .andExpect(jsonPath("$.message").value("성공했습니다."))
                .andExpect(jsonPath("$.data.id").value(memberId))
                .andExpect(jsonPath("$.data.win").value(1))
                .andExpect(jsonPath("$.data.rankScore").value(100));
    }

}

