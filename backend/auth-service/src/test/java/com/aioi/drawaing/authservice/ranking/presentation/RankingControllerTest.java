package com.aioi.drawaing.authservice.ranking.presentation;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doReturn;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.aioi.drawaing.authservice.ranking.application.RankingService;
import com.aioi.drawaing.authservice.ranking.presentation.request.GameResultRequest;
import com.aioi.drawaing.authservice.ranking.presentation.response.GameRecordResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
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
    void updateRecords_Success() throws Exception {
        // given
        Long memberId = 1L;
        List<GameResultRequest> requests = List.of(
                new GameResultRequest(memberId, "WIN", 100),
                new GameResultRequest(memberId, "WIN", 50)
        );

        List<GameRecordResponse> mockResponses = List.of(
                GameRecordResponse.builder().win(1).maximumScore(100).rankScore(100).build(),
                GameRecordResponse.builder().win(2).maximumScore(150).rankScore(150).build()
        );

        doReturn(mockResponses).when(rankingService).updateGameRecords(any(List.class));

        // when
        ResultActions resultActions = mockMvc.perform(patch("/api/v1/ranking")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requests)));

        // then
        resultActions.andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("SUCCESS"))
                .andExpect(jsonPath("$.message").value("성공했습니다."))
                .andExpect(jsonPath("$.data").value("랭킹 점수 업데이트 완료"));
    }

}

