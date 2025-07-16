# Password Reset Flow QA Checklist

## Overview
This document provides a comprehensive QA checklist for testing the complete password reset flow, from generating the reset link to successfully changing the password.

## Test Environment Setup

### Prerequisites
- [ ] Supabase project is properly configured
- [ ] Environment variables are set:
  - `RESEND_API_KEY` for email sending
  - `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
  - `SITE_URL` for correct reset link generation
- [ ] Database migration for `password_reset_tokens` table has been applied
- [ ] Supabase Edge Functions are deployed:
  - `auth-forgot-password`
  - `auth-validate-reset`
  - `auth-reset-password`

### Test Data
- [ ] Create test user accounts with known emails and passwords
- [ ] Have access to email accounts for testing link delivery
- [ ] Clear any existing password reset tokens for test users

## 1. Forgot Password Page Testing (`/auth/forgot-password`)

### UI/UX Tests
- [ ] Page loads correctly at `/auth/forgot-password`
- [ ] Form has email input field with proper validation
- [ ] "Send reset link" button is present and functional
- [ ] "Back to sign in" link navigates to `/auth/signin`
- [ ] Error messages display properly for invalid inputs

### Form Validation Tests
- [ ] **Empty email**: Shows "Email is required" error
- [ ] **Invalid email format**: Shows "Please enter a valid email address" error
- [ ] **Valid email**: Proceeds without client-side errors

### Backend Integration Tests
- [ ] **Valid existing user email**: 
  - Returns success response
  - Shows "Check your email" confirmation screen
  - Displays user's email address in confirmation
- [ ] **Non-existent email**: 
  - Returns success response (security measure)
  - Shows same "Check your email" confirmation screen
- [ ] **Network error**: Shows appropriate error message

### Email Delivery Tests
- [ ] **Email sent successfully** for valid users:
  - Email arrives within reasonable time (< 2 minutes)
  - Subject line: "Reset Your Password - Nexus Mint"
  - From address: "Nexus Mint <noreply@nexusmint.com>"
  - Email contains reset link with correct format: `/auth/reset?token=...`
  - Reset link token is a valid UUID
  - Email template renders correctly (HTML formatting)
  - Email includes expiry information (1 hour)

## 2. Token Generation and Storage

### Database Tests
- [ ] **Token creation**: New record created in `password_reset_tokens` table
- [ ] **Token format**: Token is a valid UUID format
- [ ] **Expiry time**: `expires_at` is set to 1 hour from creation
- [ ] **User association**: `user_id` correctly links to the requesting user
- [ ] **Email storage**: `email` field matches the request
- [ ] **Initial state**: `used_at` is null for new tokens

### Security Tests
- [ ] **Token uniqueness**: Each generated token is unique
- [ ] **Token randomness**: Tokens are cryptographically secure
- [ ] **No token leakage**: Tokens not exposed in logs or responses

## 3. Reset Link Validation (`/auth/reset?token=...`)

### Route and Token Parsing
- [ ] **Correct route**: Page loads at `/auth/reset` (not `/auth/reset-password`)
- [ ] **Token extraction**: Token is correctly parsed from URL query parameter
- [ ] **Loading state**: Shows validation spinner while checking token

### Token Validation API (`GET /api/auth/validate-reset`)
- [ ] **Valid, unexpired token**:
  - Returns `{ valid: true, email: "user@example.com" }`
  - Shows password reset form
  - Displays user's email address
- [ ] **Invalid token**:
  - Returns `{ valid: false, error: "Invalid token" }`
  - Shows error page with "Invalid Reset Link" message
- [ ] **Expired token**:
  - Returns `{ valid: false, error: "Token has expired" }`
  - Shows error page with expiry message
- [ ] **Used token**:
  - Returns `{ valid: false, error: "Token has already been used" }`
  - Shows error page with used token message
- [ ] **Missing token**:
  - Returns `{ valid: false, error: "Token is required" }`
  - Shows error page

### Error Handling
- [ ] **Invalid token page**:
  - Shows clear error message
  - Provides "Request New Reset Link" button
  - Provides "Back to Sign In" button
  - Both buttons navigate correctly

## 4. Password Reset Form

### UI/UX Tests
- [ ] **Form rendering**:
  - Shows "Reset your password" title
  - Displays user's email address
  - Has "New Password" field with show/hide toggle
  - Has "Confirm New Password" field with show/hide toggle
  - Has "Update Password" submit button
- [ ] **Field interactions**:
  - Password visibility toggles work correctly
  - Fields accept input properly
  - Form is responsive and accessible

### Form Validation
- [ ] **Client-side validation**:
  - Empty password: Shows "Password is required"
  - Short password: Shows "Password must be at least 6 characters long"
  - Empty confirmation: Shows "Please confirm your password"
  - Mismatched passwords: Shows "Passwords do not match"
  - Valid inputs: No validation errors

## 5. Password Update Process (`POST /api/auth/reset-password`)

### API Tests
- [ ] **Valid request**:
  - Accepts `{ token, password }` payload
  - Returns `{ success: true }` on successful update
  - Updates user's password in Supabase Auth
  - Marks token as used (`used_at` timestamp set)
- [ ] **Invalid token**: Returns 400 with appropriate error
- [ ] **Expired token**: Returns 400 with expiry error
- [ ] **Used token**: Returns 400 with already used error
- [ ] **Weak password**: Returns 400 with password requirements error

### Success Flow
- [ ] **Password update success**:
  - Shows success page with green checkmark
  - Displays "Password Updated" confirmation
  - Shows "Continue to Sign In" button
  - Auto-redirects after 3 seconds
  - Includes success message in redirect state

## 6. Post-Reset Flow

### Sign In Integration
- [ ] **Redirect to sign in**:
  - Redirects to `/auth/signin`
  - Shows green success banner: "Your password has been reset successfully..."
  - Success message clears after navigation
- [ ] **Password verification**:
  - User can sign in with new password
  - Old password no longer works
  - Sign in redirects to dashboard successfully

### Token Cleanup
- [ ] **Used token handling**:
  - Token marked as used cannot be reused
  - Second attempt shows "already used" error
  - No new tokens created for same email within cooldown

## 7. Security Tests

### Token Security
- [ ] **Token expiry enforcement**: Expired tokens rejected after 1 hour
- [ ] **Single use tokens**: Used tokens cannot be reused
- [ ] **Token isolation**: User A's token cannot reset User B's password
- [ ] **Token cleanup**: Expired tokens should be cleaned up (manual verification)

### Email Security
- [ ] **No email enumeration**: Same response for valid/invalid emails
- [ ] **Rate limiting**: Multiple requests handled gracefully
- [ ] **Email content**: No sensitive information in email content

### Password Security
- [ ] **Password requirements**: Minimum 6 characters enforced
- [ ] **Password hashing**: New password properly hashed in database
- [ ] **Session invalidation**: Consider if active sessions should be terminated

## 8. Error Scenarios and Edge Cases

### Network and Server Errors
- [ ] **Email service down**: Graceful error handling
- [ ] **Database connection issues**: Appropriate error messages
- [ ] **Invalid JSON payloads**: Proper error responses
- [ ] **CORS issues**: Cross-origin requests work correctly

### User Experience Edge Cases
- [ ] **Multiple reset requests**: Handling multiple active tokens
- [ ] **Browser back/forward**: Navigation works correctly
- [ ] **Page refresh**: State maintained appropriately
- [ ] **Direct URL access**: All routes accessible directly

### Mobile and Browser Compatibility
- [ ] **Mobile responsiveness**: Forms work on mobile devices
- [ ] **Browser compatibility**: Works across major browsers
- [ ] **Email client compatibility**: Email renders in various clients

## 9. Performance Tests

### Response Times
- [ ] **Forgot password request**: < 2 seconds
- [ ] **Token validation**: < 1 second
- [ ] **Password reset**: < 2 seconds
- [ ] **Email delivery**: < 2 minutes

### Concurrent Users
- [ ] **Multiple simultaneous requests**: System handles load
- [ ] **Database performance**: No performance degradation

## 10. Integration Tests

### End-to-End Flow
- [ ] **Complete happy path**:
  1. User visits forgot password page
  2. Enters email and submits
  3. Receives email with reset link
  4. Clicks link and lands on reset page
  5. Token validates successfully
  6. Enters and confirms new password
  7. Password updates successfully
  8. Redirects to sign in with success message
  9. Signs in with new password successfully

### Error Recovery Flows
- [ ] **Expired link recovery**: User can request new link
- [ ] **Invalid link recovery**: User gets clear error and recovery options
- [ ] **Email delivery issues**: User can retry request

## Test Results Summary

### Environment: [Staging/Production]
### Date: [Test Date]
### Tester: [Tester Name]

#### ✅ Passed Tests: 
- [ ] All basic functionality working
- [ ] Email delivery functioning
- [ ] Security measures in place
- [ ] Error handling appropriate
- [ ] Performance acceptable

#### ❌ Failed Tests:
- [ ] List any failing tests
- [ ] Include error details
- [ ] Note any blockers

#### 🔄 Needs Retesting:
- [ ] List tests that need to be run again
- [ ] Include reasons for retest

#### 📝 Notes:
- [ ] Additional observations
- [ ] Performance notes
- [ ] User experience feedback

## Sign-off

- [ ] **Developer**: Code reviewed and tests passing
- [ ] **QA**: All test scenarios completed successfully  
- [ ] **Product**: User experience approved
- [ ] **Security**: Security requirements verified
- [ ] **Ready for Production**: All stakeholders approve