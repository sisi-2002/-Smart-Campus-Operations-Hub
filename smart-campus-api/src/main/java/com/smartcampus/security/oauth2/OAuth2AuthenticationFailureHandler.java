package com.smartcampus.security.oauth2;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationFailureHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class OAuth2AuthenticationFailureHandler
        extends SimpleUrlAuthenticationFailureHandler {

    @Value("${app.frontend-url}")
    private String frontendUrl;

    @Override
    public void onAuthenticationFailure(HttpServletRequest request,
                                        HttpServletResponse response,
                                        AuthenticationException exception)
            throws IOException {
        String errorMsg = "oauth2_failed";
        if (exception.getMessage() != null && exception.getMessage().contains("Administater Disabled account")) {
            errorMsg = "Administater Disabled account pleace contact adminstater ";
        }
        getRedirectStrategy().sendRedirect(
            request, response, frontendUrl + "/login?error=" + java.net.URLEncoder.encode(errorMsg, "UTF-8"));
    }
}