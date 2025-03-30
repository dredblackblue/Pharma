package com.pharma.pdms;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.Bean;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Main Spring Boot Application class for the Pharmaceutical Database Management System (PDMS)
 * Configures component scanning, entity scanning, and repository scanning
 */
@SpringBootApplication
@EntityScan(basePackages = {"com.pharma.pdms.models"})
@EnableJpaRepositories(basePackages = {"com.pharma.pdms.repositories"})
public class PdmsApplication {

    public static void main(String[] args) {
        SpringApplication.run(PdmsApplication.class, args);
    }
    
    /**
     * Configures CORS to allow requests from the frontend
     */
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                    .allowedOrigins("http://localhost:3000", "http://localhost:5173")
                    .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
                    .allowedHeaders("*")
                    .allowCredentials(true);
            }
        };
    }
}