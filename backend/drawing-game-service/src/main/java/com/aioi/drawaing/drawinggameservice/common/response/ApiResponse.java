package com.aioi.drawaing.drawinggameservice.common.response;

import com.aioi.drawaing.drawinggameservice.common.code.SuccessStatus;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;

@JsonPropertyOrder({"code", "message", "result"})
public record ApiResponse<T> (String code, String message, @JsonInclude(JsonInclude.Include.NON_NULL) T result){

    public static <T> ApiResponse<T> onSuccess(SuccessStatus status, T result) {
        return new ApiResponse<>(status.name(), status.getMessage(), result);
    }
}
