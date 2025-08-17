import React, { useState, useEffect } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import {
  Badge,
  IconButton,
  Portal,
  Modal,
  List,
  Text,
  Button,
} from "react-native-paper";
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
      setNotifications(data.notifications || []);
    } catch (error) {
      console.error("Error loading notifications:", error);
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

  const showModal = () => setVisible(true);
  const hideModal = () => setVisible(false);

  return (
    <>
      <TouchableOpacity onPress={showModal} style={styles.bellContainer}>
        <IconButton icon="bell" size={24} iconColor={COLORS.dark} />
        {unreadCount > 0 && (
          <Badge size={20} style={styles.badge}>
            {unreadCount > 99 ? "99+" : unreadCount}
          </Badge>
        )}
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

          {loading ? (
            <View style={styles.loadingContainer}>
              <Text>טוען התראות...</Text>
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
                    title={notification.title}
                    description={notification.message}
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
                          <Button
                            mode="text"
                            onPress={() => markAsRead(notification._id)}
                            style={styles.actionButton}
                          >
                            סמן כנקרא
                          </Button>
                        )}
                        <Button
                          mode="text"
                          onPress={() => deleteNotification(notification._id)}
                          style={styles.deleteButton}
                        >
                          מחק
                        </Button>
                      </View>
                    )}
                    style={[
                      styles.notificationItem,
                      notification.isRead && styles.readNotification,
                    ]}
                  />
                ))}
            </List.Section>
          )}

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
    margin: 20,
    borderRadius: SIZING.radius_lg,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: SIZING.padding,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.dark,
  },
  markAllButton: {
    marginLeft: SIZING.base,
  },
  loadingContainer: {
    padding: SIZING.padding * 2,
    alignItems: "center",
  },
  emptyContainer: {
    padding: SIZING.padding * 2,
    alignItems: "center",
  },
  emptyText: {
    color: COLORS.gray,
    fontSize: 16,
  },
  notificationsList: {
    flex: 1,
  },
  notificationItem: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray,
  },
  readNotification: {
    opacity: 0.6,
  },
  notificationActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    marginRight: SIZING.base,
  },
  deleteButton: {
    color: COLORS.error,
  },
  modalFooter: {
    padding: SIZING.padding,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray,
  },
  closeButton: {
    backgroundColor: COLORS.primary,
  },
});

export default NotificationBell;
