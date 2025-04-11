package com.aioi.drawaing.authservice.member.domain;

import com.aioi.drawaing.authservice.common.auditing.BaseEntity;
import com.aioi.drawaing.authservice.member.presentation.request.MemberInfoUpdateRequest;
import com.aioi.drawaing.authservice.oauth.domain.entity.ProviderType;
import com.aioi.drawaing.authservice.oauth.domain.entity.RoleType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import java.util.Collection;
import java.util.Collections;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

@Entity
@ToString
@Getter
@Builder(toBuilder = true)
@AllArgsConstructor
@NoArgsConstructor
public class Member extends BaseEntity implements UserDetails {
    @Id
    @Column(name = "member_id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "email", length = 63)
    private String email;

    @Setter
    @Column(name = "nickname", nullable = false, length = 20)
    private String nickname;

    @Setter
    @Column(name = "password")
    private String password;

    @Column(name = "provider_type")
    @Enumerated(EnumType.STRING)
    private ProviderType providerType;

    @Column(name = "role")
    @Enumerated(EnumType.STRING)
    private RoleType role;

    @Setter
    @Column(name = "character_image")
    private String characterImage;

    @Column(name = "level", columnDefinition = "integer default 1")
    @Builder.Default
    private Integer level = 1;

    @Column(name = "exp", columnDefinition = "integer default 0")
    @Builder.Default
    private Integer exp = 0;

    @Column(name = "point", columnDefinition = "integer default 0")
    @Builder.Default
    private Integer point = 0;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Collections.singletonList(new SimpleGrantedAuthority(this.role.name()));
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return UserDetails.super.isAccountNonExpired();
    }

    @Override
    public boolean isAccountNonLocked() {
        return UserDetails.super.isAccountNonLocked();
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return UserDetails.super.isCredentialsNonExpired();
    }

    @Override
    public boolean isEnabled() {
        return UserDetails.super.isEnabled();
    }

    public void infoUpdate(MemberInfoUpdateRequest memberInfoUpdateRequest) {
        this.nickname = memberInfoUpdateRequest.nickname() == null
                ? this.nickname : memberInfoUpdateRequest.nickname();
        this.characterImage = memberInfoUpdateRequest.characterImageUrl() == null
                ? this.characterImage : memberInfoUpdateRequest.characterImageUrl();
        this.password = memberInfoUpdateRequest.password() == null
                ? this.password : memberInfoUpdateRequest.password();
    }

    public void expUpdate(int level, int exp, int addPoint) {
        this.level = level;
        this.exp = exp;
        this.point += addPoint;
    }

    public void deductPoint(int point) {
        if (this.point < point) {
            throw new RuntimeException("포인트가 부족합니다");
        }
        this.point -= point;
    }
}