import { useEffect, useRef } from 'react';
import { BackHandler, ToastAndroid } from 'react-native';

const useBackHandler = (onBackPress) => {
  const backPressCount = useRef(0);
  const backPressTimer = useRef(null);

  useEffect(() => {
    const backAction = () => {
      if (backPressCount.current === 0) {
        backPressCount.current = 1;
        ToastAndroid.show('Press back again to exit', ToastAndroid.SHORT);
        
        // Reset the count after 2 seconds
        backPressTimer.current = setTimeout(() => {
          backPressCount.current = 0;
        }, 2000);
        
        return true;
      } else {
        // Clear the timer if it exists
        if (backPressTimer.current) {
          clearTimeout(backPressTimer.current);
        }
        // Call the provided onBackPress function
        onBackPress();
        return true;
      }
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => {
      backHandler.remove();
      if (backPressTimer.current) {
        clearTimeout(backPressTimer.current);
      }
    };
  }, [onBackPress]);
};

export default useBackHandler; 