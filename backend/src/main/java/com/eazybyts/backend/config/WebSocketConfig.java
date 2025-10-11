package com.eazybyts.backend.config;

import com.eazybyts.backend.auth.CustomUserDetailsService;
import com.eazybyts.backend.auth.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

/**
 * ✅ WebSocket Configuration:
 *  - Registers the /ws endpoint (with SockJS fallback)
 *  - Authenticates CONNECT frames using JWT
 *  - Enables /topic (broadcast) and /queue (private) messaging
 *  - Restricts allowed origins for security
 */
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Autowired private JwtService jwtService;
    @Autowired private CustomUserDetailsService userDetailsService;

    /**
     * Register the WebSocket handshake endpoint.
     * This is where frontend connects (SockJS fallback included).
     */
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                // 👇 Allow these frontend origins (edit if you add another port)
                .setAllowedOriginPatterns(
                        "http://localhost:5173",  // Vite dev server
                        "http://localhost:3000",  // React dev
                        "http://127.0.0.1",       // fallback
                        "http://localhost"        // fallback
                )
                .withSockJS();
    }

    /**
     * Configure message broker destinations.
     * /app → for application-level (controller) mapping.
     * /topic, /queue → simple broker for pub/sub and private messaging.
     */
    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic", "/queue");
        config.setUserDestinationPrefix("/user");
        config.setApplicationDestinationPrefixes("/app");
    }

    /**
     * Intercept incoming STOMP CONNECT frames and validate JWT.
     * If valid, sets authenticated user into the WebSocket session.
     */
    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(new ChannelInterceptor() {
            @Override
            public Message<?> preSend(Message<?> message, MessageChannel channel) {
                StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);

                if (StompCommand.CONNECT.equals(accessor.getCommand())) {
                    String authHeader = accessor.getFirstNativeHeader("Authorization");

                    if (authHeader != null && authHeader.startsWith("Bearer ")) {
                        String token = authHeader.substring(7);
                        String username = jwtService.extractUsername(token);

                        if (username != null) {
                            UserDetails userDetails = userDetailsService.loadUserByUsername(username);

                            if (jwtService.validateToken(token, userDetails)) {
                                Authentication auth = new UsernamePasswordAuthenticationToken(
                                        userDetails, null, userDetails.getAuthorities());
                                accessor.setUser(auth);
                            } else {
                                // ❌ Invalid token: reject connection
                                return null;
                            }
                        } else {
                            // ❌ Could not extract username
                            return null;
                        }
                    } else {
                        // ❌ Missing Authorization header
                        return null;
                    }
                }
                return message;
            }
        });
    }
}
