package com.smartcampus.service;

import com.warrenstrange.googleauth.GoogleAuthenticator;
import com.warrenstrange.googleauth.GoogleAuthenticatorConfig;
import com.warrenstrange.googleauth.GoogleAuthenticatorKey;
import com.warrenstrange.googleauth.GoogleAuthenticatorQRGenerator;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
public class MfaService {

    private final GoogleAuthenticator gAuth;

    public MfaService() {
        // ✅ Allow 3 windows (90 seconds tolerance each side)
        GoogleAuthenticatorConfig config = new GoogleAuthenticatorConfig
                .GoogleAuthenticatorConfigBuilder()
                .setTimeStepSizeInMillis(TimeUnit.SECONDS.toMillis(30))
                .setWindowSize(3)   // checks current + 1 before + 1 after
                .build();
        this.gAuth = new GoogleAuthenticator(config);
    }

    public String generateSecretKey() {
        GoogleAuthenticatorKey key = gAuth.createCredentials();
        return key.getKey();
    }

    public String generateQrCodeUri(String email, String secret) {
        return GoogleAuthenticatorQRGenerator.getOtpAuthTotpURL(
            "SmartCampus",
            email,
            new GoogleAuthenticatorKey.Builder(secret).build()
        );
    }

    public boolean verifyCode(String secret, int code) {
        return gAuth.authorize(secret, code);
    }
}