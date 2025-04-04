package com.aioi.drawaing.drawinggameservice.common.jwt;

public class BearerParser {
    private static final String PREFIX = "Bearer ";

    public static String parse(String accessToken) {
        return accessToken.replace(PREFIX, "");
    }
}

