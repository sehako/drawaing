package com.aioi.drawaing.gateway.config;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class SwaggerRedirectController {
    @GetMapping("/swagger-docs")
    public String redirectToSwaggerUI() {
        return "redirect:/service/swagger-ui/index.html";
    }
}
