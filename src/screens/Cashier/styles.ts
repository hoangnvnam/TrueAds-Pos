import { useComponentStyles } from '~/hooks/useComponentStyles';

export function useCashierStyles() {
  return useComponentStyles((theme) => ({
    container: {
      flex: 1,
    },
    mainContent: {
      flex: 1,
      flexDirection: 'row',
    },
    leftPanel: {
      flex: 2,
      padding: 16,
      borderRadius: 12,
      marginRight: 8,
      shadowColor: '#000',
    },
    rightPanel: {
      flex: 1,
      padding: 16,
      borderRadius: 12,
      marginLeft: 8,
    },

    // Portrait Layout Styles
    portraitContainer: {
      flex: 1,
    },
    portraitHeader: {
      padding: 16,
      paddingBottom: 8,
    },
    searchSection: {
      paddingHorizontal: 16,
      marginBottom: 12,
    },
    productsSection: {
      paddingHorizontal: 16,
      marginBottom: 20,
    },
    portraitCartSection: {
      margin: 16,
      borderRadius: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.1,
      shadowRadius: 5,
      elevation: 4,
      padding: 16,
    },
    portraitCartList: {
      maxHeight: 250,
    },
    portraitCheckout: {
      borderTopWidth: 1,
      paddingTop: 16,
      marginTop: 16,
    },
    cartHeader: {
      marginBottom: 16,
    },

    // Common Styles
    header: {
      marginBottom: 20,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 12,
    },
    searchInput: {
      height: 46,
      borderWidth: 1,
      borderRadius: 12,
      paddingHorizontal: 16,
      marginBottom: 16,
      fontSize: 16,
    },
    categoryContainer: {
      marginBottom: 16,
    },
    categoryButton: {
      paddingHorizontal: 18,
      paddingVertical: 10,
      borderRadius: 24,
      borderWidth: 0,
      marginRight: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    categoryText: {
      fontSize: 16,
      fontWeight: '500',
    },
    productsGrid: {
      paddingBottom: 16,
    },
    productCard: {
      margin: 6,
      padding: 14,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
      justifyContent: 'center',
      alignItems: 'center',
      flex: 1,
      marginBottom: 12,
      minHeight: 100,
    },
    productName: {
      fontSize: 16,
      fontWeight: '600',
      textAlign: 'center',
      marginBottom: 6,
    },
    productPrice: {
      fontSize: 14,
      fontWeight: 'bold',
      marginBottom: 4,
    },
    productStock: {
      fontSize: 12,
      marginTop: 2,
    },
    cartList: {
      flex: 1,
      marginBottom: 16,
    },
    cartItem: {
      flexDirection: 'row',
      padding: 14,
      marginBottom: 10,
      borderRadius: 12,
      borderWidth: 0,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 2,
    },
    cartItemInfo: {
      flex: 1,
    },
    cartItemName: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 4,
    },
    cartItemPrice: {
      fontSize: 14,
      fontWeight: 'bold',
    },
    cartItemControls: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    quantityButton: {
      width: 34,
      height: 34,
      borderRadius: 17,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
      elevation: 2,
    },
    quantityButtonText: {
      color: '#fff',
      fontSize: 18,
      fontWeight: 'bold',
    },
    quantity: {
      fontSize: 18,
      fontWeight: 'bold',
      marginHorizontal: 14,
      minWidth: 20,
      textAlign: 'center',
    },
    paymentSummary: {
      borderTopWidth: 1,
      paddingTop: 20,
      marginTop: 10,
    },
    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    summaryLabel: {
      fontSize: 20,
      fontWeight: 'bold',
    },
    summaryValue: {
      fontSize: 20,
      fontWeight: 'bold',
    },
    checkoutButton: {
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 4,
    },
    checkoutButtonText: {
      color: '#fff',
      fontSize: 18,
      fontWeight: 'bold',
    },
  }));
}
