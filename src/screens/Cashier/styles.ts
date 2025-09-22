import { DIMENSIONS } from '~/constants/dimensions';
import { useComponentStyles } from '~/hooks/useComponentStyles';
import { globalStyles } from '~/styles/globalStyles';

export function useCashierStyles() {
  return useComponentStyles((theme) => ({
    container: {
      flex: 1,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      fontSize: 16,
      fontWeight: '500',
    },
    mainContent: {
      flex: 1,
      flexDirection: 'row',
    },
    leftPanel: {
      height: DIMENSIONS.SCREEN_HEIGHT,
      flex: 2,
      paddingVertical: 16,
      paddingHorizontal: 8,
      borderRadius: 12,
      shadowColor: '#000',
    },
    rightPanel: {
      flex: 1,
      paddingVertical: 12,
      paddingHorizontal: 8,
      borderRadius: 12,
      flexDirection: 'column',
      justifyContent: 'space-between',
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
      borderWidth: 1,
      borderColor: theme.colors.border,
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
      marginBottom: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
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
      borderWidth: 1,
      borderRadius: 12,
      paddingHorizontal: 16,
      fontSize: 16,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.background,
      flex: 1,
      height: 46,
    },
    categoryContainer: {
      paddingTop: 4,
      paddingBottom: 16,
      paddingHorizontal: 8,
    },
    categoryButton: {
      paddingHorizontal: 18,
      paddingVertical: 10,
      borderRadius: 24,
      borderWidth: 0,
      marginRight: 10,
      ...globalStyles.dropShadow,
      justifyContent: 'center',
      alignItems: 'center',
      height: 40,
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
      borderBottomWidth: 1,
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
      fontSize: 16,
      fontWeight: 'bold',
    },
    summaryValue: {
      fontSize: 16,
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

    // Price Display Styles
    priceContainer: {
      marginBottom: 8,
    },
    originalPriceStrikethrough: {
      color: theme.colors.text,
      textDecorationLine: 'line-through',
      fontSize: 12,
    },
    priceRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    discountedPrice: {
      color: theme.colors.primary,
      fontWeight: 'bold',
    },
    discountBadge: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
    },
    discountBadgeText: {
      color: '#fff',
      fontSize: 10,
      fontWeight: 'bold',
    },
    manualDiscountBadge: {
      backgroundColor: '#6c757d',
      paddingHorizontal: 4,
      paddingVertical: 1,
      borderRadius: 3,
    },
    manualDiscountBadgeText: {
      color: '#fff',
      fontSize: 8,
      fontWeight: 'bold',
    },

    // Discount Actions Styles
    discountActionsContainer: {
      flexDirection: 'row',
      gap: 8,
      marginBottom: 8,
    },
    removeDiscountButton: {
      backgroundColor: theme.colors.error || '#ff4444',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
    },
    addDiscountButton: {
      backgroundColor: theme.colors.secondary || theme.colors.primary,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
    },
    discountButtonText: {
      color: '#fff',
      fontSize: 12,
    },

    // Enhanced Quantity Input Styles
    quantityInput: {
      fontSize: 18,
      fontWeight: 'bold',
      marginHorizontal: 14,
      minWidth: 40,
      textAlign: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 6,
      paddingHorizontal: 8,
      backgroundColor: theme.colors.background,
      color: theme.colors.text,
    },

    // Product Section Styles
    productSectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    productHeaderLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    productHeaderRight: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    viewToggleButton: {
      padding: 8,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
    },
    productCount: {
      color: theme.colors.text,
    },

    // List View Styles
    productsList: {
      paddingBottom: 16,
    },
    productCardList: {
      margin: 6,
      padding: 14,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginBottom: 8,
      backgroundColor: theme.colors.cardBackground,
    },
    productListContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    productListInfo: {
      flex: 1,
      marginRight: 16,
    },
    productNameList: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 4,
    },
    productStockList: {
      fontSize: 12,
      marginTop: 2,
    },
    productPriceList: {
      fontSize: 16,
      fontWeight: 'bold',
      textAlign: 'right',
    },

    // Cart Header Styles
    cartHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    cartItemsBadge: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 10,
      paddingVertical: 3,
      borderRadius: 16,
    },
    cartItemsBadgeText: {
      color: '#fff',
      fontWeight: 'bold',
    },
    cartItemsBadgeLarge: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 20,
    },
    cartItemsBadgeTextLarge: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 16,
    },

    // Empty Cart Styles
    emptyCartContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 20,
    },
    emptyCartText: {
      color: theme.colors.text,
      fontSize: 16,
      textAlign: 'center',
    },

    // Modal Styles
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    modalContainer: {
      backgroundColor: theme.colors.background,
      borderRadius: 16,
      padding: 24,
      width: '100%',
      maxWidth: 450,
      maxHeight: '90%',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: 20,
      textAlign: 'center',
    },

    // Discount Type Toggle Styles
    discountTypeToggle: {
      flexDirection: 'row',
      marginBottom: 20,
      backgroundColor: theme.colors.background,
      borderRadius: 8,
      padding: 4,
    },
    discountTypeButton: {
      flex: 1,
      paddingVertical: 8,
      alignItems: 'center',
      borderRadius: 6,
    },
    discountTypeButtonActive: {
      backgroundColor: theme.colors.primary,
    },
    discountTypeButtonText: {
      fontWeight: '500',
    },
    discountTypeButtonTextActive: {
      color: '#fff',
    },
    discountTypeButtonTextInactive: {
      color: theme.colors.text,
    },

    // Modal ScrollView
    modalScrollView: {
      maxHeight: 400,
    },

    // Coupon Input Styles
    couponInput: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 16,
      color: theme.colors.text,
      backgroundColor: theme.colors.background,
      marginBottom: 16,
    },
    couponListContainer: {
      marginBottom: 20,
    },
    couponListTitle: {
      color: theme.colors.text,
      marginBottom: 8,
      fontSize: 14,
    },
    couponItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 8,
      paddingHorizontal: 12,
      marginBottom: 4,
      borderRadius: 8,
    },
    couponItemActive: {
      backgroundColor: theme.colors.primary + '20',
      borderWidth: 1,
      borderColor: theme.colors.primary,
    },
    couponItemInactive: {
      backgroundColor: 'transparent',
      borderWidth: 0,
    },
    couponCode: {
      color: theme.colors.text,
      fontWeight: '500',
    },
    couponName: {
      color: theme.colors.primary,
      fontSize: 12,
    },

    // Manual Discount Styles
    manualDiscountSection: {
      marginBottom: 16,
    },
    manualDiscountLabel: {
      color: theme.colors.text,
      marginBottom: 8,
      fontSize: 16,
      fontWeight: '500',
    },
    manualDiscountTypeRow: {
      flexDirection: 'row',
      gap: 12,
    },
    manualDiscountTypeButton: {
      flex: 1,
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 8,
      borderWidth: 1,
      alignItems: 'center',
    },
    manualDiscountTypeButtonActive: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primary + '10',
    },
    manualDiscountTypeButtonInactive: {
      borderColor: theme.colors.border,
      backgroundColor: 'transparent',
    },
    manualDiscountTypeText: {
      fontWeight: '500',
    },
    manualDiscountTypeTextActive: {
      color: theme.colors.primary,
    },
    manualDiscountTypeTextInactive: {
      color: theme.colors.text,
    },
    manualDiscountInput: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 16,
      color: theme.colors.text,
      backgroundColor: theme.colors.background,
    },
    manualDiscountHint: {
      color: theme.colors.text,
      fontSize: 12,
      marginTop: 4,
    },

    // Modal Button Styles
    modalButtonRow: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 16,
    },
    modalCancelButton: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 12,
      backgroundColor: theme.colors.border,
      alignItems: 'center',
    },
    modalCancelButtonText: {
      color: theme.colors.text,
      fontWeight: '500',
    },
    modalApplyButton: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 12,
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
    },
    modalApplyButtonText: {
      color: '#fff',
      fontWeight: 'bold',
    },

    // Floating Cart Button Styles
    floatingCartButton: {
      position: 'absolute',
      bottom: 20,
      right: 20,
      width: 60,
      height: 60,
      borderRadius: 30,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    cartBadge: {
      position: 'absolute',
      top: -5,
      right: -5,
      backgroundColor: '#ff4444',
      borderRadius: 12,
      minWidth: 24,
      height: 24,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: '#fff',
    },
    cartBadgeText: {
      color: '#fff',
      fontSize: 12,
      fontWeight: 'bold',
    },

    // Cart Modal Styles
    cartModalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
    },
    cartModalBackdrop: {
      flex: 1,
    },
    cartModalContainer: {
      backgroundColor: theme.colors.background,
      height: '80%',
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingTop: 20,
      paddingHorizontal: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    cartModalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
      paddingBottom: 10,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    cartModalTitle: {
      fontSize: 24,
      fontWeight: 'bold',
    },
    cartModalList: {
      flex: 1,
      marginBottom: 20,
    },
    cartModalPayment: {
      borderTopWidth: 1,
      paddingTop: 20,
      marginBottom: 20,
    },

    // Header Styles
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    headerActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
    },
    viewModeToggle: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 4,
    },

    // Order Tabs Styles
    orderTabsContainer: {
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    orderTabsScrollView: {
      flexGrow: 0,
    },
    orderTab: {
      marginRight: 8,
      paddingHorizontal: 8, // Reduce padding to make space for close button
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
      minWidth: 120, // Increase min width to accommodate all elements
    },
    orderTabContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between', // Change to space-between for better layout
      flex: 1,
    },
    orderTabText: {
      fontSize: 14,
      fontWeight: '500',
      marginRight: 4, // Reduce margin
      flex: 1, // Allow text to take available space
    },
    orderTabBadge: {
      minWidth: 18,
      height: 18,
      borderRadius: 9,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 4, // Reduce margin
    },
    orderTabBadgeText: {
      fontSize: 11,
      fontWeight: 'bold',
    },
    orderTabCloseButton: {
      width: 24, // Increase touch area
      height: 24, // Increase touch area
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: 4, // Add some spacing
      // Add visual feedback
      opacity: 0.9,
      // Separate touch area from parent
      position: 'relative',
      zIndex: 999,
    },
    orderTabCloseText: {
      fontSize: 16, // Make it slightly bigger
      fontWeight: 'bold',
      lineHeight: 16,
      textAlign: 'center',
      // Add text shadow for better visibility
      textShadowColor: 'rgba(0,0,0,0.3)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    },
    addOrderButton: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
      borderStyle: 'dashed',
      justifyContent: 'center',
      alignItems: 'center',
      minWidth: 100,
    },
    addOrderButtonText: {
      fontSize: 14,
      fontWeight: '500',
    },

    // Cart Modal Order Tabs
    cartModalOrderTabs: {
      paddingTop: 8,
      paddingHorizontal: 8,
    },
  }));
}
