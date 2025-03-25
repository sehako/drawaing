package com.aioi.drawaing.gateway.config;

import com.aioi.drawaing.gateway.exception.AuthenticationExceptionResponse;
import com.aioi.drawaing.gateway.exception.FailureCode;
import com.aioi.drawaing.gateway.jwt.BearerParser;
import com.aioi.drawaing.gateway.jwt.JwtProvider;
import java.nio.charset.StandardCharsets;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.integration.json.SimpleJsonSerializer;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.ReactiveSecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter implements WebFilter {
    private final JwtProvider jwtProvider;
    private static final String AUTHORITIES_KEY = "auth";
    private static final String REFRESH_TOKEN = "refresh-token";

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {
        try {
            String accessToken = resolveAccessToken(exchange);
            String refreshToken = resolveRefreshToken(exchange);

            Authentication auth = jwtProvider.getAuthentication(accessToken, refreshToken);
            return chain.filter(exchange)
                    .contextWrite(ReactiveSecurityContextHolder
                            .withAuthentication(auth));
        } catch (Exception e) {
            return unauthorizedResponse(exchange);
        }
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
}
