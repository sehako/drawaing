package com.aioi.drawaing.gateway.config;

import com.aioi.drawaing.gateway.config.AuthorizationFilter.Config;
import com.aioi.drawaing.gateway.exception.AuthenticationExceptionResponse;
import com.aioi.drawaing.gateway.exception.FailureCode;
import com.aioi.drawaing.gateway.jwt.BearerParser;
import com.aioi.drawaing.gateway.jwt.JwtProvider;
import java.nio.charset.StandardCharsets;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.integration.json.SimpleJsonSerializer;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Slf4j
@Component
public class AuthorizationFilter extends AbstractGatewayFilterFactory<Config> {
    private static final String REFRESH_TOKEN = "refresh-token";
    private final JwtProvider jwtProvider;

    public AuthorizationFilter(JwtProvider jwtProvider) {
        super(AuthorizationFilter.Config.class);
        this.jwtProvider = jwtProvider;
    }

    @Override
    public GatewayFilter apply(Config config) {

        // Custom Pre Filter
        return ((exchange, chain) -> {
            // RxJava라는 웹 플럭스 지원해주는 라이브러리
            try {
                String accessToken = resolveAccessToken(exchange);
                log.info(accessToken);
                String refreshToken = resolveRefreshToken(exchange);

                String userId = jwtProvider.getUserId(accessToken, refreshToken);
                return chain.filter(exchange)
                        .then(Mono.fromRunnable(() -> {
                            exchange.getRequest().getHeaders().add("user-id", userId);
                        }));
            } catch (Exception e) {
                return unauthorizedResponse(exchange);
            }
        });
    }

    private String resolveAccessToken(ServerWebExchange exchange) {
        String accessToken = exchange
                .getRequest()
                .getHeaders()
                .getFirst(HttpHeaders.AUTHORIZATION);

        assert accessToken != null;
        return BearerParser.parse(accessToken);
    }

    private String resolveRefreshToken(ServerWebExchange exchange) {
        String refreshToken = exchange
                .getRequest()
                .getHeaders()
                .getFirst(REFRESH_TOKEN);

        assert refreshToken != null;
        return BearerParser.parse(refreshToken);
    }


    private Mono<Void> unauthorizedResponse(ServerWebExchange exchange) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(HttpStatus.UNAUTHORIZED);
        response.getHeaders().setContentType(MediaType.APPLICATION_JSON);

        String errorJson = SimpleJsonSerializer
                .toJson(AuthenticationExceptionResponse.onFailure(FailureCode.UNAUTHORIZED_TOKEN));

        DataBuffer buffer = response.bufferFactory()
                .wrap(errorJson.getBytes(StandardCharsets.UTF_8));

        return response.writeWith(Mono.just(buffer));
    }

    public static class Config {
        // 설정 정보 저장 부분
    }
}
