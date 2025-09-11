import BottomSheet, { BottomSheetBackdrop, BottomSheetFlatList, BottomSheetView } from '@gorhom/bottom-sheet';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { ListRenderItem, Text, TouchableOpacity, View } from 'react-native';
import { DIMENSIONS } from '~/constants/dimensions';
import { useComponentStyles } from '~/hooks/useComponentStyles';
import { useTheme } from '~/hooks/useTheme';
import { Icon } from '../Icon';
interface BottomSheetModalProps {
  isVisible: boolean;
  onClose: () => void;
  children?: React.ReactNode;
  firstPointIndex?: number;
  componentView?: 'BottomSheetView' | 'BottomSheetFlatList';
  data?: any[];
  renderItem?: ListRenderItem<any>;
  ListHeaderComponent?: React.ComponentType<any> | React.ReactElement | null;
  numColumns?: number;
  keyExtractor?: (item: any, index: number) => string;
  contentContainerStyle?: any;
  renderFooter?: () => React.ReactNode;
  paddingHorizontal?: number;
}

const BottomSheetModal: React.FC<BottomSheetModalProps> = ({
  isVisible,
  onClose,
  children,
  firstPointIndex,
  componentView = 'BottomSheetView',
  data,
  renderItem,
  ListHeaderComponent,
  numColumns,
  keyExtractor,
  contentContainerStyle,
  renderFooter,
  paddingHorizontal = 20,
}) => {
  const { styles } = useBottomSheetModalStyles();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const theme = useTheme();

  const snapPoints = useMemo(() => ['30%', '50%', '70%', '90%'], []);

  const handleSheetChanges = useCallback(
    (index: number) => {
      if (index === -1) {
        onClose();
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (!isVisible) {
      bottomSheetRef.current?.close();
    }
  }, [isVisible]);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={1} opacity={0.5} style={{ zIndex: 1 }} />
    ),
    [],
  );
  const ListEmptyComponent = () => {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: theme.colors.text }}>Không có dữ liệu</Text>
      </View>
    );
  };
  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={isVisible ? (firstPointIndex ? firstPointIndex : 1) : -1}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      enablePanDownToClose={true}
      backgroundStyle={styles.bottomSheetBackground}
      handleIndicatorStyle={styles.handleIndicator}
      backdropComponent={renderBackdrop}
      enableDynamicSizing={false}
      containerStyle={[styles.container, { zIndex: 2 }]}
    >
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <Icon name="close-circle" type="ionicons" size={24} />
      </TouchableOpacity>
      <View style={[styles.contentContainer, { marginHorizontal: paddingHorizontal }]}>
        {componentView === 'BottomSheetView' ? (
          <BottomSheetView style={styles.listContainer}>{children}</BottomSheetView>
        ) : (
          <BottomSheetFlatList
            data={data}
            keyExtractor={keyExtractor || ((_, index) => index.toString())}
            renderItem={renderItem}
            ListHeaderComponent={ListHeaderComponent}
            numColumns={numColumns}
            contentContainerStyle={[styles.listContainer, contentContainerStyle]}
            scrollEnabled={true}
            ListEmptyComponent={ListEmptyComponent}
          />
        )}
        {renderFooter && renderFooter()}
      </View>
    </BottomSheet>
  );
};

const useBottomSheetModalStyles = () =>
  useComponentStyles((theme) => ({
    bottomSheetBackground: {
      backgroundColor: theme.colors.card,
      borderTopLeftRadius: 10,
      borderTopRightRadius: 10,
    },
    handleIndicator: {
      backgroundColor: theme.colors.icon,
      width: 60,
      height: 5,
      borderRadius: 3,
    },
    contentContainer: {
      flex: 1,
      marginTop: 30,
    },
    closeButton: {
      position: 'absolute',
      top: 0,
      right: 4,
    },
    listContainer: {
      width: '100%',
    },
    container: {
      flex: 1,
      alignItems: 'center',
    },
  }));

export default BottomSheetModal;
