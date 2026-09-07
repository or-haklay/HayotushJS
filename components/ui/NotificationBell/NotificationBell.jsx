import React, { useState, useEffect } from "react";
import { View, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import {
  Badge,
  IconButton,
  Portal,
  Modal,
  List,
  Text,
  Button,
  ActivityIndicator,
} from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import notificationService from "../../../services/notificationService";
import { COLORS, SIZING } from "../../../theme/theme";

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  // טעינת התראות בכל פעם שהמסך מתמקד
  useFocusEffect(
    React.useCallback(() => {
      loadNotifications();
    }, [])
  );

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationService.getUserNotifications();
      const notifications = data.notifications || data || [];
      setNotifications(notifications);
    } catch (error) {
      console.error("[NotificationBell] Error loading notifications:", error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      // עדכון הרשימה
      setNotifications((prev) =>
        prev.map((notif) =>
          notif._id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await notificationService.deleteNotification(notificationId);
      // הסרת ההתראה מהרשימה
      setNotifications((prev) =>
        prev.filter((notif) => notif._id !== notificationId)
      );
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      // עדכון כל ההתראות כנקראו
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, isRead: true }))
      );
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const unreadCount = notifications.filter(
    (n) => !n.isRead && !n.isDeleted
  ).length;

  const showModal = () => {
    setVisible(true);
    loadNotifications(); // טען התראות מחדש כשפותחים את המודל
  };
  const hideModal = () => setVisible(false);

  return (
    <>
      <TouchableOpacity onPress={showModal} style={styles.bellContainer}>
        <IconButton icon="bell" size={24} iconColor={COLORS.accent} />
      </TouchableOpacity>

      <Portal>
        <Modal
          visible={visible}
          onDismiss={hideModal}
          contentContainerStyle={styles.modal}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>התראות</Text>
            {unreadCount > 0 && (
              <Button
                mode="text"
                onPress={markAllAsRead}
                style={styles.markAllButton}
              >
                סמן הכל כנקרא
              </Button>
            )}
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollViewContent}
            showsVerticalScrollIndicator={true}
            nestedScrollEnabled={true}
          >
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>טוען התראות...</Text>
              </View>
            ) : notifications.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>אין התראות חדשות</Text>
              </View>
            ) : (
              <List.Section style={styles.notificationsList}>
                {notifications
                  .filter((n) => !n.isDeleted)
                  .map((notification) => (
                    <List.Item
                      key={notification._id}
                      title={notification.title || "ללא כותרת"}
                      description={
                        notification.message || notification.body || "ללא תוכן"
                      }
                      descriptionNumberOfLines={3}
                      titleNumberOfLines={2}
                      left={(props) => (
                        <List.Icon
                          {...props}
                          icon={getNotificationIcon(notification.type)}
                          color={
                            notification.isRead ? COLORS.gray : COLORS.primary
                          }
                        />
                      )}
                      right={(props) => (
                        <View style={styles.notificationActions}>
                          {!notification.isRead && (
                            <TouchableOpacity
                              onPress={() => markAsRead(notification._id)}
                              style={styles.iconButton}
                              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            >
                              <MaterialCommunityIcons
                                name="check-circle-outline"
                                size={24}
                                color={COLORS.primary}
                              />
                            </TouchableOpacity>
                          )}
                          <TouchableOpacity
                            onPress={() => deleteNotification(notification._id)}
                            style={styles.iconButton}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                          >
                            <MaterialCommunityIcons
                              name="delete-outline"
                              size={24}
                              color={COLORS.error}
                            />
                          </TouchableOpacity>
                        </View>
                      )}
                      style={[
                        styles.notificationItem,
                        notification.isRead && styles.readNotification,
                      ]}
                      onPress={() => {
                        if (!notification.isRead) {
                          markAsRead(notification._id);
                        }
                      }}
                    />
                  ))}
              </List.Section>
            )}
          </ScrollView>

          <View style={styles.modalFooter}>
            <Button
              mode="contained"
              onPress={hideModal}
              style={styles.closeButton}
            >
              סגור
            </Button>
          </View>
        </Modal>
      </Portal>
    </>
  );
};

const getNotificationIcon = (type) => {
  switch (type) {
    case "reminder":
      return "bell-ring";
    case "medical":
      return "medical-bag";
    case "expense":
      return "cash";
    case "walk":
      return "walk";
    case "announcement":
      return "bullhorn";
    case "tip":
      return "lightbulb-on";
    case "engagement":
      return "heart";
    case "general":
      return "information";
    default:
      return "information";
  }
};

const styles = StyleSheet.create({
  bellContainer: {
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: COLORS.primary,
  },
  modal: {
    backgroundColor: COLORS.white,
    margin: 10,
    borderRadius: SIZING.radius_lg,
    height: "90%",
    maxHeight: "90%",
    width: "95%",
    maxWidth: 500,
    overflow: "hidden",
    padding: 0,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: SIZING.padding,
    paddingHorizontal: SIZING.padding * 1.5,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray,
    minHeight: 60,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.dark,
  },
  markAllButton: {
    marginLeft: SIZING.base,
  },
  scrollView: {
    flex: 1,
    width: "100%",
  },
  scrollViewContent: {
    paddingBottom: SIZING.padding,
    paddingHorizontal: SIZING.padding,
    flexGrow: 1,
  },
  loadingContainer: {
    padding: SIZING.padding * 2,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: SIZING.base,
    color: COLORS.gray,
    fontSize: 14,
  },
  emptyContainer: {
    padding: SIZING.padding * 2,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    color: COLORS.gray,
    fontSize: 16,
  },
  notificationsList: {
    padding: 0,
    margin: 0,
  },
  notificationItem: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray,
    paddingVertical: SIZING.base,
    minHeight: 80,
  },
  readNotification: {
    opacity: 0.6,
  },
  notificationActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: SIZING.base,
    paddingRight: SIZING.base,
  },
  iconButton: {
    padding: SIZING.base / 2,
    borderRadius: SIZING.radius_sm,
    justifyContent: "center",
    alignItems: "center",
  },
  modalFooter: {
    padding: SIZING.padding,
    paddingHorizontal: SIZING.padding * 1.5,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray,
    minHeight: 60,
  },
  closeButton: {
    backgroundColor: COLORS.primary,
  },
});

export default NotificationBell;
