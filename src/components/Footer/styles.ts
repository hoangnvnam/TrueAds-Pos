import { Dimensions, StyleSheet } from "react-native";
const { height, width } = Dimensions.get('window');
export const styles = StyleSheet.create({
    footerContainer: {
        position: 'absolute',
        width: width,
        paddingHorizontal: 10,
        bottom: 20,
        left: 0,
        right: 0,
        alignItems: 'center',
        justifyContent: 'space-between',   
        flexDirection: 'row',
      },
      footerImage: {
        width: width * 0.4,
        height: 40,
        resizeMode: 'contain',
      },
      hotlineButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#333',
        padding: 10,
        paddingHorizontal: 20,
        marginTop: 15,
      },
      hotlineText: {
        color: 'white',
        marginLeft: 8,
        fontSize: 14,
      },
})