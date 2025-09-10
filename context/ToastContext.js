import React, { createContext, useContext, useState, useCallback } from "react";
import { View, StyleSheet, Animated, Dimensions } from "react-native";
import { Text, Portal } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, FONTS, SIZING } from "../theme/theme";

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const [queue, setQueue] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const processQueue = useCallback(() => {
    if (queue.length === 0 || isProcessing) return;

    setIsProcessing(true);
    const nextToast = queue[0];
    setQueue((prev) => prev.slice(1));

    setToasts((prev) => [...prev, nextToast]);

    // Auto remove after duration
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== nextToast.id));
      setIsProcessing(false);
      // Process next toast in queue
      setTimeout(() => processQueue(), 100);
    }, nextToast.duration);
  }, [queue, isProcessing]);

  const showToast = useCallback(
    (message, type = "info", duration = 3000) => {
      const id =
        Date.now().toString() + Math.random().toString(36).substr(2, 9);
      const newToast = {
        id,
        message,
        type,
        duration,
      };

      if (isProcessing || toasts.length > 0) {
        // Add to queue if already processing or showing toasts
        setQueue((prev) => [...prev, newToast]);
      } else {
        // Show immediately if no toasts are active
        setToasts([newToast]);
        setIsProcessing(true);

        setTimeout(() => {
          setToasts((prev) => prev.filter((toast) => toast.id !== id));
          setIsProcessing(false);
          // Process queue after current toast
          setTimeout(() => processQueue(), 100);
        }, duration);
      }

      return id;
    },
    [isProcessing, toasts.length, processQueue]
  );

  const hideToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const hideAllToasts = useCallback(() => {
    setToasts([]);
    setQueue([]);
    setIsProcessing(false);
  }, []);

  // Convenience methods
  const showSuccess = useCallback(
    (message, duration = 3000) => {
      return showToast(message, "success", duration);
    },
    [showToast]
  );

  const showError = useCallback(
    (message, duration = 4000) => {
      return showToast(message, "error", duration);
    },
    [showToast]
  );

  const showWarning = useCallback(
    (message, duration = 3500) => {
      return showToast(message, "warning", duration);
    },
    [showToast]
  );

  const showInfo = useCallback(
    (message, duration = 3000) => {
      return showToast(message, "info", duration);
    },
    [showToast]
  );

  const value = {
    showToast,
    hideToast,
    hideAllToasts,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onHide={hideToast} />
    </ToastContext.Provider>
  );
};

const ToastContainer = ({ toasts, onHide }) => {
  return (
    <Portal>
      <View style={styles.container}>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onHide={onHide} />
        ))}
      </View>
    </Portal>
  );
};

const ToastItem = ({ toast, onHide }) => {
  const [opacity] = useState(new Animated.Value(0));
  const [translateY] = useState(new Animated.Value(-50));

  React.useEffect(() => {
    // Animate in
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Animate out before removing
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: -50,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onHide(toast.id);
      });
    }, toast.duration - 300);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, opacity, translateY, onHide]);

  const getToastStyle = () => {
    switch (toast.type) {
      case "success":
        return {
          backgroundColor: "#4CAF50",
          borderLeftColor: "#2E7D32",
        };
      case "error":
        return {
          backgroundColor: "#F44336",
          borderLeftColor: "#C62828",
        };
      case "warning":
        return {
          backgroundColor: "#FF9800",
          borderLeftColor: "#F57C00",
        };
      case "info":
      default:
        return {
          backgroundColor: "#2196F3",
          borderLeftColor: "#1565C0",
        };
    }
  };

  const getIcon = () => {
    switch (toast.type) {
      case "success":
        return "checkmark-circle";
      case "error":
        return "close-circle";
      case "warning":
        return "warning";
      case "info":
      default:
        return "information-circle";
    }
  };

  return (
    <Animated.View
      style={[
        styles.toast,
        getToastStyle(),
        {
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      <Ionicons name={getIcon()} size={20} color="white" style={styles.icon} />
      <Text style={styles.message}>{toast.message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 50,
    left: 16,
    right: 16,
    zIndex: 9999,
  },
  toast: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  icon: {
    marginRight: 12,
  },
  message: {
    ...FONTS.body,
    color: "white",
    flex: 1,
    fontWeight: "500",
  },
});

export default ToastProvider;
