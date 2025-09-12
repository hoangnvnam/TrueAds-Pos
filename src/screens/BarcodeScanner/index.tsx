import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useAudioPlayer } from 'expo-audio';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ScreenOrientation from 'expo-screen-orientation';
import React, { useEffect, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Icon } from '~/components/Icon';
import { useAuth } from '~/contexts/AuthContext';
import { useInitData } from '~/contexts/InitData';
import { useSocketContext } from '~/contexts/SocketContext';
import { toastSuccess } from '~/hooks/useToast';
import { useBarcodeScannerStyles } from './styles';

type BarcodeScanningResult = {
  type: string;
  data: string;
};

type TabType = 'order' | 'product';

export function BarcodeScanner() {
  const { styles } = useBarcodeScannerStyles();
  const [scanned, setScanned] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('order');
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const navigation = useNavigation();
  const [permission, requestPermission] = useCameraPermissions();
  const { cashierSocket: socket } = useSocketContext();
  const { storeDomain } = useInitData();
  const { authChild } = useAuth();

  const successSoundPlayer = useAudioPlayer(require('~/assets/sound/beep.mp3'));

  useFocusEffect(
    React.useCallback(() => {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
      return () => ScreenOrientation.unlockAsync();
    }, []),
  );

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
    if (storeDomain) {
      const hostName = storeDomain.replace('https://', '');
      socket?.emit('joinRoomCashier', {
        hostName,
      });
    }
  }, [permission, requestPermission, socket, storeDomain]);

  // Tắt camera khi chuyển tab
  useEffect(() => {
    setCameraEnabled(false);
  }, [activeTab]);

  const playSuccessSound = async () => {
    try {
      successSoundPlayer.play();
    } catch (error) {
      console.log('Error playing sound:', error);
    }
    successSoundPlayer.seekTo(0);
  };
  const handleBarCodeScanned = async ({ type, data }: BarcodeScanningResult) => {
    if (scanned) return;
    setScanned(true);
    // Phát sound effect
    await playSuccessSound();
    if (activeTab === 'order') {
      if (socket) {
        socket.emit(`addtoorder`, {
          sku: data,
          id: authChild?.ID,
          type: type,
          hostName: storeDomain.replace('https://', ''),
        });
        toastSuccess('Thêm sản phẩm vào đơn hàng thành công');
      }
      setScanned(false);
    } else {
      if (socket) {
        socket.emit(`addSkuToProduct`, {
          sku: data,
          id: authChild?.ID,
          type: type,
          hostName: storeDomain.replace('https://', ''),
        });
      }
      setCameraEnabled(false);
      setScanned(false);
    }
  };

  const toggleCamera = () => {
    setCameraEnabled(!cameraEnabled);
    if (scanned) {
      setScanned(false);
    }
  };

  const renderTabButton = (tab: TabType, title: string) => (
    <TouchableOpacity
      style={[styles.tabButton, activeTab === tab && styles.activeTabButton]}
      onPress={() => setActiveTab(tab)}
    >
      <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{title}</Text>
    </TouchableOpacity>
  );

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Đang yêu cầu quyền truy cập camera...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Không có quyền truy cập camera</Text>
        <TouchableOpacity style={styles.scanAgainButton} onPress={requestPermission}>
          <Text style={styles.scanAgainText}>Cấp quyền</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header với tabs */}
      <View style={styles.header}>
        <View style={styles.tabContainer}>
          {renderTabButton('order', 'Quét đơn hàng')}
          {renderTabButton('product', 'Quét SKU sản phẩm')}
        </View>
        <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
          <Icon name="close" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Camera area */}
      <View style={styles.cameraContainer}>
        {cameraEnabled ? (
          <>
            <CameraView
              style={styles.camera}
              onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
              barcodeScannerSettings={{
                barcodeTypes: ['qr', 'code128', 'code39', 'ean13'],
              }}
            />
            <View style={styles.overlay}>
              <View style={styles.scanArea} />
            </View>
          </>
        ) : (
          <View style={styles.cameraPlaceholder}>
            <Icon name="camera" size={64} color="#CCCCCC" />
            <Text style={styles.placeholderText}>Camera đã tắt</Text>
          </View>
        )}
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.toggleButton, cameraEnabled ? styles.toggleButtonOn : styles.toggleButtonOff]}
          onPress={toggleCamera}
        >
          <Text style={styles.toggleButtonText}>{cameraEnabled ? 'Tắt Camera' : 'Mở Camera'}</Text>
        </TouchableOpacity>

        {activeTab === 'order' && scanned && (
          <Text style={styles.scanSuccessText}>Quét thành công! Đang thêm vào đơn hàng...</Text>
        )}

        {activeTab === 'product' && (
          <Text style={styles.infoText}>Quét mã SKU sẽ tự động tắt camera sau khi thành công</Text>
        )}
      </View>
    </View>
  );
}
