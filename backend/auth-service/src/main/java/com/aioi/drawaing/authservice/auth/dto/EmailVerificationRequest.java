package com.aioi.drawaing.authservice.auth.dto;

public record EmailVerificationRequest(String email, String code) {
}
