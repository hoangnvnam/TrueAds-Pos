import React, { useState } from 'react';
import {
  ActivityIndicator,
  ImageStyle,
  Image as RNImage,
  ImageProps as RNImageProps,
  StyleProp,
  View,
} from 'react-native';
import { useImageStyles } from './styles';

export interface ImageProps extends Omit<RNImageProps, 'source'> {
  source: string | { uri: string };
  width?: number;
  height?: number;
  borderRadius?: number;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'center';
  style?: StyleProp<ImageStyle>;
  tintColor?: string;
  onError?: () => void;
}

export function Image({
  source,
  width = 40,
  height = width,
  borderRadius,
  resizeMode = 'cover',
  style,
  tintColor,
  onError,
  ...rest
}: ImageProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const { styles } = useImageStyles();

  const imageSource = typeof source === 'string' ? { uri: source, caches: 'force-cache' } : source;

  const containerStyle = {
    width,
    height,
    borderRadius,
    ...(style as any),
  };

  const imageStyle: ImageStyle = {
    width: '100%',
    height: '100%',
    borderRadius,
    resizeMode,
  };

  const handleError = () => {
    if (onError) {
      onError();
    } else {
      setHasError(true);
      setIsLoading(false);
    }
  };
  return (
    <View style={[styles.container, containerStyle]}>
      {isLoading && typeof source === 'string' && (
        <View style={[styles.loadingContainer, containerStyle]}>
          <ActivityIndicator size="small" color="#999" />
        </View>
      )}

      {hasError ? (
        <View style={[styles.errorContainer, containerStyle]}>
          <RNImage source={require('~/assets/icons/Conversations/mes-logo.png')} style={styles.errorIcon} />
        </View>
      ) : (
        <RNImage
          source={imageSource}
          onLoadStart={() => setIsLoading(true)}
          onLoadEnd={() => setIsLoading(false)}
          onError={handleError}
          tintColor={tintColor}
          style={[imageStyle]}
          {...rest}
        />
      )}
    </View>
  );
}
