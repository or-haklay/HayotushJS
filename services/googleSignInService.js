// services/googleSignInService.js
// Google Sign-In service using native SDK

import Constants from 'expo-constants';

// Lazy load the Google Sign-In module to avoid errors in Expo Go
let GoogleSignin = null;
let statusCodes = null;
let moduleLoadError = null; // Cache the error to avoid repeated attempts

async function loadGoogleSignIn() {
  // If we already tried and failed, return early
  if (moduleLoadError) {
    return { GoogleSignin: null, statusCodes: null };
  }
  
  // If already loaded successfully, return cached
  if (GoogleSignin) return { GoogleSignin, statusCodes };
  
  try {
    // Check if we're in Expo Go - native modules won't work there
    // ב-Expo Go: executionEnvironment === 'storeClient'
    // ב-development build: executionEnvironment !== 'storeClient'
    const isExpoGo = Constants?.executionEnvironment === 'storeClient';
    
    // Also check if running in bare workflow but module might not be linked
    if (isExpoGo) {
      console.log('⚠️ Google Sign-In native module not available in Expo Go');
      console.log('ℹ️ Please use a development build: npx expo run:android');
      moduleLoadError = new Error('Expo Go detected');
      return { GoogleSignin: null, statusCodes: null };
    }

    // Try to load the module with error handling for native module initialization
    // We use a Promise wrapper to catch synchronous errors during module evaluation
    let module;
    try {
      // Wrap in Promise.resolve to ensure we can catch synchronous errors
      module = await Promise.resolve().then(async () => {
        try {
          return await import('@react-native-google-signin/google-signin');
        } catch (e) {
          // Re-throw with better context
          throw e;
        }
      });
    } catch (importError) {
      // Handle the case where the module fails to initialize due to missing native module
      const errorMessage = importError?.message || '';
      const errorName = importError?.name || '';
      
      if (errorMessage.includes('TurboModuleRegistry') || 
          errorMessage.includes('RNGoogleSignin') ||
          errorMessage.includes('could not be found') ||
          errorName === 'Invariant Violation') {
        console.warn('⚠️ Google Sign-In native module is not linked');
        console.warn('ℹ️ Solution: Rebuild your app with:');
        console.warn('   npx expo run:android');
        console.warn('   OR build a development client: eas build --profile development --platform android');
        moduleLoadError = importError;
        return { GoogleSignin: null, statusCodes: null };
      }
      throw importError;
    }
    
    // Check if module loaded successfully
    if (!module || !module.GoogleSignin) {
      const error = new Error('Module loaded but GoogleSignin is missing');
      moduleLoadError = error;
      return { GoogleSignin: null, statusCodes: null };
    }
    
    GoogleSignin = module.GoogleSignin;
    statusCodes = module.statusCodes;
    
    // Verify the module is actually available (not just imported)
    if (!GoogleSignin || typeof GoogleSignin.configure !== 'function') {
      console.warn('⚠️ Google Sign-In module loaded but not properly initialized');
      console.warn('ℹ️ Make sure you ran: npx expo run:android');
      moduleLoadError = new Error('Module not properly initialized');
      return { GoogleSignin: null, statusCodes: null };
    }
    
    return { GoogleSignin, statusCodes };
  } catch (error) {
    // Catch any other errors during module loading
    const errorMessage = error?.message || '';
    const errorName = error?.name || '';
    
    if (errorMessage.includes('TurboModuleRegistry') || 
        errorMessage.includes('RNGoogleSignin') ||
        errorMessage.includes('could not be found') ||
        errorName === 'Invariant Violation') {
      console.warn('⚠️ Google Sign-In native module is not linked');
      console.warn('ℹ️ Solution: Rebuild your app with:');
      console.warn('   npx expo run:android');
      console.warn('   OR build a development client: eas build --profile development --platform android');
      moduleLoadError = error;
    } else {
      console.warn('⚠️ Failed to load Google Sign-In module:', error?.message || error);
      console.warn('ℹ️ This usually means:');
      console.warn('   1. You are running in Expo Go (use dev build instead)');
      console.warn('   2. The native module is not linked (run: npx expo prebuild && npx expo run:android)');
      console.warn('   3. The app was not rebuilt after adding the package');
      moduleLoadError = error;
    }
    return { GoogleSignin: null, statusCodes: null };
  }
}

