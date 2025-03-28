package com.aioi.drawaing.authservice.member.presentaion;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.aioi.drawaing.authservice.member.application.MemberService;
import com.aioi.drawaing.authservice.member.presentation.MemberController;
import com.aioi.drawaing.authservice.member.presentation.request.MemberExpUpdateRequest;
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
public class MemberControllerTest {

    @Mock
    private MemberService memberService;

    @InjectMocks
    private MemberController memberController;

    private MockMvc mockMvc;

    @BeforeEach
    public void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(memberController).build();
    }

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    @DisplayName("성공: 경험치 업데이트")
    void expUpdate_Success() throws Exception {
        // given
        MemberExpUpdateRequest request = new MemberExpUpdateRequest(1L, 100, 50);

        doNothing().when(memberService).expUpdate(any(MemberExpUpdateRequest.class));

        // when
        ResultActions resultActions = mockMvc.perform(patch("/api/v1/member/exp")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)));

        //then
        resultActions.andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("SUCCESS"))
                .andExpect(jsonPath("$.message").value("성공했습니다."))
                .andExpect(jsonPath("$.data").value("경험치, 포인트 저장 완료"));

        //verify
        verify(memberService, times(1)).expUpdate(any(MemberExpUpdateRequest.class));
    }
}
