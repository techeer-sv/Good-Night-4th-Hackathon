package com.example.reservation.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.connection.RedisStandaloneConfiguration;

import jakarta.annotation.PostConstruct;

@Configuration
@Slf4j
public class RedisConfig {

    @Value("${spring.data.redis.host:redis}")
    private String redisHost;

    @Value("${spring.data.redis.port:6379}")
    private int redisPort;

    @PostConstruct
    public void logRedisConfig() {
        log.info("Redis configuration - Host: {}, Port: {}", redisHost, redisPort);
    }

    @Bean
    public RedisConnectionFactory redisConnectionFactory() {
        try {
            log.info("Creating Redis connection factory to {}:{}", redisHost, redisPort);
            RedisStandaloneConfiguration config = new RedisStandaloneConfiguration();
            config.setHostName(redisHost);
            config.setPort(redisPort);
            
            LettuceConnectionFactory factory = new LettuceConnectionFactory(config);
            factory.afterPropertiesSet();
            
            log.info("Redis connection factory created successfully");
            return factory;
        } catch (Exception e) {
            log.error("Failed to create Redis connection factory: {}", e.getMessage());
            throw new RuntimeException("Redis connection factory creation failed", e);
        }
    }

    @Bean
    public StringRedisTemplate stringRedisTemplate(RedisConnectionFactory redisConnectionFactory) {
        try {
            log.info("Creating StringRedisTemplate");
            StringRedisTemplate template = new StringRedisTemplate(redisConnectionFactory);
            log.info("StringRedisTemplate created successfully");
            return template;
        } catch (Exception e) {
            log.error("Failed to create StringRedisTemplate: {}", e.getMessage());
            throw new RuntimeException("StringRedisTemplate creation failed", e);
        }
    }
} 