package com.eazybyts.backend.config;

import com.eazybyts.backend.auth.JwtAuthenticationFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

/**
 * Unified Security configuration:
 * - Global CORS config (for Vite, React etc.)
 * - Stateless JWT-based security (insert JwtAuthenticationFilter)
 * - Permits OPTIONS preflight + public endpoints (auth, ws, health, h2-console)
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Autowired
    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // Enable CORS (uses corsConfigurationSource bean below)
            .cors(Customizer.withDefaults())
            // Disable CSRF for APIs (adjust if you use cookies / forms)
            .csrf(csrf -> csrf.disable())
            // No sessions — JWT is stateless
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Allow preflight requests
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                // Public endpoints (adjust paths to match your controllers)
                .requestMatchers("/api/auth/**", "/auth/register", "/auth/login", "/api/health").permitAll()
                // Allow websocket handshake endpoints
                .requestMatchers("/ws/**", "/stomp/**").permitAll()
                // H2 console for dev
                .requestMatchers("/h2-console/**").permitAll()
                // everything else requires authentication
                .anyRequest().authenticated()
            );

        // Register JWT filter before UsernamePasswordAuthenticationFilter so it can set auth in SecurityContext
        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        // For H2 console in dev: allow frames
        http.headers(headers -> headers.frameOptions(frame -> frame.disable()));

        return http.build();
    }

    /**
     * Global CORS configuration source for dev/frontend connections.
     * Add your production domains here when deploying.
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        // Add all dev origins that might hit your backend
        config.setAllowedOrigins(List.of(
            "http://localhost:5173",   // Vite dev server
            "http://localhost:3000",   // CRA / other local dev
            "http://localhost",        // generic
            "http://127.0.0.1"         // sometimes used
        ));

        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        config.setAllowedHeaders(List.of("Authorization", "Content-Type", "X-Requested-With", "Accept", "Origin"));
        config.setExposedHeaders(List.of("Authorization", "Content-Disposition"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L); // seconds

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    /**
     * Expose AuthenticationManager in case you need to perform manual auth (e.g., in a login controller).
     */
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }
}
