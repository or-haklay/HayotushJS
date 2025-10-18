import React, { useState, useRef } from "react";
import { View, StyleSheet, Alert, Platform } from "react-native";
import { WebView } from "react-native-webview";
import { Button, Text, ActivityIndicator } from "react-native-paper";
import { COLORS, SIZING } from "../../theme/theme";

export default function SecureWebViewAuth({
  authUrl,
  redirectUri,
  onSuccess,
  onError,
  onCancel,
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const webViewRef = useRef(null);

  // Security configuration for WebView
  const webViewConfig = {
    // Security headers
    allowsInlineMediaPlayback: false,
    allowsAirPlayForMediaPlayback: false,
    allowsBackForwardNavigationGestures: false,
    allowsLinkPreview: false,

    // Content security
    javaScriptEnabled: true,
    domStorageEnabled: false,
    thirdPartyCookiesEnabled: false,

    // Platform-specific security
    ...(Platform.OS === "ios" && {
      allowsInlineMediaPlayback: false,
      mediaPlaybackRequiresUserAction: true,
    }),

    ...(Platform.OS === "android" && {
      mixedContentMode: "never",
      allowsProtectedMedia: false,
    }),
  };

  const handleNavigationStateChange = (navState) => {
    const { url } = navState;

    // Check if this is our redirect URI
    if (url.startsWith(redirectUri)) {
      setLoading(false);

      try {
        // Parse the URL for auth parameters
        const urlObj = new URL(url);
        const code = urlObj.searchParams.get("code");
        const state = urlObj.searchParams.get("state");
        const error = urlObj.searchParams.get("error");

        if (error) {
          setError(error);
          onError && onError(error);
          return;
        }

        if (code && state) {
          onSuccess && onSuccess({ code, state });
        } else {
          setError("Invalid response from authentication server");
          onError && onError("Invalid response");
        }
      } catch (err) {
        console.error("Error parsing auth response:", err);
        setError("Failed to parse authentication response");
        onError && onError("Parse error");
      }
    }
  };

  const handleError = (syntheticEvent) => {
    const { nativeEvent } = syntheticEvent;
    console.error("WebView error:", nativeEvent);
    setError("Authentication failed. Please try again.");
    onError && onError("WebView error");
  };

  const handleLoadStart = () => {
    setLoading(true);
    setError(null);
  };

  const handleLoadEnd = () => {
    setLoading(false);
  };

  const handleCancel = () => {
    onCancel && onCancel();
  };

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Authentication Error</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <Button
            mode="contained"
            onPress={handleCancel}
            style={styles.retryButton}
          >
            Close
          </Button>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading authentication...</Text>
        </View>
      )}

      <WebView
        ref={webViewRef}
        source={{ uri: authUrl }}
        style={styles.webView}
        onNavigationStateChange={handleNavigationStateChange}
        onError={handleError}
        onLoadStart={handleLoadStart}
        onLoadEnd={handleLoadEnd}
        {...webViewConfig}
      />

      <View style={styles.buttonContainer}>
        <Button
          mode="outlined"
          onPress={handleCancel}
          style={styles.cancelButton}
          labelStyle={styles.cancelButtonLabel}
        >
          Cancel
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  webView: {
    flex: 1,
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  loadingText: {
    marginTop: SIZING.base,
    fontSize: 16,
    color: COLORS.gray,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SIZING.margin,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.dark,
    marginBottom: SIZING.base,
  },
  errorMessage: {
    fontSize: 14,
    color: COLORS.gray,
    textAlign: "center",
    marginBottom: SIZING.margin,
    lineHeight: 20,
  },
  buttonContainer: {
    padding: SIZING.margin,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  cancelButton: {
    borderColor: COLORS.gray,
  },
  cancelButtonLabel: {
    color: COLORS.gray,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
  },
});
