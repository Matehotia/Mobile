import React, { createContext, useContext, useState, useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

type NotificationContextType = {
  scheduleEventNotification: (title: string, body: string, date: Date) => Promise<string>;
  scheduleSleepReminder: (time: Date) => Promise<string>;
  cancelNotification: (id: string) => Promise<void>;
  requestPermissions: () => Promise<boolean>;
};

const NotificationContext = createContext<NotificationContextType | null>(null);

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    configureNotifications();
  }, []);

  const configureNotifications = async () => {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }
  };

  const requestPermissions = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  };

  const scheduleEventNotification = async (title: string, body: string, date: Date) => {
    const trigger = date.getTime() - Date.now();
    if (trigger < 0) return ''; // Ne pas programmer si la date est passée

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: {
        seconds: Math.floor(trigger / 1000),
        channelId: 'default',
      },
    });

    return id;
  };

  const scheduleSleepReminder = async (time: Date) => {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: "C'est l'heure de dormir !",
        body: 'Maintenez un rythme de sommeil régulier pour votre bien-être.',
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: {
        channelId: 'default',
        hour: time.getHours(),
        minute: time.getMinutes(),
        repeats: true,
      },
    });

    return id;
  };

  const cancelNotification = async (id: string) => {
    await Notifications.cancelScheduledNotificationAsync(id);
  };

  return (
    <NotificationContext.Provider
      value={{
        scheduleEventNotification,
        scheduleSleepReminder,
        cancelNotification,
        requestPermissions,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
