package com.aioi.drawaing.gateway.loadbalancer;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.client.ServiceInstance;
import org.springframework.cloud.client.loadbalancer.DefaultRequest;
import org.springframework.cloud.client.loadbalancer.DefaultResponse;
import org.springframework.cloud.client.loadbalancer.Request;
import org.springframework.cloud.client.loadbalancer.RequestDataContext;
import org.springframework.cloud.client.loadbalancer.Response;
import org.springframework.cloud.loadbalancer.core.ReactorServiceInstanceLoadBalancer;
import org.springframework.cloud.loadbalancer.core.ServiceInstanceListSupplier;
import org.springframework.util.StringUtils;
import reactor.core.publisher.Mono;

@Slf4j
@RequiredArgsConstructor
public class HashingLoadBalancer implements ReactorServiceInstanceLoadBalancer {
    // 등록된 마이크로 서비스를 제공하는 객체
    private final ServiceInstanceListSupplier serviceInstanceListSupplier;

    @Override
    public Mono<Response<ServiceInstance>> choose(Request request) {
        return serviceInstanceListSupplier.get(request).next()
                .map(instances -> {
                    log.info("instance size: {}", instances.size());
                    if (instances.isEmpty()) {
                        return new DefaultResponse(null);
                    }
                    // Hash key 가져오기
                    String roomId = extractRoomIdFromHeader(request);

                    log.info("ROOM ID: {}", roomId);
                    if (!StringUtils.hasText(roomId)) {
                        log.warn("ROOM ID NOT PROVIDED GET ROUND ROBIN");
                        int idx = (int) (Math.random() * instances.size());
                        return new DefaultResponse(instances.get(idx));
                    }

                    int hash = hash(roomId);
                    int safeHash = hash & Integer.MAX_VALUE;
                    int index = safeHash % instances.size();
                    ServiceInstance instance = instances.get(index);

                    log.info("ConsistentHashingLoadBalancer selected instance: {}", instance.getUri());
                    return new DefaultResponse(instance);
                });
    }

    // 해싱 함수 MDS 방식으로 해싱
    private int hash(String key) {
        try {
            MessageDigest md = MessageDigest.getInstance("MD5");
            byte[] digest = md.digest(key.getBytes(StandardCharsets.UTF_8));
            return ((digest[0] & 0xFF) << 24) | ((digest[1] & 0xFF) << 16) | ((digest[2] & 0xFF) << 8) | (digest[3]
                    & 0xFF);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    // 클라이언트가 연결요청할 때 보낸 사용자 IO 값으로 소켓 서버 연결
    private String extractRoomIdFromHeader(Request<RequestDataContext> request) {
        if (request instanceof DefaultRequest<RequestDataContext>) {
            return request
                    .getContext()
                    .getClientRequest()
                    .getHeaders()
                    .getFirst("roomId");
        }
        return null;
    }
}
