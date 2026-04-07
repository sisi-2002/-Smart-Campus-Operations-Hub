package com.smartcampus.security.oauth2;

import com.smartcampus.entity.AuthProvider;
import com.smartcampus.entity.Role;
import com.smartcampus.entity.User;
import com.smartcampus.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.client.userinfo.*;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService
        implements OAuth2UserService<OAuth2UserRequest, OAuth2User> {

    private final UserRepository userRepository;
    private final DefaultOAuth2UserService delegate = new DefaultOAuth2UserService();

    @Override
    public OAuth2User loadUser(OAuth2UserRequest request)
            throws OAuth2AuthenticationException {

        OAuth2User oAuth2User = delegate.loadUser(request);
        Map<String, Object> attributes = oAuth2User.getAttributes();

        String email    = (String) attributes.get("email");
        String name     = (String) attributes.get("name");
        String googleId = (String) attributes.get("sub");

        // Find existing user or create new one
        User user = userRepository.findByEmail(email).orElseGet(() -> {
            User newUser = User.builder()
                    .email(email)
                    .name(name)
                    .role(Role.USER)
                    .provider(AuthProvider.GOOGLE)
                    .providerId(googleId)
                    .enabled(true)
                    .build();
            return userRepository.save(newUser);
        });

        if (!user.isEnabled()) {
            throw new OAuth2AuthenticationException(
                new org.springframework.security.oauth2.core.OAuth2Error("access_denied"), 
                "Administater Disabled Your account pleace contact adminstater "
            );
        }

        // If user registered normally before, link Google ID
        if (user.getProvider() == AuthProvider.LOCAL) {
            user.setProviderId(googleId);
            userRepository.save(user);
        }

        return new OAuth2UserPrincipal(user, attributes);
    }
}