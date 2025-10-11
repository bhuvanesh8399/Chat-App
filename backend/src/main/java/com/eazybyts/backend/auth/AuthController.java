// src/main/java/com/eazybyts/backend/auth/AuthController.java
package com.eazybyts.backend.auth;

import com.eazybyts.backend.user.UserEntity;
import com.eazybyts.backend.user.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.Optional;

@RestController
@RequestMapping("/auth")
@CrossOrigin
public class AuthController {
    @Autowired private UserRepository userRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private JwtService jwtService;

    // Register a new user
    @PostMapping("/register")
    public ResponseEntity<String> registerUser(@RequestBody AuthDtos.RegisterRequest request) {
        // Check if username is already taken
        if (userRepository.findByUsername(request.username).isPresent()) {
            return ResponseEntity.badRequest().body("Username already exists");
        }
        // Create user with encoded password
        UserEntity newUser = new UserEntity(request.username, passwordEncoder.encode(request.password));
        userRepository.save(newUser);
        return ResponseEntity.ok("User registered successfully");
    }

    // Login user and return JWT token
    @PostMapping("/login")
    public ResponseEntity<AuthDtos.LoginResponse> loginUser(@RequestBody AuthDtos.LoginRequest request) {
        Optional<UserEntity> userOpt = userRepository.findByUsername(request.username);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).build(); // Unauthorized if user not found
        }
        UserEntity user = userOpt.get();
        if (!passwordEncoder.matches(request.password, user.getPassword())) {
            return ResponseEntity.status(401).build(); // Wrong password
        }
        // Generate JWT token
        String token = jwtService.generateToken(user.getUsername());
        AuthDtos.LoginResponse resp = new AuthDtos.LoginResponse(token, user.getId(), user.getUsername());
        return ResponseEntity.ok(resp);
    }

    // Save/Update the Firebase Cloud Messaging (FCM) device token for the authenticated user
    @PostMapping("/fcm-token")
    public ResponseEntity<String> updateFcmToken(@RequestBody AuthDtos.FcmTokenRequest request, 
                                                 @RequestHeader("Authorization") String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body("Missing or invalid Authorization header");
        }
        String jwt = authHeader.substring(7);
        String username = jwtService.extractUsername(jwt);
        if (username == null) {
            return ResponseEntity.status(401).body("Invalid JWT token");
        }
        UserEntity user = userRepository.findByUsername(username).orElse(null);
        if (user == null) {
            return ResponseEntity.status(404).body("User not found");
        }
        // Store the device token in the user's record
        user.setFcmToken(request.token);
        userRepository.save(user);
        return ResponseEntity.ok("FCM token updated");
    }
}
