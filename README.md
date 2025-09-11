# ChatTrueAds - React Native with Expo

## Hướng dẫn cài đặt và thiết lập môi trường

### 1. Cài đặt Node.js và npm

Nếu bạn chưa cài đặt Node.js và npm, hãy làm theo các bước sau:

- **Windows/macOS**: Truy cập [https://nodejs.org/](https://nodejs.org/) và tải xuống phiên bản LTS (Long Term Support)
- **macOS** (sử dụng Homebrew):
  ```bash
  brew install node
  ```
- **Linux** (Ubuntu/Debian):
  ```bash
  sudo apt update
  sudo apt install nodejs npm
  ```

Kiểm tra cài đặt:

```bash
node -v
npm -v
```

### 2. Cài đặt Expo CLI

Sau khi đã cài đặt Node.js và npm, cài đặt Expo CLI:

```bash
npm install -g expo-cli
```

### 3. Cài đặt môi trường phát triển cho thiết bị di động

#### Android:

1. Tải và cài đặt [Android Studio](https://developer.android.com/studio)
2. Trong Android Studio, mở "SDK Manager" (Tools > SDK Manager)
3. Cài đặt:
   - Android SDK Platform
   - Android SDK Platform-Tools
   - Android SDK Build-Tools
   - Android Emulator
   - Ít nhất một Android SDK Platform (ví dụ: Android 13)
4. Thiết lập biến môi trường ANDROID_HOME (đường dẫn tới thư mục Android SDK)
   - **Windows**:
     ```
     setx ANDROID_HOME "%LOCALAPPDATA%\Android\Sdk"
     ```
   - **macOS/Linux** (thêm vào ~/.bash_profile hoặc ~/.zshrc):
     ```
     export ANDROID_HOME=$HOME/Library/Android/sdk
     export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools
     ```
5. Tạo một thiết bị ảo Android:
   - Mở "AVD Manager" trong Android Studio (Tools > AVD Manager)
   - Nhấn "Create Virtual Device"
   - Chọn một thiết bị (ví dụ: Pixel 5) và chọn hình ảnh hệ thống

#### iOS (chỉ cho macOS):

1. Cài đặt Xcode từ App Store
2. Cài đặt Xcode Command Line Tools:
   ```bash
   xcode-select --install
   ```
3. Cài đặt CocoaPods:
   ```bash
   sudo gem install cocoapods
   ```

### 4. Clone dự án

```bash
git clone https://github.com/hoangnvnam/TrueAds.Ai-App.git
cd chattrueads
```

### 5. Cài đặt các dependencies

```bash
npm install
```

### 6. Chạy ứng dụng

```bash
# Khởi động máy chủ phát triển
npm start

# Hoặc chạy trực tiếp trên iOS (chỉ macOS)
npm run ios

# Hoặc chạy trên Android
npm run android

# Chạy trên web
npm run web
```

### 7. Cài đặt Expo Go trên thiết bị thật

Để chạy ứng dụng trên thiết bị thật mà không cần build:

1. Cài đặt ứng dụng [Expo Go](https://expo.dev/client) từ App Store/Google Play Store
2. Quét mã QR xuất hiện sau khi chạy `npm start`
3. Đảm bảo thiết bị của bạn và máy tính kết nối cùng một mạng Wi-Fi

### 8. Cấu trúc dự án

```
chattrueads/
├── assets/          # Hình ảnh, phông chữ, v.v.
├── app/             # Mã nguồn ứng dụng
│   ├── components/  # Các component React Native
│   ├── hooks/       # Custom React hooks
│   ├── navigation/  # Cấu hình điều hướng
│   ├── screens/     # Các màn hình ứng dụng
│   └── utils/       # Các tiện ích, helper functions
├── .gitignore       # Các file bị loại trừ khỏi git
├── app.json         # Cấu hình Expo
├── App.tsx          # Entry point của ứng dụng
├── babel.config.js  # Cấu hình Babel
├── package.json     # Danh sách dependencies
└── tsconfig.json    # Cấu hình TypeScript
```

### 9. Xử lý lỗi thường gặp

1. **Lỗi Metro Bundler không khởi động**:

   ```bash
   npx react-native start --reset-cache
   ```

2. **Lỗi "Unable to resolve module"**:

   ```bash
   npm install
   rm -rf node_modules/.cache
   ```

3. **Lỗi iOS Podfile**:

   ```bash
   cd ios && pod install && cd ..
   ```

4. **Lỗi Android Gradle**:
   - Kiểm tra version JDK (11 hoặc 17 được khuyến nghị)
   - Kiểm tra biến môi trường ANDROID_HOME
   - Clean project trong Android Studio

### 10. Build và phát hành ứng dụng

#### Build Development:

```bash
expo build:android -t apk
expo build:ios
```

#### Build Production:

```bash
expo build:android -t app-bundle
expo build:ios --release-channel production
```

### 11. Tài liệu tham khảo

- [Tài liệu React Native](https://reactnative.dev/docs/getting-started)
- [Tài liệu Expo](https://docs.expo.dev/)
- [Tài liệu React Navigation](https://reactnavigation.org/docs/getting-started)

---
