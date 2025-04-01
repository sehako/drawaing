package com.aioi.drawaing.drawinggameservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@EnableFeignClients
@SpringBootApplication
public class DrawingGameServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(DrawingGameServiceApplication.class, args);
	}

}
