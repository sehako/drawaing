package com.aioi.drawaing.authservice.member.domain;

import com.aioi.drawaing.authservice.common.auditing.BaseEntity;
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
@NoArgsConstructor(access = lombok.AccessLevel.PROTECTED)
public class Member extends BaseEntity implements UserDetails {
    @Id
    @Column(name = "member_id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "email", nullable = false)
    private String email;

    @Setter
    @Column(name = "nickname", nullable = false)
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
}