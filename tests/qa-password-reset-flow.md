# Password Reset Flow QA Checklist

## Prerequisites
- [ ] Supabase Edge Functions deployed
- [ ] Database migration applied (password_reset_tokens table)
- [ ] Environment variables configured
- [ ] Email service configured

## Test Environment Setup
- [ ] Clear browser cache and cookies
- [ ] Use incognito/private browsing mode
- [ ] Have a test email account ready
- [ ] Ensure test user exists in Supabase

## 1. Forgot Password Flow

### 1.1 Access Forgot Password Page
- [ ] Navigate to `/auth/forgot-password`
- [ ] Verify page loads correctly
- [ ] Verify form elements are present (email input, submit button)
- [ ] Verify "Back to sign in" link works

### 1.2 Form Validation
- [ ] Submit empty form → Should show "Email is required" error
- [ ] Submit invalid email format → Should show "Please enter a valid email address" error
- [ ] Submit valid email format → Should proceed to API call

### 1.3 API Integration
- [ ] Submit valid email for existing user → Should show success message
- [ ] Submit valid email for non-existing user → Should show same success message (security)
- [ ] Check network tab for POST request to `/functions/v1/forgot-password`
- [ ] Verify request includes email in JSON body
- [ ] Verify response is 200 with success message

### 1.4 Email Delivery
- [ ] Check email inbox for reset link
- [ ] Verify email subject: "Reset Your Password - Nexus Mint"
- [ ] Verify email contains reset button
- [ ] Verify reset URL format: `https://nexus-mint.com/auth/reset?token=...`
- [ ] Verify token is 64-character hex string

### 1.5 Database Verification
- [ ] Check `password_reset_tokens` table for new record
- [ ] Verify token is stored correctly
- [ ] Verify email matches submitted email
- [ ] Verify `used` field is `false`
- [ ] Verify `created_at` and `expires_at` timestamps

## 2. Reset Password Flow

### 2.1 Access Reset Page
- [ ] Click reset link in email
- [ ] Verify redirects to `/auth/reset?token=...`
- [ ] Verify page shows loading state initially
- [ ] Verify token is extracted from URL

### 2.2 Token Validation
- [ ] Check network tab for GET request to `/functions/v1/validate-reset?token=...`
- [ ] Verify request includes Authorization header
- [ ] For valid token → Should show password reset form
- [ ] For invalid token → Should show "Link expired or invalid" error
- [ ] For missing token → Should show "Invalid reset link. Missing token." error

### 2.3 Form Validation
- [ ] Submit empty password → Should show "Password is required" error
- [ ] Submit password < 6 characters → Should show "Password must be at least 6 characters long" error
- [ ] Submit mismatched passwords → Should show "Passwords do not match" error
- [ ] Submit valid passwords → Should proceed to API call

### 2.4 Password Reset API
- [ ] Submit valid form → Should show "Updating..." state
- [ ] Check network tab for POST request to `/functions/v1/reset-password`
- [ ] Verify request includes `{ token, password }` in JSON body
- [ ] Verify response is 200 with success message
- [ ] Verify success page shows "Password updated" message

### 2.5 Database Updates
- [ ] Check `password_reset_tokens` table
- [ ] Verify `used` field is now `true`
- [ ] Verify `used_at` timestamp is set
- [ ] Verify user's password is updated in Supabase auth

## 3. Success Flow

### 3.1 Redirect to Sign In
- [ ] After successful password reset → Should redirect to `/auth/signin` after 3 seconds
- [ ] Verify success message appears: "Your password has been reset successfully!"
- [ ] Verify message disappears on page refresh (state cleared)

### 3.2 Sign In with New Password
- [ ] Enter email and new password
- [ ] Submit sign in form
- [ ] Verify successful authentication
- [ ] Verify redirect to dashboard

## 4. Error Handling

### 4.1 Invalid Token Scenarios
- [ ] Use expired token → Should show "Link expired or invalid" error
- [ ] Use already used token → Should show "Link expired or invalid" error
- [ ] Use non-existent token → Should show "Link expired or invalid" error
- [ ] Verify "Request New Reset Link" button works
- [ ] Verify "Back to sign in" button works

