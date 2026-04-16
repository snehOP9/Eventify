package com.eventify.platform.config;

import com.eventify.platform.security.JwtAuthenticationFilter;
import com.eventify.platform.security.OAuth2AuthenticationSuccessHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final OAuth2AuthenticationSuccessHandler oAuth2AuthenticationSuccessHandler;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                .csrf(csrf -> csrf.disable())
            .cors(Customizer.withDefaults())
        .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(org.springframework.http.HttpMethod.OPTIONS, "/**").permitAll()
            .requestMatchers(
                "/oauth2/**",
                "/login/**",
                "/api/auth/**",
                    "/api/auth/oauth2/**",
                "/api/payments/razorpay/**",
                "/api/oauth2/**",
                "/api/login/oauth2/**",
                "/actuator/health",
                "/actuator/info"
            ).permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/events/**").permitAll()
                        .anyRequest().authenticated()
                )
        .oauth2Login(oauth2 -> oauth2
            .authorizationEndpoint(authorization -> authorization.baseUri("/api/oauth2/authorization"))
                .redirectionEndpoint(redirection -> redirection.baseUri("/login/oauth2/code/*"))
            .successHandler(oAuth2AuthenticationSuccessHandler)
        )
        .httpBasic(httpBasic -> httpBasic.disable())
        .formLogin(form -> form.disable())
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }
}
