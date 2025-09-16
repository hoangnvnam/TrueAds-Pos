import { useEffect, useState } from 'react';
import { Dimensions } from 'react-native';

export const useOrientation = () => {
  const [screenData, setScreenData] = useState(Dimensions.get('window'));
  const [isLandscape, setIsLandscape] = useState(() => {
    const { width, height } = Dimensions.get('window');
    return width > height;
  });

  useEffect(() => {
    const onChange = (result: any) => {
      setScreenData(result.window);
      setIsLandscape(result.window.width > result.window.height);
    };

    const subscription = Dimensions.addEventListener('change', onChange);
    return () => subscription?.remove();
  }, []);

  return {
    screenData,
    isLandscape,
    isPortrait: !isLandscape,
  };
};
