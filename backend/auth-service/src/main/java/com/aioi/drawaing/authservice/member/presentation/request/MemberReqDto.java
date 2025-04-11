package com.aioi.drawaing.authservice.member.presentation.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;

public class MemberReqDto {

    @Getter
    @Setter
    @ToString
    public static class SignUp {

        @NotEmpty(message = "이메일은 필수 입력값입니다.")
        @Pattern(regexp = "^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,6}$", message = "이메일 형식에 맞지 않습니다.")
        @Schema(description = "이메일", example = "ssafy1@ssafy.com")
        private String email;

        @NotEmpty(message = "닉네임은 필수 입력값입니다.")
        @Pattern(regexp = "[ㄱ-ㅎ|가-힣|a-z|A-Z|0-9|]{2,16}", message = "닉네임 형식에 맞지 않습니다.")
        @Schema(description = "닉네임", example = "ssafy")
        private String nickname;

        @NotEmpty(message = "비밀번호는 필수 입력값입니다.")
        @Pattern(regexp = "^(?=.*[A-Za-z])(?=.*\\d)(?=.*[~!@#$%^&*()+|=])[A-Za-z\\d~!@#$%^&*()+|=]{8,16}$", message = "비밀번호는 8~16자 영문 대 소문자, 숫자, 특수문자를 사용하세요.")
        @Schema(description = "비밀번호", example = "ssafy1234!")
        private String password;
    }

    @Getter
    @Setter
    @ToString
    public static class Login {

        @NotEmpty(message = "이메일은 필수 입력값입니다.")
        @Pattern(regexp = "^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+.[A-Za-z]{2,6}$", message = "이메일 형식에 맞지 않습니다.")
        @Schema(description = "이메일", example = "ssafy1@ssafy.com")
        private String email;

        @NotEmpty(message = "비밀번호는 필수 입력값입니다.")
        @Schema(description = "비밀번호", example = "ssafy1234!")
        private String password;

        public UsernamePasswordAuthenticationToken toAuthentication() {
            return new UsernamePasswordAuthenticationToken(email, password);
        }
    }
}