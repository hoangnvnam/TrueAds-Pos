import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const DIMENSIONS = {
    SCREEN_WIDTH,
    SCREEN_HEIGHT,
    SIDEBAR_WIDTH: SCREEN_WIDTH * 0.8,
    HEADER_HEIGHT: 56,
    BOTTOM_TAB_HEIGHT: 56,
    AVATAR_SIZE: 48,
    ICON_SIZE: 24,
    BORDER_RADIUS: {
        SMALL: 4,
        MEDIUM: 8,
        LARGE: 16,
        XLARGE: 24,
    },
    PADDING: {
        SMALL: 8,
        MEDIUM: 16,
        LARGE: 24,
        XLARGE: 32,
    },
    MARGIN: {
        SMALL: 8,
        MEDIUM: 16,
        LARGE: 24,
        XLARGE: 32,
    },
} as const;