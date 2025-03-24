package com.aioi.drawaing.authservice.auth.service;

import com.aioi.drawaing.authservice.auth.dto.EmailRequest;
import com.aioi.drawaing.authservice.auth.dto.EmailVerificationRequest;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.ResponseEntity;

public interface AuthService {
    void checkNicknameDuplication(String nickname);

    void checkEmailDuplication(String email);

    void sendEmailCode(EmailRequest emailRequest);

    void verifyEmailCode(EmailVerificationRequest emailVerificationRequest);

    void sendEmailPassword(EmailRequest emailRequest);

    ResponseEntity<?> getSocialType(String email);

    ResponseEntity<?> reissue(HttpServletRequest request, HttpServletResponse response);
}
