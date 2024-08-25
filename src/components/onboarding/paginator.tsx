import { View, Text, Animated, useWindowDimensions } from 'react-native'
import React from 'react'

export type Props = {
    data: any
    scrollX: Animated.Value
}   

export const Paginator = ({data, scrollX}: Props) => {
    const { width } = useWindowDimensions()
  return (
    <View className="flex-1 flex-row h-16 justify-center items-center -mt-60">
      {data.map((_: any, i: number) => {
        const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
        const dotWidth = scrollX.interpolate({
          inputRange,
          outputRange: [10, 20, 10],
          extrapolate: 'clamp',
        });
        const opacity = scrollX.interpolate({
          inputRange,
          outputRange: [0.3, 1, 0.3],
          extrapolate: 'clamp',
        });

        return (
          <Animated.View
            key={i.toString()}
            style={{
              height: 10,
              width: dotWidth,
              backgroundColor: '#7e22ce',
              borderRadius: 8,
              marginHorizontal: 8,
              opacity
            }}
          />
        );
      })}
    </View>
  )
}