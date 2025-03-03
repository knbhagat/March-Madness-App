# Flask API Integration Tests:

This repository contains integration tests for the Flask API, ensuring the backend routes function as expected. The tests cover various endpoints such as authentication, user actions, and error handling

Requirements:

Node.js
NPM
Axios
Jest
Supertest

# Commands:

To run all the tests, simply use the following command: npm test

# Test Coverage

The following API routes are tested:

GET /: Verifies the root endpoint 
GET /auth/register: Verifies the registration endpoint
GET /auth/login: Verifies the login endpoint
GET /auth/logout: Verifies the logout endpoint
GET /auth/delete-account: Verifies the delete account endpoint
GET /auth/forgot-password: Verifies the forgot password endpoint
GET /auth/reset-password: Verifies the reset password endpoint
GET /auth/change-password: Verifies the change password endpoint
GET /auth/verify-email: Verifies the email verification endpoint
GET /auth/resend-verification: Verifies the resend email verification endpoint
GET /auth/update-profile: Verifies the update profile endpoint
404 Not Found: Verifies that a non-existent route returns a 404 Not Found error
500 Internal Server Error: Verifies that a route triggers a 500 Internal Server Error
