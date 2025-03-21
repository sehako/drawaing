package com.aioi.drawaing.gateway.config;

import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GateWayRouteConfig {
    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
        return builder.routes()
                // 소켓 관련 헤더
                // .setRequestHeader("Upgrade", "websocket")
                // .setRequestHeader("Connection", "Upgrade")
                .route("game", r -> r
                        .path("/game/**")
                        .filters(f -> f
                                .rewritePath("/game/(?<segment>.*)", "/$\\{segment}")
                        )
                        .uri("lb:ws://DRAWING-GAME-SERVICE")
                )
                .route("auth", r -> r
                        .path("/auth/**")
                        .filters(f -> f
                                .rewritePath("/auth/(?<segment>.*)", "/$\\{segment}")
                        )
                        .uri("lb://AUTH-SERVICE")
                )
                .build();
    }
}
