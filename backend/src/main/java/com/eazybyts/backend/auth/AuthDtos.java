// src/main/java/com/eazybyts/backend/auth/AuthDtos.java
package com.eazybyts.backend.auth;

public class AuthDtos {
    // Login request payload
    public static class LoginRequest {
        public String username;
        public String password;
    }
    // Login response payload
    public static class LoginResponse {
        public String token;
        public Long userId;
        public String username;
        public LoginResponse() {}
        public LoginResponse(String token, Long userId, String username) {
            this.token = token;
            this.userId = userId;
            this.username = username;
        }
    }
    // Registration request payload
    public static class RegisterRequest {
        public String username;
        public String password;
    }
    // FCM token update request payload
    public static class FcmTokenRequest {
        public String token;
    }
}
