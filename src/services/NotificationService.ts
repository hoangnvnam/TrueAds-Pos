import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform, Vibration } from 'react-native';
import { axiosParent } from '~/configs/axios';

Notifications.setNotificationHandler({
  handleNotification: async () => {
    return {
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    };
  },
  handleError(notificationId, error) {
    console.log('handleError', notificationId, error);
  },
});

// export function configurePushNotifications() {
//   Notifications.setNotificationCategoryAsync('default', [
//     {
//       identifier: 'open-message',
//       buttonTitle: 'Open Message',
//       options: {
//         opensAppToForeground: true,
//       },
//     },
//   ]).catch((error) => {
//     console.log('Error configuring notification categories:', error);
//   });
// }

export async function registerForPushNotificationsAsync(userId: string) {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return;
    }

    const existingToken = await AsyncStorage.getItem('expoPushToken');

    if (existingToken) {
      return existingToken;
    }
    const regis = await Notifications.getExpoPushTokenAsync({
      projectId: '77d7cbe7-b348-4286-b26e-cb9a54f70af6',
    });

    token = regis.data;

    await AsyncStorage.setItem('expoPushToken', token);

    try {
      await registerDeviceOnServer(token, userId);
    } catch (error) {
      console.log('Error registering push token on server:', error);
    }
  }

  // configurePushNotifications();

  return token;
}

async function registerDeviceOnServer(token: string, userId: string) {
  try {
    const res = await axiosParent.post('/register-push-token', {
      token,
      userId,
      platform: Device.manufacturer + '_' + Device.modelName,
    });
  } catch (error: any) {
    console.error('Failed to register push token:', error?.response?.data || error?.message || error);
    throw error;
  }
}

export async function scheduleLocalNotification(title: string, body: string, data: any = {}) {
  Vibration.vibrate([0, 250, 250, 250]);
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
      sound: true,
      priority: Notifications.AndroidNotificationPriority.MAX,
      badge: 1,
    },
    trigger: null,
  });
}
