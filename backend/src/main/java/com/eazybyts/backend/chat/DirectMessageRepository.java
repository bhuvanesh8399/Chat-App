package com.eazybyts.backend.chat;

import org.springframework.data.jpa.repository.JpaRepository;

public interface DirectMessageRepository extends JpaRepository<DirectMessageEntity, Long> {}