### 4.2 Network Error Handling
- [ ] Disconnect internet → Submit forgot password → Should show "An error occurred" message
- [ ] Disconnect internet → Submit reset password → Should show "An error occurred" message
- [ ] Reconnect internet → Verify forms work again

### 4.3 API Error Handling
- [ ] Test with malformed email → Should show validation error
- [ ] Test with weak password → Should show password strength error
- [ ] Test with invalid JSON → Should show generic error message

## 5. Security Testing

### 5.1 Token Security
- [ ] Verify tokens are cryptographically secure (64 hex chars)
- [ ] Verify tokens expire after 24 hours
- [ ] Verify tokens can only be used once
- [ ] Verify tokens are invalidated after password reset

### 5.2 Rate Limiting
- [ ] Submit multiple forgot password requests rapidly → Should handle gracefully
- [ ] Submit multiple reset password attempts → Should handle gracefully

### 5.3 Information Disclosure
- [ ] Verify no user existence information is leaked
- [ ] Verify error messages don't reveal sensitive information
- [ ] Verify tokens are not logged in client-side console

## 6. Edge Cases

### 6.1 Browser Compatibility
- [ ] Test in Chrome, Firefox, Safari, Edge
- [ ] Test on mobile browsers
- [ ] Test with JavaScript disabled (should show appropriate fallback)

### 6.2 URL Manipulation
- [ ] Manually change token in URL → Should validate and show appropriate error
- [ ] Remove token parameter → Should show "Missing token" error
- [ ] Add extra parameters → Should ignore and use token parameter

### 6.3 Concurrent Usage
- [ ] Open multiple reset links → Should handle gracefully
- [ ] Use same token in multiple tabs → Should work in first tab, fail in others

## 7. Performance Testing

### 7.1 Response Times
- [ ] Forgot password request < 2 seconds
- [ ] Token validation < 1 second
- [ ] Password reset < 2 seconds
- [ ] Page loads < 3 seconds

### 7.2 Database Performance
- [ ] Verify indexes are used for token lookups
- [ ] Verify cleanup job runs daily
- [ ] Verify expired tokens are removed

## 8. Email Testing

### 8.1 Email Content
- [ ] Verify HTML email renders correctly
- [ ] Verify plain text fallback works
- [ ] Verify reset button is clickable
- [ ] Verify fallback URL is copyable

### 8.2 Email Delivery
- [ ] Test with different email providers (Gmail, Outlook, etc.)
- [ ] Check spam folder if email doesn't arrive
- [ ] Verify email headers are correct
- [ ] Verify sender address is legitimate

## 9. Accessibility Testing

### 9.1 Screen Reader Support
- [ ] Verify form labels are properly associated
- [ ] Verify error messages are announced
- [ ] Verify success messages are announced
- [ ] Verify loading states are announced

### 9.2 Keyboard Navigation
- [ ] Verify all form elements are keyboard accessible
- [ ] Verify tab order is logical
- [ ] Verify Enter key submits forms
- [ ] Verify Escape key works appropriately

## 10. Final Verification

### 10.1 End-to-End Flow
- [ ] Complete full flow from forgot password to successful sign in
- [ ] Verify no console errors
- [ ] Verify no network errors
- [ ] Verify all database records are correct

### 10.2 Cleanup
- [ ] Verify expired tokens are cleaned up
- [ ] Verify used tokens are marked appropriately
- [ ] Verify no sensitive data is left in browser storage

## Test Results Summary

- **Total Tests**: [X] / [Y] passed
- **Critical Issues**: [List any blocking issues]
- **Minor Issues**: [List any non-blocking issues]
- **Recommendations**: [Any improvements or optimizations]

## Sign-off

- [ ] QA Engineer: _________________ Date: ________
- [ ] Developer: _________________ Date: ________
- [ ] Product Owner: _________________ Date: ________