package com.aioi.drawaing.gateway.exception;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import java.nio.charset.StandardCharsets;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.integration.json.SimpleJsonSerializer;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@JsonPropertyOrder({"code", "message"})
public record AuthExceptionResponse<T>(
        String code,
        String message
) {

    public static <T> AuthExceptionResponse<T> onFailure(FailureCode failureCode) {
        return new AuthExceptionResponse<>(failureCode.name(), failureCode.getMessage());
    }

    public static Mono<Void> response(ServerWebExchange exchange, FailureCode failureCode) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(HttpStatus.UNAUTHORIZED);
        response.getHeaders().setContentType(MediaType.APPLICATION_JSON);

        String errorJson = SimpleJsonSerializer
                .toJson(AuthExceptionResponse.onFailure(failureCode));

        DataBuffer buffer = response.bufferFactory()
                .wrap(errorJson.getBytes(StandardCharsets.UTF_8));

        return response.writeWith(Mono.just(buffer));
    }
}