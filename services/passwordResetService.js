// services/passwordResetService.js
// Password reset service

import httpServices from "./httpServices";

/**
 * Request password reset (forgot password)
 * @param {string} email - Email address
 * @returns {Promise<Object>}
 */
export async function forgotPassword(email) {
  try {
    const response = await httpServices.post("/auth/forgot-password", {
      email,
    });
    return response.data;
  } catch (error) {
    console.error("Error requesting password reset:", error);
    throw error;
  }
}

/**
 * Verify password reset code
 * @param {string} email - Email address
 * @param {string} code - Verification code
 * @returns {Promise<Object>}
 */
export async function verifyResetCode(email, code) {
  try {
    const response = await httpServices.post("/auth/verify-reset-code", {
      email,
      code,
    });
    return response.data;
  } catch (error) {
    console.error("Error verifying reset code:", error);
    throw error;
  }
}

/**
 * Reset password with verified code
 * @param {string} email - Email address
 * @param {string} code - Verification code
 * @param {string} newPassword - New password
 * @returns {Promise<Object>}
 */
export async function resetPassword(email, code, newPassword) {
  try {
    const response = await httpServices.post("/auth/reset-password", {
      email,
      code,
      newPassword,
    });
    return response.data;
  } catch (error) {
    console.error("Error resetting password:", error);
    throw error;
  }
}

/**
 * Resend password reset code
 * @param {string} email - Email address
 * @returns {Promise<Object>}
 */
export async function resendResetCode(email) {
  try {
    const response = await httpServices.post("/auth/resend-reset-code", {
      email,
      resend: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error resending reset code:", error);
    throw error;
  }
}








