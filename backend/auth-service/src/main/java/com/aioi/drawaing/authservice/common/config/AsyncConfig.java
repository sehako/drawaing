package com.aioi.drawaing.authservice.common.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.aop.interceptor.AsyncUncaughtExceptionHandler;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.task.TaskExecutor;
import org.springframework.scheduling.annotation.AsyncConfigurer;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

@Slf4j
@EnableAsync
@Configuration
public class AsyncConfig implements AsyncConfigurer {
    @Bean(name = "mailExecutor")
    public TaskExecutor taskExecutor() {
        ThreadPoolTaskExecutor taskExecutor = new ThreadPoolTaskExecutor();
        // 기본 스레드 수
        taskExecutor.setCorePoolSize(10);
        // 최대 스레드 수
        taskExecutor.setMaxPoolSize(20);
        // 작업 요청 대기열 크기
        taskExecutor.setQueueCapacity(40);
        // 생성된 스레드 이름의 접두사
        taskExecutor.setThreadNamePrefix("Async-");
        return taskExecutor;
    }

    // 예외가 발생했을 때 처리 (단순하게 로그를 출력하도록 하였다)
    @Override
    public AsyncUncaughtExceptionHandler getAsyncUncaughtExceptionHandler() {
        return (ex, method, params) -> log.info("ex = {}, method = {}", ex, method);
    }
}