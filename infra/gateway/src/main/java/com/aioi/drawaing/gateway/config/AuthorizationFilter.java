package com.aioi.drawaing.gateway.config;

import com.aioi.drawaing.gateway.config.AuthorizationFilter.Config;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

@Component
public class AuthorizationFilter extends AbstractGatewayFilterFactory<Config> {
    public AuthorizationFilter() {
        super(AuthorizationFilter.Config.class);
    }

    @Override
    public GatewayFilter apply(Config config) {
        // Custom Pre Filter
        return ((exchange, chain) -> {
            // RxJava라는 웹 플럭스 지원해주는 라이브러리
            ServerHttpRequest request = exchange.getRequest();
            ServerHttpResponse response = exchange.getResponse();

            // Custom Post Filter
            return chain
                    .filter(exchange).then(Mono.fromRunnable(() -> {
                    }));
        });
    }

    public static class Config {
        // 설정 정보 저장 부분
    }
}
