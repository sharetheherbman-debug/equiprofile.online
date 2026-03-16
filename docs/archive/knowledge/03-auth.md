# EquiProfile — Getting Started & Auth

## Signing Up

1. Go to https://equiprofile.online/register
2. Enter your full name → Continue
3. Enter your email address → Continue
4. Create a password (min 12 characters) → Continue
5. Accept Terms of Service
6. Your 7-day free trial begins immediately — no credit card needed

## Logging In

1. Go to https://equiprofile.online/login
2. Enter your email → Continue
3. Enter your password → Sign In
4. You are taken to your Dashboard

## Forgot Password

1. Click "Forgot password?" on the login page
2. Enter your email address
3. Check your email for a reset link (expires in 1 hour)
4. Click the link and set a new password

## Session & Cookies

- Sessions are stored in a secure, HttpOnly cookie
- Sessions persist for 30 days by default
- Behind HTTPS (nginx) the cookie is Secure + SameSite=Lax
- No personal data is stored in the browser beyond the session token

## Common Auth Problems

- **"Invalid credentials"** — check your email address and password; use Forgot Password to reset
- **No reset email received** — check spam/junk folder; allow 2 minutes for delivery; ensure the email matches your account
- **Account locked** — too many failed attempts trigger a temporary lock; wait 15 minutes and try again
- **"Session expired"** — log in again; sessions expire after 30 days of inactivity

## Deleting Your Account

Contact support at hello@equiprofile.online to request account deletion. All data is permanently removed within 30 days.
