import { Image, Text,   TouchableOpacity, View } from "react-native";
import Icon from 'react-native-vector-icons/MaterialIcons';
import { styles } from "./styles";
import { globalStyles } from "~/styles/globalStyles";
export function Footer() {
    return (
        <View style={styles.footerContainer}>
            <Image
          source={require('~/assets/adsagency-footer.png')}
          style={styles.footerImage}
        />
        <TouchableOpacity style={[styles.hotlineButton, globalStyles.roundedFull]}>
          <Icon name="phone" size={20} color="white" />
          <Text style={styles.hotlineText}>Gọi Hotline Hỗ Trợ</Text>
        </TouchableOpacity>
      </View>
    )
}