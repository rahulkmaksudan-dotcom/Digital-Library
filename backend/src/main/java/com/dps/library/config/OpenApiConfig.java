package com.dps.library.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        final String securitySchemeName = "Bearer Authentication";

        return new OpenAPI()
            .info(new Info()
                .title("Digital Library Management System API")
                .version("1.0.0")
                .description("Production-grade RESTful API for Thakur Shree DPS College of Engineering and Management.\n" +
                             "Project Team: Ashish Yadav, Rahul Yadav, Priyanshu Yadav.")
                .contact(new Contact()
                    .name("DPS Library IT Team")
                    .email("library@dpscollege.edu")
                    .url("https://dpslibrary.edu"))
                .license(new License().name("Educational Use License").url("https://dpscollege.edu/license")))
            .addSecurityItem(new SecurityRequirement().addList(securitySchemeName))
            .components(new Components()
                .addSecuritySchemes(securitySchemeName, new SecurityScheme()
                    .name(securitySchemeName)
                    .type(SecurityScheme.Type.HTTP)
                    .scheme("bearer")
                    .bearerFormat("JWT")));
    }
}

