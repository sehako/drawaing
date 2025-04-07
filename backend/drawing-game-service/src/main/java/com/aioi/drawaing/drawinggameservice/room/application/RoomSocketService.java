package com.aioi.drawaing.drawinggameservice.room.application;

import com.aioi.drawaing.drawinggameservice.drawing.application.DrawingService;
import com.aioi.drawaing.drawinggameservice.drawing.domain.Session;
import com.aioi.drawaing.drawinggameservice.room.application.dto.AddRoomParticipantInfo;
import com.aioi.drawaing.drawinggameservice.room.application.dto.RoomStartInfo;
import com.aioi.drawaing.drawinggameservice.room.domain.Room;
import com.aioi.drawaing.drawinggameservice.room.domain.RoomParticipant;
import com.aioi.drawaing.drawinggameservice.room.infrastructure.repository.RoomRepository;

import java.time.LocalDateTime;
import java.util.Objects;

import com.aioi.drawaing.drawinggameservice.room.presentation.RoomMessagePublisher;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class RoomSocketService {

    private final RoomRepository repository;
    private final DrawingService drawingService;
    private final RoomMessagePublisher roomMessagePublisher;

//    public void createRoom(String title, Long hostId) {
//        Room room = Room.builder()
//                .title(title)
//                .hostId(hostId)
//                .status("Ready")
//                .build();
//        room.getParticipants().put(hostId, true);
//        repository.save(room);
//
//        broadcastRoomState(room);
//    }

    public void joinRoom(String roomId, AddRoomParticipantInfo addRoomParticipantInfo) {
        Room room = getRoom(roomId);

        validateJoinRoom(room, addRoomParticipantInfo.memberId());// 방 유효성 체크

//        System.out.println(addRoomParticipantInfo.memberId());

        room.addParticipant(addRoomParticipantInfo);// 사용자를 방에 추가 (초기 준비 상태는 false)
        room.updateHostIfNeeded();// 방장이 없다면 새로운 방장 선정
        repository.save(room);

        roomMessagePublisher.publishRoomState(room);
    }

    public void startGame(String roomId, Long memberId) {
        Room room = getRoom(roomId);

        if (!memberId.equals(room.getHostId())) {
            log.error("방장만 게임을 시작할 수 있습니다.");
            throw new RuntimeException("방장만 게임을 시작할 수 있습니다.");
        }
        // 모든 참여자가 준비되었는지 확인 (선택적)
        boolean allReady = room.getParticipants().values().stream().allMatch(RoomParticipant::isReady);
        if (!allReady) {
            log.error("모든 참여자가 준비되지 않았습니다.");
            throw new RuntimeException("모든 참여자가 준비되지 않았습니다.");
        }


        //게임 대기방에서 실제 게임으로 넘어가는 중간 대기 시간을 처리하는 함수
        transitionToGame(roomId, room);
    }

    public void toggleReadyStatus(String roomId, Long memberId) {
        Room room = getRoom(roomId);

        room.updateParticipantReady(memberId);
        repository.save(room);

        roomMessagePublisher.publishRoomState(room);
    }

    public void leaveRoom(String roomId, Long userId) {
        Room room = getRoom(roomId);
        room.getParticipants().remove(userId); // 사용자를 방에서 제거
        if (room.getParticipants().isEmpty()) { // 방에 남은 사용자가 없으면 방 삭제
            repository.deleteById(roomId);
            return;
        }
        if (Objects.equals(userId, room.getHostId())) { // 방장이 나갔다면 새로운 방장 선정
            Long newHostId = room.getParticipants().keySet().iterator().next();
            room.updateHostId(newHostId);
        }
        repository.save(room);

        roomMessagePublisher.publishRoomState(room);
    }

    public void transitionToGame(String roomId, Room room) {
        roomMessagePublisher.publishRoomStart("/topic/room.wait/"+roomId, new RoomStartInfo(LocalDateTime.now().plusSeconds(5)));

        Session session = drawingService.createSession(roomId);

        // 게임 시작 로직
        scheduleGameStart(roomId, room.getSessionId(), room);
//        drawingService.startSession(roomId, room.getSessionId(), room.getAddRoomParticipantInfos());

        room.updateSessionId(session.getId());
        room.deleteParticipants();
        repository.save(room);
    }

    private void scheduleGameStart(String roomId, String sessionId, Room room) {
        ScheduledExecutorService scheduler = Executors.newSingleThreadScheduledExecutor();
        scheduler.schedule(() -> {
            drawingService.startSession(roomId, sessionId, room.getAddRoomParticipantInfos());
        }, 5, TimeUnit.SECONDS);
    }

    private void validateJoinRoom(Room room, Long memberId) {
        if (room.getParticipants().size() >= 4) {
            log.error("방이 이미 꽉 찼습니다.");
            throw new RuntimeException("방이 이미 꽉 찼습니다.");
        }
        if (room.getParticipants().containsKey(memberId)) {
            log.error("이미 방에 참여한 사용자입니다.");
            throw new RuntimeException("이미 방에 참여한 사용자입니다.");
        }
    }

    private Room getRoom(String roomId) {
        return repository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("방을 찾을 수 없습니다: " + roomId));
    }
}
