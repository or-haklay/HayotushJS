// services/verificationService.js
// Email verification service

import httpServices from "./httpServices";

/**
 * Send email verification code
 * @param {string} email - Email address (optional if user is authenticated)
 * @returns {Promise<Object>}
 */
export async function sendVerificationCode(email) {
  try {
    const response = await httpServices.post("/verification/email/send", {
      email,
    });
    return response.data;
  } catch (error) {
    console.error("Error sending verification code:", error);
    throw error;
  }
}

/**
 * Verify email verification code
 * @param {string} code - Verification code
 * @returns {Promise<Object>}
 */
export async function verifyCode(code) {
  try {
    const response = await httpServices.post("/verification/email/verify", {
      code,
    });
    return response.data;
  } catch (error) {
    console.error("Error verifying code:", error);
    throw error;
  }
}

/**
 * Resend verification code
 * @param {string} email - Email address (optional if user is authenticated)
 * @returns {Promise<Object>}
 */
export async function resendVerificationCode(email) {
  try {
    const response = await httpServices.post("/verification/resend", {
      email,
      resend: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error resending verification code:", error);
    throw error;
  }
}

/**
 * Get verification status
 * @returns {Promise<Object>}
 */
export async function getVerificationStatus() {
  try {
    const response = await httpServices.get("/verification/status");
    return response.data;
  } catch (error) {
    console.error("Error getting verification status:", error);
    throw error;
  }
}








