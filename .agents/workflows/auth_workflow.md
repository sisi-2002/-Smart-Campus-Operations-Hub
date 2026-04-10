---
description: How to verify and use the new AuthPage workflow (Sign In, Get Started, Logout)
---

This workflow details the steps to test and verify the end-to-end authentication process using the new unified `AuthPage.jsx`. It covers checking navigation paths, toggling between login and register views, and logging out properly.

1. **Verify "Get Started" (Registration) Flow**
   - Navigate to the Home Page (`/`).
   - Click the **Get Started** button.
   - Verify that the URL is updated to `/auth?mode=register`.
   - Ensure the Unified Auth Page displays the **Register** panel.
   - Test registration functionality by creating a new account.
   - Submit the form and verify redirection to the Dashboard.

2. **Verify "Sign In" (Login) Flow**
   - From the Home Page or any public route, click the **Sign In** button.
   - Verify that the URL is updated to `/auth?mode=login`.
   - Ensure the Unified Auth Page displays the **Login** panel.
   - Authenticate with valid credentials.
   - Verify redirection to the appropriate Dashboard (Admin/User).

3. **Verify Auth Page Toggle (UI Level)**
   - Go to `/auth`.
   - Click the UI switch in the sliding overlay (e.g., clicking "Register" when on Login view, or "Login" when on Register view).
   - Verify that the URL query parameter reflects the change (e.g. `?mode=register`).
   - Ensure the form transitions visually between Login and Register modes without a full page reload.

4. **Verify "Logout" Flow**
   - From an authenticated Dashboard, find the **Logout** button in the header/navbar.
   - Click the **Logout** button (and confirm any modal prompts).
   - Ensure the browser's local storage token is wiped clean.
   - Verify that you are redirected to the Unified Auth page (`/auth?mode=login`) or the landing page (`/`).

5. **Verify Fallbacks (Authentication Errors)**
   - Attempt to load a protected route while unauthenticated.
   - Verify application restricts access and redirects back to `/auth?mode=login` (often with query param `error=session_expired`).
   - Attempt the Google OAuth login. Verify that cancelling or failing correctly redirects to `/auth?mode=login&error=oauth2_failed`.
