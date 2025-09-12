import { useNavigation } from '@react-navigation/native';
import { useLayoutEffect } from 'react';
import { useNotification } from '~/contexts/NotificationContext';

export const NotificationHandler = () => {
  const navi = useNavigation();
  const { gotoMessages, setGotoMessages } = useNotification();

  useLayoutEffect(() => {
    if (gotoMessages) {
      try {
        // if (gotoMessages) {
        //   navi.navigate('Messages', {
        //     param: gotoMessages,
        //   });
        //   setGotoMessages(null);
        // }
      } catch (error) {
        setGotoMessages(null);
      }
    }
  }, [gotoMessages, navi]);

  return null;
};
