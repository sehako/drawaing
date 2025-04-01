package com.aioi.drawaing.drawinggameservice.common.feign;

import feign.Client;
import okhttp3.OkHttpClient;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class FeignClientConfig {
    @Bean
    public Client feignClient() {
        return new feign.okhttp.OkHttpClient(new OkHttpClient());
    }
}
