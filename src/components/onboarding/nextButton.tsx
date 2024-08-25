import { View, Animated, TouchableOpacity } from 'react-native';
import React, { useEffect, useRef } from 'react';
import Svg, { G, Circle } from 'react-native-svg';
import { AntDesign } from '@expo/vector-icons';

export type Props = {
  percentage: number;
  scrollTo: () => void;
};

export const NextButton = ({ percentage, scrollTo }: Props) => {
  const size = 128;
  const strokeWidth = 2;
  const center = size / 2;
  const radius = size / 2 - strokeWidth / 2;
  const circumference = 2 * Math.PI * radius;

  const progressAnimation = useRef(new Animated.Value(0)).current;
  const progressRef = useRef<Circle>(null);

  const animation = (toValue: number) => {
    return Animated.timing(progressAnimation, {
      toValue,
      duration: 250,
      useNativeDriver: false, // useNativeDriver false for animating SVG
    }).start();
  };

  useEffect(() => {
    animation(percentage);
  }, [percentage]);

  useEffect(() => {
    progressAnimation.addListener((value) => {
      const strokeDashoffset = circumference - (circumference * value.value) / 100;
      if (progressRef?.current) {
        progressRef.current.setNativeProps({
          strokeDashoffset,
        });
      }
    });

    return () => {
      progressAnimation.removeAllListeners();
    };
  }, []);

  return (
    <View className='flex-1 justify-center items-center mb-20'>
      <Svg width={size} height={size}>
        <G rotation="-90" origin={center}>
          <Circle 
            stroke="#E6E7E8" 
            fill="none" 
            cx={center} 
            cy={center} 
            r={radius} 
            strokeWidth={strokeWidth} 
          />
          <Circle
            ref={progressRef}
            stroke="#7e22ce"
            fill="none"
            cx={center}
            cy={center}
            r={radius}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={circumference}
          />
        </G>
      </Svg>
      <TouchableOpacity className="absolute p-8 rounded-full bg-purple-600" onPress={scrollTo}>
        <AntDesign name="arrowright" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
};