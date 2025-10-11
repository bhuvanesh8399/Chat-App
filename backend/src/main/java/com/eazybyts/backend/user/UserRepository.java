package com.eazybyts.backend.user;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<UserEntity, Long> {

    Optional<UserEntity> findByUsername(String username);

    // ✅ Add this line to support login/registration by email
    Optional<UserEntity> findByEmail(String email);
}
