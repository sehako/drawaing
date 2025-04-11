package com.aioi.drawaing.authservice.member.infrastructure.repository;

import com.aioi.drawaing.authservice.member.domain.Member;
import jakarta.validation.constraints.NotBlank;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MemberRepository extends JpaRepository<Member, Long> {

    Member findMemberByEmail(String email);

    Optional<Member> findMemberById(long memberId);

    Optional<Member> findByNickname(@NotBlank String nickname);

    Optional<Member> findByEmail(@NotBlank String email);

    boolean existsByEmail(String email);
}
