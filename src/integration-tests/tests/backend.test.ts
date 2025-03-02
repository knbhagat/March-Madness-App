import axios from 'axios';
// Url of Flask backend
const backendUrl = 'http://localhost:8000';
// API endpoint tests
describe('Flask API Tests', () => {
  // Root Url
  describe('Root endpoint', () => {
    // Root endpoint
    it('should return "Hello, World!" from the root endpoint', async () => {
      const response = await axios.get(`${backendUrl}/`);
      expect(response.status).toBe(200);
      expect(response.data.message).toBe('Hello, World!');
    });
  });
  // User Signing in and out of account
  describe('Log in, Log out endpoints', () => {
    // Login
    it('should return "Login endpoint" from /auth/login', async () => {
      const response = await axios.get(`${backendUrl}/auth/login`);
      expect(response.status).toBe(200);
      expect(response.data.message).toBe('Login endpoint');
    });
    // Logout
    it('should return "Logout endpoint" from /auth/logout', async () => {
      const response = await axios.get(`${backendUrl}/auth/logout`);
      expect(response.status).toBe(200);
      expect(response.data.message).toBe('Logout endpoint');
    });
  });
  // User Registering and Deleting Account
  describe('Registration, Deletion endpoints', () => {
    // Sign Up
    it('should return "Register endpoint" from /auth/register', async () => {
      const response = await axios.get(`${backendUrl}/auth/register`);
      expect(response.status).toBe(200);
      expect(response.data.message).toBe('Register endpoint');
    });
    // Delete account
    it('should return "Delete account endpoint" from /auth/delete-account', async () => {
      const response = await axios.get(`${backendUrl}/auth/delete-account`);
      expect(response.status).toBe(200);
      expect(response.data.message).toBe('Delete account endpoint');
    });
  });
  // User forgotting, resetting, or changing password of account
  describe("Password endpoints", () => {
    // forgot password
    it('should return "Forgot password endpoint" from /auth/forgot-password', async () => {
      const response = await axios.get(`${backendUrl}/auth/forgot-password`);
      expect(response.status).toBe(200);
      expect(response.data.message).toBe('Forgot password endpoint');
    });
    // reset password
    it('should return "Reset password endpoint" from /auth/reset-password', async () => {
      const response = await axios.get(`${backendUrl}/auth/reset-password`);
      expect(response.status).toBe(200);
      expect(response.data.message).toBe('Reset password endpoint');
    });
    // change password
    it('should return "Change password endpoint" from /auth/change-password', async () => {
      const response = await axios.get(`${backendUrl}/auth/change-password`);
      expect(response.status).toBe(200);
      expect(response.data.message).toBe('Change password endpoint');
    });
  });
  // Email verification
  describe("Email endpoints", () => {
    // verify email
    it('should return "Verify email endpoint" from /auth/verify-email', async () => {
      const response = await axios.get(`${backendUrl}/auth/verify-email`);
      expect(response.status).toBe(200);
      expect(response.data.message).toBe('Verify email endpoint');
    });
    // resend verification
    it('should return "Resend verification endpoint" from /auth/resend-verification', async () => {
      const response = await axios.get(`${backendUrl}/auth/resend-verification`);
      expect(response.status).toBe(200);
      expect(response.data.message).toBe('Resend verification endpoint');
    });
  });
  // User profile updates
  describe('Profile endpoint', () => {
    // update profile
    it('should return "Update profile endpoint" from /auth/update-profile', async () => {
      const response = await axios.get(`${backendUrl}/auth/update-profile`);
      expect(response.status).toBe(200);
      expect(response.data.message).toBe('Update profile endpoint');
    });
  });
});
// Tests Error Handling
describe('Flask API Error Handling Tests', () => {
  // Not Found Error
  describe('404 Not Found', () => {
    it('should return 404 for a non-existent endpoint', async () => {
      try {
        await axios.get(`${backendUrl}/non-existent-route`);
      } catch (error: any) {
        expect(error.response.status).toBe(404);
        expect(error.response.data.message).toBe('Not Found Error');

      }
    });
  });
  // Internal Server Error
  describe('500 Internal Server Error', () => {
    it('should return 500 when the server encounters an error', async () => {
      try {
        await axios.get(`${backendUrl}/some-500-error-route`);
      } catch (error: any) {
        expect(error.response.status).toBe(500);
        expect(error.response.data.message).toBe('Internal Server Error');
      }
    });
  });
});