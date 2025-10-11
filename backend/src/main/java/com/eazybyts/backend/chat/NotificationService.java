package com.eazybyts.backend.chat;

import org.springframework.stereotype.Service;

@Service
public class NotificationService {
    public void sendToToken(String fcmToken, String title, String body) {
        // TODO: integrate Firebase later; keeping no-op for now so build succeeds
        // log.debug("Would send FCM to {}: {} - {}", fcmToken, title, body);
    }
}