class GoogleSignInService {
  constructor() {
    this.isConfigured = false;
  }

  // Configure Google Sign-In
  async configure() {
    if (this.isConfigured) {
      return;
    }

    try {
      const { GoogleSignin: gsi } = await loadGoogleSignIn();
      if (!gsi) {
        console.log('⚠️ Google Sign-In module not available');
        return;
      }

      // Get client IDs from app config
      const webClientId =
        Constants.expoConfig?.extra?.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
      const iosClientId =
        Constants.expoConfig?.extra?.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
      const androidClientId =
        Constants.expoConfig?.extra?.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;

      if (!webClientId) {
        console.error('❌ Google Web Client ID is missing in app.json');
        return;
      }

      // Configure Google Sign-In
      gsi.configure({
        webClientId: webClientId, // Required for server-side authentication
        iosClientId: iosClientId, // Optional: for iOS
        offlineAccess: true, // Required to get serverAuthCode
        scopes: ['profile', 'email'],
      });

      this.isConfigured = true;
    } catch (error) {
      console.error('❌ Error configuring Google Sign-In:', error);
    }
  }

  // Sign in with Google
  async signIn() {
    try {
      await this.configure();

      const { GoogleSignin: gsi, statusCodes: codes } = await loadGoogleSignIn();
      if (!gsi) {
        return {
          success: false,
          error: 'Google Sign-In is not available in this environment',
        };
      }

      // Check if Google Play Services are available (Android only)
      await gsi.hasPlayServices();

      // Sign in
      const userInfo = await gsi.signIn();

      // Get tokens
      const tokens = await gsi.getTokens();
      const serverAuthCode = tokens?.serverAuthCode;
      const idToken = userInfo.idToken || tokens?.idToken;


      return {
        success: true,
        user: {
          id: userInfo.user.id,
          email: userInfo.user.email,
          name: userInfo.user.name,
          photo: userInfo.user.photo,
        },
        idToken: idToken,
        serverAuthCode: serverAuthCode,
      };
    } catch (error) {
      console.error('❌ Google Sign-In error:', error);

      const { statusCodes: codes } = await loadGoogleSignIn();
      if (!codes) {
        return {
          success: false,
          error: error.message || 'Google Sign-In failed',
        };
      }

      if (error.code === codes.SIGN_IN_CANCELLED) {
        return {
          success: false,
          cancelled: true,
          error: 'User cancelled the sign-in',
        };
      } else if (error.code === codes.IN_PROGRESS) {
        return {
          success: false,
          error: 'Sign-in is already in progress',
        };
      } else if (error.code === codes.PLAY_SERVICES_NOT_AVAILABLE) {
        return {
          success: false,
          error: 'Google Play Services are not available',
        };
      } else {
        return {
          success: false,
          error: error.message || 'Google Sign-In failed',
        };
      }
    }
  }

  // Sign out from Google
  async signOut() {
    try {
      const { GoogleSignin: gsi } = await loadGoogleSignIn();
      if (!gsi) {
        return { success: false, error: 'Google Sign-In module not available' };
      }
      
      await gsi.signOut();
      return { success: true };
    } catch (error) {
      console.error('❌ Google Sign-Out error:', error);
      return { success: false, error: error.message };
    }
  }

  // Get current user (if signed in)
  async getCurrentUser() {
    try {
      const { GoogleSignin: gsi } = await loadGoogleSignIn();
      if (!gsi) {
        return null;
      }

      const isSignedIn = await gsi.isSignedIn();
      if (!isSignedIn) {
        return null;
      }

      const userInfo = await gsi.getCurrentUser();
      return userInfo?.user || null;
    } catch (error) {
      console.error('❌ Error getting current user:', error);
      return null;
    }
  }

  // Revoke access
  async revokeAccess() {
    try {
      const { GoogleSignin: gsi } = await loadGoogleSignIn();
      if (!gsi) {
        return { success: false, error: 'Google Sign-In module not available' };
      }

      await gsi.revokeAccess();
      return { success: true };
    } catch (error) {
      console.error('❌ Error revoking Google access:', error);
      return { success: false, error: error.message };
    }
  }
}

export default new GoogleSignInService();

