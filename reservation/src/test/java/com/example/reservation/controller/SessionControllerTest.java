package com.example.reservation.controller;

import com.example.reservation.service.SessionService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(SessionController.class)
public class SessionControllerTest {

    @Autowired private MockMvc mockMvc;

    @MockBean private SessionService sessionService;

    @Test
    void getSessions_returnsList() throws Exception {
        when(sessionService.getActiveSessions()).thenReturn(List.of("SESSION1", "SESSION2"));

        mockMvc.perform(get("/api/sessions/list"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0]").value("SESSION1"))
                .andExpect(jsonPath("$[1]").value("SESSION2"));
    }
}