package com.aioi.drawaing.auth.common.constant;

public class EmailTemplate {
    public static final String EMAIL_VERIFICATION_SUBJECT = "[D3V] 이메일 인증 코드입니다.";
    public static final String EMAIL_VERIFICATION_CONTENT = """
                        <!DOCTYPE html>
                                    <html lang="ko">
                                    <head>
                                        <meta charset="UTF-8">
                                        <style>
                                            body {
                                                font-family: "Poppins", "Noto Sans KR", sans-serif;
                                                color: #333333;
                                                line-height: 1.6;
                                                background-color: #f0f8ff;
                                                text-align: center;
                                                padding: 30px;
                                                justify-content: center;
                                                align-items: center;
                                                height: 100vh;
                                            }
                                            .container {
                                                max-width: 600px;
                                                margin: 0 auto;
                                                padding: 30px;
                                                background: white;
                                                border-radius: 10px;
                                                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                                                border: 1px solid #00518D;
                                                text-indent: 15px;
                                            }
                                            .header {
                                                font-size: 24px;
                                                font-weight: bold;
                                                color: #00518D;
                                                text-align: center;
                                                margin-bottom: 20px;
                                            }
                                            .code {
                                                font-size: 32px;
                                                font-weight: bold;
                                                color: #00518D;
                                                text-align: center;
                                                padding: 15px;
                                                background-color: #F4FAFF;
                                                border-radius: 8px;
                                                margin: 20px auto;
                                                display: inline-block;
                                                width: 80%%;
                                            }
                                            .footer {
                                                font-size: 14px;
                                                color: #888888;
                                                margin-top: 20px;
                                            }
                                        </style>
                                    </head>
                                    <body>
                                        <div class="container">
                                            <div class="header">
                                                D3V 이메일 인증 코드 안내
                                            </div>
                                            <p>안녕하세요!</p>
                                            <p>아래 인증 코드를 사용하여 이메일 인증을 완료해 주세요.</p>
                                            <div class="code">%s</div>
                                            <p>이 인증 코드는 5분간 유효합니다.</p>
                                            <p>저희 서비스를 이용해 주셔서 감사합니다!</p>
                                            <div class="footer">
                                                <p>이 메일은 발신 전용 메일입니다. 문의 사항이 있을 경우 고객센터를 이용해 주세요.</p>
                                            </div>
                                        </div>
                                    </body>
                                    </html>
            """;

    public static final String EMAIL_PASSWORD_SUBJECT = "[D3V] 비밀번호 임시 비밀번호 안내입니다.";
    public static final String EMAIL_PASSWORD_CONTENT = """
            <!DOCTYPE html>
                        <html lang="ko">
                        <head>
                            <meta charset="UTF-8">
                            <style>
                                body {
                                    font-family: "Poppins", "Noto Sans KR", sans-serif;
                                    color: #333333;
                                    line-height: 1.6;
                                    background-color: #f0f8ff;
                                    text-align: center;
                                    padding: 30px;
                                    justify-content: center;
                                    align-items: center;
                                    height: 100vh;
                                }
                                .container {
                                    max-width: 600px;
                                    margin: 0 auto;
                                    padding: 30px;
                                    background: white;
                                    border-radius: 10px;
                                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                                    border: 1px solid #00518D;
                                    text-indent: 15px;
                                }
                                .header {
                                    font-size: 24px;
                                    font-weight: bold;
                                    color: #00518D;
                                    text-align: center;
                                    margin-bottom: 20px;
                                }
                                .code {
                                    font-size: 32px;
                                    font-weight: bold;
                                    color: #00518D;
                                    text-align: center;
                                    padding: 15px;
                                    background-color: #F4FAFF;
                                    border-radius: 8px;
                                    margin: 20px auto;
                                    display: inline-block;
                                    width: 80%%;
                                }
                                .footer {
                                    font-size: 14px;
                                    color: #888888;
                                    margin-top: 20px;
                                }
                            </style>
                        </head>
                        <body>
                            <div class="container">
                                <div class="header">
                                    D3V 임시 비밀번호 안내
                                </div>
                                <p>안녕하세요!</p>
                                <p>고객님의 임시 비밀번호는 아래와 같습니다.</p>
                                <div class="code">%s</div>
                                <p>저희 서비스를 이용해 주셔서 감사합니다!</p>
                                <div class="footer">
                                    <p>이 메일은 발신 전용 메일입니다. 문의 사항이 있을 경우 고객센터를 이용해 주세요.</p>
                                </div>
                            </div>
                        </body>
                        </html>
            """;
}
