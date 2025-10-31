import { useEffect, useState ,useRef} from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

import Constants from 'expo-constants';

import {Platform} from 'react-native';

export interface PushNotificationState{
    notification?: Notifications.Notification;
    expoPushToken?: Notifications.ExpoPushToken;
}

export const usePushNotifications = (): PushNotificationState => {
    Notifications.setNotificationHandler({
        handleNotification: async () => ({
            shouldPlaySound: true,
            shouldSetBadge: false,
            shouldShowAlert: true,
        }),
    });

    const [expoPushToken, setExpoPushToken] = useState<Notifications.ExpoPushToken | undefined>(undefined);
    const [notification, setNotification] = useState<Notifications.Notification | undefined>(undefined);

    const notificationListener = useRef<Notifications.EventSubscription>(undefined);
    const responseListener = useRef<Notifications.EventSubscription>(undefined);

    async function registerForPushNotificationsAsync() {
        let token;
        try {
        if (Device.isDevice) {
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;
            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }
            if (finalStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
                if (finalStatus !== 'granted') {
                    throw new Error('Permission for push notifications was denied');
                }
            }

            token = (await Notifications.getExpoPushTokenAsync({projectId: Constants.expoConfig?.extra?.eas?.projectId}));
            if(Platform.OS === 'android') {
                Notifications.setNotificationChannelAsync('default', {
                    name: 'default',
                    importance: Notifications.AndroidImportance.MAX,
                    vibrationPattern: [0, 250, 250, 250],
                    lightColor: '#FF231F7C',
                });
            }
            return token;}
        } catch (error) {
            console.error('Error getting push token:', error);
            throw error;
        }
    }

    useEffect(() => {
        registerForPushNotificationsAsync().then((token) => {
            setExpoPushToken(token);});

        notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
            setNotification(notification);
        });
        responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
            setNotification(response.notification);
        });
        return () => {
            Notifications.removeNotificationSubscription(
                notificationListener.current!
            );

            Notifications.removeNotificationSubscription(
                responseListener.current!
            );
        }
    }, []);

    return { expoPushToken, notification };
}