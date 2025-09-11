import * as Updates from 'expo-updates';
import { Alert } from 'react-native';

/**
 * Kiểm tra cập nhật và tải về nếu có
 * @returns Promise<boolean> - true nếu có cập nhật, false nếu không có
 */
export const checkForUpdates = async (): Promise<boolean> => {
  try {
    // if is dev mode return false
    if (__DEV__) {
      return false;
    }

    // Kiểm tra xem có cập nhật không
    const update = await Updates.checkForUpdateAsync();

    if (update.isAvailable) {
      // Nếu có cập nhật, tải về
      const result = await Updates.fetchUpdateAsync();

      if (result.isNew) {
        // Hiển thị thông báo và áp dụng cập nhật
        Alert.alert(
          'Cập nhật mới',
          'Đã có phiên bản mới. Bạn có muốn khởi động lại ứng dụng để áp dụng cập nhật không?',
          [
            {
              text: 'Để sau',
              style: 'cancel',
            },
            {
              text: 'Cập nhật ngay',
              onPress: () => {
                Updates.reloadAsync();
              },
            },
          ],
        );
        return true;
      }
    }

    return false;
  } catch (error) {
    console.log('Lỗi kiểm tra cập nhật:', error);
    return false;
  }
};

/**
 * Áp dụng cập nhật ngay lập tức không cần xác nhận
 */
export const applyUpdate = async (): Promise<void> => {
  try {
    if (__DEV__) {
      return;
    }

    await Updates.reloadAsync();
  } catch (error) {
    console.log('Lỗi khi áp dụng cập nhật:', error);
  }
};

/**
 * Kiểm tra và áp dụng cập nhật tự động khi khởi động ứng dụng
 * Nên được gọi trong useEffect khi component mount
 */
export const setupAutoUpdate = async (): Promise<void> => {
  if (__DEV__) {
    // Không chạy trong môi trường development
    return;
  }

  try {
    // Không sử dụng addListener vì đã deprecated trong phiên bản mới
    // Thay vào đó chỉ kiểm tra cập nhật khi khởi động
    await checkForUpdates();
  } catch (error) {
    console.log('Lỗi thiết lập auto update:', error);
  }
};
