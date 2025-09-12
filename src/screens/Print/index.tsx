import { Buffer } from 'buffer';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Image, StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TcpSocket from 'react-native-tcp-socket';
import { ButtonRipple } from '~/components/ButtonRipple';
import { Input } from '~/components/Input';
import { useTheme } from '~/hooks/useTheme';
import { captureRef } from 'react-native-view-shot';
import * as ImagePicker from 'expo-image-picker';
import * as UPNG from 'upng-js';
import { toastError, toastSuccess } from '~/hooks/useToast';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
interface PrinterConnection {
  host: string;
  port: string;
}

function PrintConnection() {
  const theme = useTheme();
  const navigation = useNavigation();
  const [host, setHost] = useState('');
  const [port, setPort] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [client, setClient] = useState<TcpSocket.Socket | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const captureViewRef = useRef<View>(null);
  const [captureReady, setCaptureReady] = useState(false);
  const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));
  const [printerDots, setPrinterDots] = useState<number>(576);
  const [customImage, setCustomImage] = useState<string | null>(null);
  const imageConvertViewRef = useRef<View>(null);
  const [imageConvertReady, setImageConvertReady] = useState<boolean>(false);

  // Load/save printer width
  useEffect(() => {
    (async () => {
      try {
        const v = await AsyncStorage.getItem('printerDots');
        if (v) setPrinterDots(parseInt(v, 10));
      } catch {}
    })();
  }, []);
  useEffect(() => {
    AsyncStorage.setItem('printerDots', String(printerDots)).catch(() => {});
  }, [printerDots]);

  // Load saved printer connection info
  useEffect(() => {
    const loadPrinterConnection = async () => {
      try {
        const savedConnection = await AsyncStorage.getItem('printerConnection');
        if (savedConnection) {
          const { host, port } = JSON.parse(savedConnection) as PrinterConnection;
          setHost(host);
          setPort(port);

          // Auto-connect with saved info after a short delay
          setTimeout(() => {
            connectToPrinter(host, port);
          }, 500);
        }
      } catch (error) {
        console.error('Failed to load printer connection info', error);
      }
    };

    loadPrinterConnection();
    return () => {
      if (client) {
        try {
          client.destroy();
        } catch (error) {
          console.log('Error closing socket:', error);
        }
      }
    };
  }, []);

  // Additional cleanup effect for client state changes
  useEffect(() => {
    return () => {
      if (client && !client.destroyed) {
        try {
          client.destroy();
        } catch (error) {
          console.log('Error destroying client on cleanup:', error);
        }
      }
    };
  }, [client]);

  const connectToPrinter = async (hostParam?: string, portParam?: string) => {
    const connectHost = hostParam || host;
    const connectPort = portParam || port;

    if (!connectHost || !connectPort) {
      Alert.alert('Thông báo', 'Vui lòng nhập đầy đủ thông tin kết nối');
      return;
    }

    // Prevent multiple concurrent connections
    if (isLoading) {
      return;
    }

    setIsLoading(true);

    try {
      // Clean up existing connection
      if (client && !client.destroyed) {
        try {
          client.destroy();
        } catch (e) {
          console.log('Error destroying existing client:', e);
        }
        setClient(null);
        setIsConnected(false);
      }

      // Create new connection
      const newClient = TcpSocket.createConnection(
        {
          host: connectHost,
          port: parseInt(connectPort, 10),
        },
        () => {
          // Connection established - handled by 'connect' event below
        },
      );

      newClient.on('error', (error) => {
        clearTimeout(timeoutId);
        console.error('Socket error:', error);
        setIsConnected(false);
        setClient(null);
        setIsLoading(false);

        // Only show error toast for manual connections
        if (hostParam && portParam) {
          toastError('Không thể kết nối tới máy in. Vui lòng kiểm tra lại thông tin kết nối.');
        } else {
          console.log('Auto-connect failed silently');
        }
      });

      newClient.on('close', () => {
        console.log('Socket closed');
        setIsConnected(false);
        setClient(null);
      });

      // Set timeout for connection
      const timeoutId = setTimeout(() => {
        if (isLoading) {
          setIsLoading(false);
          if (newClient && !newClient.destroyed) {
            newClient.destroy();
          }
          // Only show alert if this was a manual connection attempt
          if (hostParam && portParam) {
            Alert.alert('Lỗi', 'Kết nối máy in timeout. Vui lòng thử lại.');
          } else {
            // Silent fail for auto-connect
            console.log('Auto-connect timeout - connection failed silently');
          }
        }
      }, 8000); // 8 seconds timeout

      // Update the success callback to clear timeout
      newClient.on('connect', () => {
        clearTimeout(timeoutId);
        console.log('Connected to printer successfully');
        setIsConnected(true);
        setClient(newClient);
        setIsLoading(false);

        // Save connection info
        const saveConnectionInfo = async () => {
          try {
            const connectionInfo: PrinterConnection = {
              host: connectHost,
              port: connectPort,
            };
            await AsyncStorage.setItem('printerConnection', JSON.stringify(connectionInfo));
          } catch (error) {
            console.error('Error saving connection info:', error);
          }
        };
        saveConnectionInfo();
        toastSuccess('Kết nối máy in thành công!');
      });
    } catch (error) {
      console.error('Connection error:', error);
      setIsConnected(false);
      setClient(null);
      setIsLoading(false);
      Alert.alert('Lỗi', 'Không thể kết nối tới máy in. Vui lòng kiểm tra lại thông tin kết nối.');
    }
  };

  const disconnectPrinter = () => {
    try {
      if (client && !client.destroyed) {
        client.destroy();
      }
      setClient(null);
      setIsConnected(false);
      toastSuccess('Đã ngắt kết nối máy in');
    } catch (error) {
      console.error('Error disconnecting:', error);
    }
  };

  const trimTopBlank = (rgba: Uint8Array, width: number, height: number, threshold = 250) => {
    const rowStride = width * 4;
    let top = 0;
    outer: for (; top < height; top++) {
      const rowStart = top * rowStride;
      for (let x = 0; x < width; x++) {
        const i = rowStart + x * 4;
        const r = rgba[i];
        const g = rgba[i + 1];
        const b = rgba[i + 2];
        const a = rgba[i + 3];
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;
        if (a > 0 && lum < threshold) {
          break outer;
        }
      }
    }
    if (top <= 0) return { rgba, width, height };
    const newH = Math.max(0, height - top);
    const out = new Uint8Array(newH * width * 4);
    out.set(rgba.subarray(top * rowStride, top * rowStride + out.length));

    return { rgba: out, width, height: newH };
  };

  const rgbaToMonoPacked = (rgba: Uint8Array, width: number, height: number, threshold = 160) => {
    const bytesPerRow = Math.ceil(width / 8);
    const out = new Uint8Array(bytesPerRow * height);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const r = rgba[idx];
        const g = rgba[idx + 1];
        const b = rgba[idx + 2];
        // Luminance
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;
        const bit = lum < threshold ? 1 : 0; // 1 = black pixel
        const byteIndex = y * bytesPerRow + (x >> 3);
        const bitPos = 7 - (x & 7);
        if (bit) out[byteIndex] |= 1 << bitPos;
      }
    }
    return { data: out, bytesPerRow };
  };

  const buildRasterCmd = (mono: Uint8Array, bytesPerRow: number, height: number, scaleMode = 0) => {
    const xL = bytesPerRow & 0xff;
    const xH = (bytesPerRow >> 8) & 0xff;
    const yL = height & 0xff;
    const yH = (height >> 8) & 0xff;
    return Buffer.concat([Buffer.from([0x1d, 0x76, 0x30, scaleMode, xL, xH, yL, yH]), Buffer.from(mono)]);
  };

  const scaleRgbaToWidth = (
    rgba: Uint8Array,
    srcW: number,
    srcH: number,
    targetW: number,
  ): { rgba: Uint8Array; width: number; height: number } => {
    const alignedW = targetW & ~7; // multiple of 8
    if (srcW === alignedW) return { rgba, width: srcW, height: srcH };
    const scale = alignedW / srcW;
    const targetH = Math.max(1, Math.round(srcH * scale));
    const out = new Uint8Array(alignedW * targetH * 4);
    for (let y = 0; y < targetH; y++) {
      const sy = Math.min(srcH - 1, Math.floor(y / scale));
      for (let x = 0; x < alignedW; x++) {
        const sx = Math.min(srcW - 1, Math.floor(x / scale));
        const si = (sy * srcW + sx) * 4;
        const di = (y * alignedW + x) * 4;
        out[di] = rgba[si];
        out[di + 1] = rgba[si + 1];
        out[di + 2] = rgba[si + 2];
        out[di + 3] = rgba[si + 3];
      }
    }
    return { rgba: out, width: alignedW, height: targetH };
  };

  const printRasterFromRgba = async (rgba: Uint8Array, width: number, height: number) => {
    if (!client || !isConnected) return;
    const { data, bytesPerRow } = rgbaToMonoPacked(rgba, width, height);
    const init = Buffer.from([0x1b, 0x40]);
    const left = Buffer.from([0x1b, 0x61, 0x00]);
    const feedAndCut = Buffer.from([0x0a, 0x0a, 0x0a, 0x0a, 0x0a, 0x1d, 0x56, 0x01]);

    const maxRowsPerStripe = 96;
    const chunks: Buffer[] = [init, left];
    for (let y = 0; y < height; ) {
      const remaining = height - y;
      let rows = Math.min(maxRowsPerStripe, remaining);
      if (rows !== remaining) {
        const rem = rows % 8;
        if (rem !== 0) rows -= rem;
        if (rows <= 0) rows = 8;
      }
      const offset = y * bytesPerRow;
      const stripe = data.subarray(offset, offset + rows * bytesPerRow);
      const cmd = buildRasterCmd(stripe, bytesPerRow, rows, 0);
      chunks.push(cmd);
      y += rows;
    }
    chunks.push(feedAndCut);
    client.write(Buffer.concat(chunks));
  };

  const printRasterTextFromView = async () => {
    if (!client || !isConnected) {
      Alert.alert('Thông báo', 'Vui lòng kết nối máy in trước');
      return;
    }
    try {
      setIsLoading(true);
      if (!captureViewRef.current) {
        throw new Error('captureViewRef.current is null');
      }
      if (!captureReady) {
        await sleep(60);
      }

      const base64 = await captureRef(captureViewRef.current, {
        format: 'png',
        quality: 1,
        result: 'base64',
      });

      const bytes = Buffer.from(base64, 'base64');
      const abuf = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
      const img = UPNG.decode(abuf);
      const frames: any[] = UPNG.toRGBA8(img);
      const first = frames && frames.length > 0 ? frames[0] : null;
      const rgba: Uint8Array | null = first
        ? first instanceof Uint8Array
          ? first
          : new Uint8Array(first as ArrayBuffer)
        : null;

      const width = (img.width as number) | 0;
      const height = (img.height as number) | 0;
      if (!rgba || rgba.length === 0 || !width || !height) {
        throw new Error('Ảnh capture rỗng (RGBA/size = 0)');
      }
      let scaled = scaleRgbaToWidth(rgba, width, height, printerDots);
      const trimmed = trimTopBlank(scaled.rgba, scaled.width, scaled.height);
      await printRasterFromRgba(trimmed.rgba, trimmed.width, trimmed.height);
      setIsLoading(false);
    } catch (e) {
      console.error('Raster text error', e);
      setIsLoading(false);
      Alert.alert('Lỗi', 'Không thể in raster.');
    }
  };

  const pickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert('Cần quyền truy cập', 'Vui lòng cho phép ứng dụng truy cập thư viện ảnh');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled && result.assets.length > 0) {
        setCustomImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Lỗi', 'Không thể chọn ảnh từ thư viện');
    }
  };

  const printCustomImage = async () => {
    if (!client || !isConnected) {
      Alert.alert('Thông báo', 'Vui lòng kết nối máy in trước');
      return;
    }

    if (!customImage) {
      Alert.alert('Thông báo', 'Vui lòng chọn hình ảnh để in');
      return;
    }

    try {
      setIsLoading(true);

      if (!imageConvertReady) {
        await sleep(200);
      }

      if (!imageConvertViewRef.current) {
        throw new Error('imageConvertViewRef.current is null');
      }

      const pngBase64 = await captureRef(imageConvertViewRef.current, {
        format: 'png',
        quality: 1,
        result: 'base64',
      });

      const bytes = Buffer.from(pngBase64, 'base64');
      const abuf = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
      const img = UPNG.decode(abuf);
      const frames = UPNG.toRGBA8(img);
      const first = frames && frames.length > 0 ? frames[0] : null;
      const rgba = first ? (first instanceof Uint8Array ? first : new Uint8Array(first as ArrayBuffer)) : null;

      const width = (img.width as number) | 0;
      const height = (img.height as number) | 0;

      if (!rgba || rgba.length === 0 || !width || !height) {
        throw new Error('Ảnh không hợp lệ');
      }

      // Scale and print
      const scaled = scaleRgbaToWidth(rgba, width, height, printerDots);
      const trimmed = trimTopBlank(scaled.rgba, scaled.width, scaled.height);
      await printRasterFromRgba(trimmed.rgba, trimmed.width, trimmed.height);

      setIsLoading(false);
      Alert.alert('Thành công', 'Đã in ảnh thành công!');
    } catch (e) {
      console.error('Lỗi in ảnh:', e);
      setIsLoading(false);
      Alert.alert('Lỗi', 'Không thể in ảnh. Vui lòng thử lại.');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            navigation.canGoBack()
              ? navigation.goBack()
              : navigation.reset({ index: 0, routes: [{ name: 'HomeTabs' }] });
          }}
        >
          <Ionicons name="arrow-back" size={18} color="#333" />
          <Text style={styles.backButtonText}> Quay lại</Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.container}>
        <View style={styles.formContainer}>
          <Text style={[styles.title, { color: theme.colors.text }]}>In hóa đơn</Text>

          <View style={styles.cardContainer}>
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Thông tin kết nối</Text>

            <Input
              label="Địa chỉ IP máy in"
              placeholder="Nhập địa chỉ IP (vd: 192.168.1.100)"
              value={host}
              setValue={setHost}
              style={styles.inputStyled}
            />

            <Input
              label="Cổng kết nối (Port)"
              placeholder="Nhập cổng kết nối (vd: 9100)"
              value={port}
              setValue={setPort}
              keyboardType="numeric"
              style={styles.inputStyled}
            />

            <View style={styles.buttonRow}>
              <ButtonRipple
                style={[
                  styles.actionButton,
                  { backgroundColor: isConnected ? theme.colors.success : theme.colors.primary },
                ]}
                onPress={() => connectToPrinter(host, port)}
              >
                <Text style={styles.actionButtonText}>
                  {isLoading ? 'Đang kết nối...' : isConnected ? 'Đã kết nối ✓' : 'Kết nối'}
                </Text>
              </ButtonRipple>

              {isConnected && (
                <ButtonRipple
                  style={[styles.actionButton, { backgroundColor: theme.colors.error || '#ff4444' }]}
                  onPress={disconnectPrinter}
                >
                  <Text style={styles.actionButtonText}>Ngắt kết nối</Text>
                </ButtonRipple>
              )}
            </View>
          </View>

          {isConnected && (
            <>
              <View style={styles.cardContainer}>
                <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Cài đặt máy in</Text>

                <Text style={[styles.connectedText, { color: theme.colors.success, marginBottom: 15 }]}>
                  ✓ Máy in: {host}:{port}
                </Text>

                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Khổ giấy</Text>
                <View style={styles.paperSizeContainer}>
                  <TouchableOpacity
                    style={[
                      styles.paperSizeButton,
                      { backgroundColor: printerDots === 384 ? theme.colors.primary : theme.colors.cardBg },
                    ]}
                    onPress={() => setPrinterDots(384)}
                  >
                    <Text style={[styles.paperSizeText, { color: printerDots === 384 ? '#fff' : theme.colors.text }]}>
                      58mm (384)
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.paperSizeButton,
                      { backgroundColor: printerDots === 576 ? theme.colors.primary : theme.colors.cardBg },
                    ]}
                    onPress={() => setPrinterDots(576)}
                  >
                    <Text style={[styles.paperSizeText, { color: printerDots === 576 ? '#fff' : theme.colors.text }]}>
                      80mm (576)
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.divider} />

                <ButtonRipple
                  style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
                  onPress={printRasterTextFromView}
                >
                  <Text style={styles.actionButtonText}>{isLoading ? 'Đang in...' : 'In thử'}</Text>
                </ButtonRipple>
              </View>

              <View style={styles.cardContainer}>
                <Text style={[styles.cardTitle, { color: theme.colors.text }]}>In ảnh từ thiết bị</Text>

                <View style={styles.imageContainer}>
                  {customImage ? (
                    <Image source={{ uri: customImage }} style={styles.selectedImage} resizeMode="contain" />
                  ) : (
                    <View style={styles.imagePlaceholder}>
                      <Text style={{ color: theme.colors.text }}>Chưa chọn ảnh</Text>
                    </View>
                  )}
                </View>

                <View style={styles.buttonRow}>
                  <ButtonRipple
                    style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
                    onPress={pickImage}
                  >
                    <Text style={styles.actionButtonText}>Chọn ảnh</Text>
                  </ButtonRipple>

                  <ButtonRipple
                    style={[
                      styles.actionButton,
                      {
                        backgroundColor: customImage ? theme.colors.secondary : '#ccc',
                      },
                    ]}
                    onPress={customImage ? printCustomImage : () => Alert.alert('Thông báo', 'Vui lòng chọn ảnh trước')}
                  >
                    <Text style={styles.actionButtonText}>{isLoading ? 'Đang in...' : 'In ảnh đã chọn'}</Text>
                  </ButtonRipple>
                </View>
              </View>
            </>
          )}
        </View>
      </ScrollView>

      {/* Hidden view to capture Vietnamese text as image for raster printing */}
      <View
        collapsable={false}
        ref={captureViewRef}
        style={[styles.captureRoot, { width: printerDots }]}
        onLayout={({ nativeEvent }) => {
          const { width, height } = nativeEvent.layout;
          setCaptureReady(width > 0 && height > 0);
        }}
      >
        <Text style={styles.captureHeader}>TRUEADS</Text>
        <Image
          source={require('../../../assets/logo.png')}
          style={{ width: 100, height: 100, alignSelf: 'center', marginVertical: 10 }}
          resizeMode="cover"
        />
        <Text style={styles.captureBody}>In thử thành công!</Text>
        <Text style={styles.captureBody}>Cảm ơn quý khách đã sử dụng TrueAds!</Text>
        <Text style={[styles.captureBody, { textAlign: 'center', marginTop: 10 }]}>
          {new Date().toLocaleString('vi-VN')}
        </Text>
      </View>

      {/* Hidden view to convert any image format to PNG for printing */}
      {customImage && (
        <View
          collapsable={false}
          ref={imageConvertViewRef}
          style={[styles.captureRoot, { width: printerDots }]}
          onLayout={({ nativeEvent }) => {
            const { width, height } = nativeEvent.layout;
            setImageConvertReady(width > 0 && height > 0);
          }}
        >
          <Image
            source={{ uri: customImage }}
            style={{
              width: printerDots,
              height: undefined,
              aspectRatio: 1,
              resizeMode: 'contain',
            }}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: 8,
    paddingBottom: 5,
    zIndex: 10,
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.06)',
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1.5,
    elevation: 1,
  },
  backButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
    marginLeft: 2,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  formContainer: {
    width: '100%',
    maxWidth: 500,
    alignSelf: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    marginBottom: 15,
  },
  inputStyled: {
    marginBottom: 15,
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 8,
  },
  connectButton: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  connectButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  connectedText: {
    fontSize: 16,
    marginBottom: 5,
  },
  cardContainer: {
    marginTop: 15,
    marginBottom: 15,
    padding: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 10,
  },
  paperSizeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  paperSizeButton: {
    flex: 1,
    padding: 10,
    marginHorizontal: 5,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paperSizeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 15,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  actionButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  imageContainer: {
    alignItems: 'center',
    marginVertical: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 10,
    minHeight: 150,
    justifyContent: 'center',
  },
  selectedImage: {
    width: '100%',
    height: 200,
    borderRadius: 5,
  },
  imagePlaceholder: {
    width: '100%',
    height: 150,
    borderRadius: 5,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureRoot: {
    position: 'absolute',
    left: -10000,
    top: -10000,
    backgroundColor: '#ffffff',
    paddingTop: 0,
    paddingBottom: 6,
    paddingHorizontal: 0,
  },
  captureHeader: {
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  captureBody: {
    fontSize: 20,
    marginBottom: 6,
  },
});

export default PrintConnection;
