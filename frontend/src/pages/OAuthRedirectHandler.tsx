import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";

const OAuthRedirectHandler: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth(); // 사용자 정의 로그인 함수

  useEffect(() => {
    const fetchUserInfo = async (accessToken: string) => {
      try {
        const response = await axios.get(
          "https://www.drawaing.site/service/auth/api/v1/member/oauth",
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );

        const userInfo = response.data;
        console.log("Oauth 유저 정보:", userInfo);

        // 로그인 함수 호출
        await login({
          memberId: userInfo.data.memberId,
          nickname: userInfo.data.nickname,
          email: userInfo.data.email,
          characterImage: userInfo.data.characterImage,
          providerType: userInfo.data.providerType,
          accessToken: accessToken,
          level: userInfo.data.level,
          exp: userInfo.data.exp,
          point: userInfo.data.point,
        });

        // 로그인 성공 후 메인 페이지로 이동
        navigate("/");
      } catch (error) {
        console.error("사용자 정보 요청 오류:", error);
        alert("사용자 정보를 가져오는 데 실패했습니다.");
        navigate("/"); // 메인 페이지로 이동
      }
    };

    // URL에서 Access Token 추출
    const urlParams = new URLSearchParams(window.location.search);
    let accessToken = urlParams.get("accessToken");

    console.log("Oauth accessToken:", accessToken);

    if (accessToken) {
      fetchUserInfo(accessToken); // 비동기 함수 호출
    } else {
      navigate("/");
      console.error("Access Token이 제공되지 않았습니다.");
      alert("Access Token을 찾을 수 없습니다.");
      
    }
  }, [navigate]);

  return <div>로그인 처리 중...</div>;
};

export default OAuthRedirectHandler;
