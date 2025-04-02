package com.aioi.drawaing.gateway.config;

import com.aioi.drawaing.gateway.loadbalancer.HashingLoadBalancer;
import org.springframework.cloud.client.loadbalancer.LoadBalanced;
import org.springframework.cloud.loadbalancer.annotation.LoadBalancerClient;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
@LoadBalancerClient(value = "game-service", configuration = HashingLoadBalancer.class)
public class HashingLoadBalancerConfig {
    @Bean
    @LoadBalanced
    public WebClient.Builder webClientBuilder() {
        return WebClient.builder();
    }
}
