package com.aioi.drawaing.authservice.auth.infrastructure.repository;

import com.aioi.drawaing.authservice.auth.domain.VerificationCodeCache;
import java.time.LocalDateTime;
import java.util.Optional;
import org.springframework.data.repository.CrudRepository;

public interface VerificationCodeCacheRepository extends CrudRepository<VerificationCodeCache, String> {
    default Optional<VerificationCodeCache> findValidCode(String email) {
        return findById(email)
                .filter(cache -> cache.getCreatedAt().isAfter(LocalDateTime.now().minusMinutes(5)));
    }
    Optional<VerificationCodeCache> findByEmail(String email);
}
