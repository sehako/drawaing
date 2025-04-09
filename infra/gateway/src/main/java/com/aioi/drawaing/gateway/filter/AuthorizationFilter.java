package com.aioi.drawaing.gateway.filter;

import com.aioi.drawaing.gateway.dto.MemberInfo;
import com.aioi.drawaing.gateway.exception.AuthExceptionResponse;
import com.aioi.drawaing.gateway.exception.FailureCode;
import com.aioi.drawaing.gateway.exception.NoAccessTokenException;
import com.aioi.drawaing.gateway.exception.NoRefreshTokenException;
import com.aioi.drawaing.gateway.filter.AuthorizationFilter.Config;
import com.aioi.drawaing.gateway.jwt.BearerParser;
import com.aioi.drawaing.gateway.jwt.JwtProvider;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Slf4j
@Component
public class AuthorizationFilter extends AbstractGatewayFilterFactory<Config> {
    private static final String REFRESH_TOKEN = "refresh_token";
    private final JwtProvider jwtProvider;
    private FailureCode failureCode = FailureCode.UNAUTHORIZED_TOKEN;

    public AuthorizationFilter(JwtProvider jwtProvider) {
        super(AuthorizationFilter.Config.class);
        this.jwtProvider = jwtProvider;
    }

    @Override
    public GatewayFilter apply(Config config) {

        // Custom Pre Filter
        return (exchange, chain) -> {
            try {
                log.info("Path = {}", exchange.getRequest().getPath());
                String accessToken = resolveAccessToken(exchange);
                String refreshToken = resolveRefreshToken(exchange);

                MemberInfo memberFromJwt = jwtProvider.getMemberInfo(accessToken, refreshToken);

                String role = memberFromJwt.role();
                String requestPath = exchange.getRequest().getURI().getPath();

                log.info("Member Info = {}", memberFromJwt);

                // 기존 요청에서 새로운 요청 생성 후 헤더 추가
                ServerHttpRequest mutatedRequest = exchange.getRequest().mutate()
                        .header("member-id", memberFromJwt.memberId())
                        .build();

                // 새로운 요청을 포함한 exchange로 체인 진행
                ServerWebExchange mutatedExchange = exchange.mutate()
                        .request(mutatedRequest)
                        .build();

                return chain.filter(mutatedExchange)
                        .then(Mono.fromRunnable(() -> {
                        }));
            } catch (Exception e) {
                return AuthExceptionResponse.response(exchange, failureCode);
            }
        };
    }

    private String resolveAccessToken(ServerWebExchange exchange) {
        String accessToken = exchange
                .getRequest()
                .getHeaders()
                .getFirst(HttpHeaders.AUTHORIZATION);

        log.info("access token = {}", accessToken);

        if (accessToken == null || accessToken.isEmpty()) {
            failureCode = FailureCode.NO_ACCESS_TOKEN;
            throw new NoAccessTokenException("no access token");
        }
        return BearerParser.parse(accessToken);
    }

    private String resolveRefreshToken(ServerWebExchange exchange) {
        String refreshToken = exchange
                .getRequest()
                .getCookies()
                .getFirst(REFRESH_TOKEN)
                .getValue();

        log.info("refresh_token = {}", refreshToken);

        if (refreshToken == null || refreshToken.isEmpty()) {
            failureCode = FailureCode.NO_REFRESH_TOKEN;
            throw new NoRefreshTokenException("no refresh token");
        }
        return refreshToken;
    }

    public static class Config {
        // 설정 정보 저장 부분
    }
}
