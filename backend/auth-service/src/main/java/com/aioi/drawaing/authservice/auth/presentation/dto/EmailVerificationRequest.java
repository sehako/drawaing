package com.aioi.drawaing.authservice.auth.presentation.dto;

public record EmailVerificationRequest(String email, String code) {
}
