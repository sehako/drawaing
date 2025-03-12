package com.aioi.drawaing.auth.common.util;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public class SecurityUtil {

    /**
     * 현재 인증된 사용자의 username을 반환합니다.
     *
     * @return username (String) 또는 null (인증되지 않은 경우)
     */
    public static String getCurrentMemberEmail() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        // 인증 객체가 null이거나 인증되지 않은 경우 null 반환
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }

        // Authentication 객체에서 username 반환
        return authentication.getName();
    }
}
