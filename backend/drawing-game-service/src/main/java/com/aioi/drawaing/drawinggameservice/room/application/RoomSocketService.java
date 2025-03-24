package com.aioi.drawaing.drawinggameservice.room.application;

import com.aioi.drawaing.drawinggameservice.room.domain.Room;
import com.aioi.drawaing.drawinggameservice.room.infrastructure.repository.RoomRepository;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class RoomSocketService {

    private final RoomRepository repository;
    private final SimpMessagingTemplate messagingTemplate;

    public void createRoom(String title, String hostId) {
        Room room = Room.builder()
                .title(title)
                .hostId(hostId)
                .status("Ready")
                .build();
        room.getParticipants().put(hostId, true);
        repository.save(room);

        broadcastRoomState(room);
    }

    public void joinRoom(String roomId, String memberId) {
        Room room = getRoom(roomId);

        validateJoinRoom(room, memberId);// 방 유효성 체크
        room.getParticipants().put(memberId, false);// 사용자를 방에 추가 (초기 준비 상태는 false)
        room.updateHostIfNeeded();// 방장이 없다면 새로운 방장 선정
        repository.save(room);

        broadcastRoomState(room);
    }

    public void startGame(String roomId, String memberId) {
        Room room = getRoom(roomId);

        if (!memberId.equals(room.getHostId())) {
            throw new RuntimeException("방장만 게임을 시작할 수 있습니다.");
        }
        // 모든 참여자가 준비되었는지 확인 (선택적)
        boolean allReady = room.getParticipants().values().stream().allMatch(v -> v);
        if (!allReady) {
            throw new RuntimeException("모든 참여자가 준비되지 않았습니다.");
        }
        // 게임 시작 로직
        messagingTemplate.convertAndSend(
                "/topic/room/" + roomId + "/start",
                Map.of("status", "GAME_STARTED")
        );
    }

    public void toggleReadyStatus(String roomId, String memberId) {
        Room room = getRoom(roomId);

        room.getParticipants().computeIfPresent(memberId, (k, v) -> !v);
        repository.save(room);

        broadcastRoomState(room);
    }

    public void leaveRoom(String roomId, String userId) {
        Room room = getRoom(roomId);
        room.getParticipants().remove(userId); // 사용자를 방에서 제거
        if (room.getParticipants().isEmpty()) { // 방에 남은 사용자가 없으면 방 삭제
            repository.deleteById(roomId);
            return;
        }
        if (userId.equals(room.getHostId())) { // 방장이 나갔다면 새로운 방장 선정
            String newHostId = room.getParticipants().keySet().iterator().next();
            room.updateHostId(newHostId);
        }
        repository.save(room);

        broadcastRoomState(room);
    }

    private void validateJoinRoom(Room room, String memberId) {
        if (room.getParticipants().size() >= 4) {
            throw new RuntimeException("방이 이미 꽉 찼습니다.");
        }
        if (room.getParticipants().containsKey(memberId)) {
            throw new RuntimeException("이미 방에 참여한 사용자입니다.");
        }
    }

    private Room getRoom(String roomId) {
        return repository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("방을 찾을 수 없습니다: " + roomId));
    }

    private void broadcastRoomState(Room room) {
        messagingTemplate.convertAndSend(
                "/topic/room/" + room.getId(),
                room
        );
    }
}
