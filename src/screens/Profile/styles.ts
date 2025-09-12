import { StyleSheet } from 'react-native';
import { useComponentStyles } from '~/hooks/useComponentStyles';

export const useProfileStyles = () =>
  useComponentStyles((theme) => ({
    container: {
      flex: 1,
      padding: 16,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 20,
    },
    section: {
      marginBottom: 20,
    },
    sectionTitle: {
      fontSize: 14,
      color: theme.colors.text,
      marginBottom: 10,
      fontWeight: '600',
    },
    card: {
      backgroundColor: theme.colors.card,
      borderRadius: 12,
      padding: 16,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    profileHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 20,
    },
    avatar: {
      width: 50,
      height: 50,
      borderRadius: 25,
      marginRight: 12,
    },
    name: {
      fontSize: 18,
      fontWeight: '600',
    },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: '#F0F0F0',
    },
    label: {
      fontSize: 16,
      color: theme.colors.text,
      flex: 1,
    },
    value: {
      fontSize: 16,
      color: theme.colors.primary,
      flex: 2,
      textAlign: 'right',
    },
    linkedPages: {
      flex: 2,
      alignItems: 'flex-end',
    },
    linkedPage: {
      fontSize: 16,
      color: theme.colors.primary,
      marginBottom: 4,
      textAlign: 'right',
    },
  }));
