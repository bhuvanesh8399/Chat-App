package com.eazybyts.backend.auth;

import com.eazybyts.backend.user.UserEntity;
import com.eazybyts.backend.user.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Optional;

/**
 * Unified AuthController
 * - Base path: /api/auth
 * - Accepts { email, username, password } for register/login (flexible)
 * - Returns { token, id, username } on login
 */
@RestController
@RequestMapping("/api/auth")
@CrossOrigin // global CORS typically configured elsewhere; keep for clarity
public class AuthController {

    @Autowired private UserRepository userRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private JwtService jwtService;
    @Autowired private AuthenticationManager authenticationManager;

    // --- DTOs (simple records) ---
    public static class RegisterRequest {
        public String email;
        public String username;
        public String password;
    }

    public static class LoginRequest {
        public String email;
        public String username;
        public String password;
    }

    public static class LoginResponse {
        public String token;
        public Long id;
        public String username;

        public LoginResponse(String token, Long id, String username) {
            this.token = token;
            this.id = id;
            this.username = username;
        }
    }

    public static class FcmTokenRequest {
        public String token;
    }

    // --------------------
    // Register endpoint
    // --------------------
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody RegisterRequest req) {
        if (req == null || req.password == null || req.password.isBlank()) {
            return ResponseEntity.badRequest().body("Password required");
        }

        // require at least username or email
        if ((req.username == null || req.username.isBlank()) &&
            (req.email == null || req.email.isBlank())) {
            return ResponseEntity.badRequest().body("Username or email required");
        }

        // Check uniqueness
        if (req.username != null && !req.username.isBlank()) {
            if (userRepository.findByUsername(req.username).isPresent()) {
                return ResponseEntity.badRequest().body("Username already exists");
            }
        }
        if (req.email != null && !req.email.isBlank()) {
            if (userRepository.findByEmail(req.email).isPresent()) {
                return ResponseEntity.badRequest().body("Email already exists");
            }
        }

        // Create and save user
        UserEntity user = new UserEntity();
        user.setUsername(req.username != null && !req.username.isBlank() ? req.username : req.email);
        user.setEmail(req.email);
        user.setPassword(passwordEncoder.encode(req.password));
        userRepository.save(user);

        return ResponseEntity.ok("User registered successfully");
    }

    // --------------------
    // Login endpoint
    // --------------------
    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody LoginRequest req) {
        if (req == null || req.password == null || req.password.isBlank()) {
            return ResponseEntity.badRequest().body("Password required");
        }

        // Determine login key (email preferred if present)
        String key = (req.email != null && !req.email.isBlank()) ? req.email
                  : (req.username != null && !req.username.isBlank()) ? req.username
                  : null;

        if (key == null) {
            return ResponseEntity.badRequest().body("Email or username required");
        }

        // Attempt authentication via AuthenticationManager (preferred)
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(key, req.password)
            );

            // If authenticate succeeded, principal contains username (depends on your UserDetails)
            String principalUsername = authentication.getName();

            // Load user entity to get id and canonical username
            Optional<UserEntity> userOpt = userRepository.findByUsername(principalUsername);
            if (userOpt.isEmpty()) {
                // Maybe the key was an email - try by email
                userOpt = userRepository.findByEmail(principalUsername);
            }

            // If still empty, try searching original key (email/username) as fallback
            if (userOpt.isEmpty()) {
                userOpt = userRepository.findByUsername(key);
                if (userOpt.isEmpty()) userOpt = userRepository.findByEmail(key);
            }

            if (userOpt.isEmpty()) {
                return ResponseEntity.status(401).body("User not found after authentication");
            }

            UserEntity user = userOpt.get();
            String token = jwtService.generateToken(user.getUsername());

            return ResponseEntity.ok(new LoginResponse(token, user.getId(), user.getUsername()));
        } catch (Exception ex) {
            // Authentication failed
            return ResponseEntity.status(401).body("Invalid credentials");
        }
    }

    // --------------------
    // Update FCM token for authenticated user
    // --------------------
    @PostMapping("/fcm-token")
    public ResponseEntity<?> updateFcmToken(@RequestBody FcmTokenRequest req, Principal principal,
                                            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        // Try to get username from Principal (set by Spring Security)
        String username = null;
        if (principal != null) username = principal.getName();

        // Fallback: if Principal absent (e.g., called without security context), try Authorization header
        if ((username == null || username.isBlank()) && authHeader != null && authHeader.startsWith("Bearer ")) {
            String jwt = authHeader.substring(7);
            username = jwtService.extractUsername(jwt);
        }

        if (username == null || username.isBlank()) {
            return ResponseEntity.status(401).body("Unauthenticated");
        }

        UserEntity user = userRepository.findByUsername(username).orElse(null);
        if (user == null) {
            user = userRepository.findByEmail(username).orElse(null);
        }
        if (user == null) {
            return ResponseEntity.status(404).body("User not found");
        }

        user.setFcmToken(req.token);
        userRepository.save(user);
        return ResponseEntity.ok("FCM token updated");
    }
}
