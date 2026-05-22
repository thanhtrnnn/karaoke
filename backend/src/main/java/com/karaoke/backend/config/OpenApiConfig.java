package com.karaoke.backend.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import java.util.List;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    OpenAPI karaokeOpenApi() {
        return new OpenAPI()
                .info(new Info()
                        .title("Karaoke Management API")
                        .version("0.1.0")
                        .description("REST API cho hệ thống quản lý chuỗi nhà hàng Karaoke: xác thực, khách hàng, phòng, đặt phòng, gọi món, kho và báo cáo.")
                        .contact(new Contact().name("Karaoke Backend Team")))
                .servers(List.of(new Server().url("http://localhost:8080").description("Local development")))
                .addSecurityItem(new SecurityRequirement().addList("BearerAuth"))
                .components(new Components()
                        .addSecuritySchemes("BearerAuth", new SecurityScheme()
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("Token")
                                .description("Nhập token nhận được từ API đăng nhập/đăng ký (ví dụ: dev-token-USR001)")));
    }
}
