package com.smartcampus.repository;

import com.smartcampus.entity.PasswordResetToken;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface PasswordResetTokenRepository
        extends MongoRepository<PasswordResetToken, String> {

    Optional<PasswordResetToken> findByEmailAndUsedFalse(String email);

    void deleteAllByEmail(String email);
}