package com.aioi.drawaing.authservice.oauth.application;

import com.aioi.drawaing.authservice.member.domain.Member;
import com.aioi.drawaing.authservice.member.infrastructure.repository.MemberRepository;
import com.aioi.drawaing.authservice.oauth.domain.entity.ProviderType;
import com.aioi.drawaing.authservice.oauth.domain.entity.RoleType;
import com.aioi.drawaing.authservice.oauth.domain.entity.UserPrincipal;
import com.aioi.drawaing.authservice.oauth.domain.info.OAuth2UserInfo;
import com.aioi.drawaing.authservice.oauth.domain.info.OAuth2UserInfoFactory;
import com.aioi.drawaing.authservice.oauth.exception.OAuthProviderMissMatchException;
import com.aioi.drawaing.authservice.ranking.domain.DrawingGameRecord;
import com.aioi.drawaing.authservice.ranking.infrastructure.repository.DrawingGameRecordRepository;
import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.InternalAuthenticationServiceException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private static final String ALREADY_SIGNED_UP_SOCIAL = "already_signed_up_social";
    private static final String ALREADY_SIGNED_UP_LOCAL = "already_signed_up_local";

    private final MemberRepository memberRepository;
    private final DrawingGameRecordRepository drawingGameRecordRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User user = super.loadUser(userRequest);

        try {
            return this.process(userRequest, user);
        } catch (AuthenticationException ex) {
            throw ex;
        } catch (Exception ex) {
            log.error("CustomOAuth2UserService loadUser Error: {} ", ex.getMessage());
            throw new InternalAuthenticationServiceException(ex.getMessage(), ex.getCause());
        }
    }

    private OAuth2User process(OAuth2UserRequest userRequest, OAuth2User user) {
        ProviderType providerType = ProviderType.valueOf(
                userRequest.getClientRegistration().getRegistrationId().toUpperCase());

        OAuth2UserInfo userInfo = OAuth2UserInfoFactory.getOAuth2UserInfo(providerType, user.getAttributes());
        Member savedUser = memberRepository.findMemberByEmail(userInfo.getEmail());

        if (savedUser != null) {
            if (savedUser.getProviderType() == ProviderType.LOCAL) {
                log.error("CustomOAuth2UserService process Error: 기존 회원입니다. 자체 로그인을 이용해 주세요. ");
                throw new OAuthProviderMissMatchException(ALREADY_SIGNED_UP_LOCAL);
            }

            if (providerType != savedUser.getProviderType()) {
                log.error("CustomOAuth2UserService process Error: 다른 소셜에서 가입된 이메일 입니다. 해당 소셜 로그인을 이용해 주세요.");
                throw new OAuthProviderMissMatchException(ALREADY_SIGNED_UP_SOCIAL);
            }
            updateUser(savedUser, userInfo);
        } else {
            savedUser = createUser(userInfo, providerType);
            drawingGameRecordRepository.save(CreateDrawingGameRecord(savedUser));
        }

        return UserPrincipal.create(savedUser, user.getAttributes());
    }

    private Member createUser(OAuth2UserInfo userInfo, ProviderType providerType) {
        Member member = Member.builder()
                .email(userInfo.getEmail())
                .nickname(userInfo.getName())
                .providerType(providerType)
                .role(RoleType.ROLE_USER)
                .level(1)
                .exp(0)
                .point(0)
                .characterImage(
                        "https://i.pinimg.com/736x/8d/88/5f/8d885f3de74052403323f56445d83dab.jpg") // 임시로 넣어둠, 고칠 예정
                .build();
        return memberRepository.saveAndFlush(member);
    }

    private void updateUser(Member member, OAuth2UserInfo userInfo) {
        if (userInfo.getName() != null && !member.getUsername().equals(userInfo.getName())) {
            member.setNickname(userInfo.getName());
        }
        member.setCharacterImage(userInfo.getImageUrl());
    }

    private DrawingGameRecord CreateDrawingGameRecord(Member member) {
        return DrawingGameRecord.builder()
                .member(member)
                .playCount(0)
                .achievedAt(LocalDateTime.now())
                .win(0)
                .draw(0)
                .lose(0)
                .rankScore(0)
                .lastPlayedAt(LocalDateTime.now())
                .build();
    }
}
