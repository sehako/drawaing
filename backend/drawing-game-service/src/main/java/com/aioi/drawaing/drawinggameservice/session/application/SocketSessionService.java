package com.aioi.drawaing.drawinggameservice.session.application;

import com.aioi.drawaing.drawinggameservice.session.domain.SocketSession;
import com.aioi.drawaing.drawinggameservice.session.infrastructure.SocketSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class SocketSessionService {
    private final SocketSessionRepository socketSessionRepository;

    public void save(String memberId, String socketSessionId) {
        socketSessionRepository.save(SocketSession.create(memberId, socketSessionId));
    }
}
