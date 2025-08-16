package com.goodnight.ticket_service.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("좌석 예약 시스템 API")
                        .description("좌석 예약 및 관리 시스템의 REST API 문서")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("Good Night Team")
                                .email("contact@goodnight.com")));
    }
}