package com.aioi.drawaing.auth.auth.dto;

public record EmailVerificationRequest(String email, String code) {
}
