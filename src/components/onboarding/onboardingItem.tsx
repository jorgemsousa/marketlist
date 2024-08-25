import React from 'react';
import { View, Text, Image, useWindowDimensions } from 'react-native';

export interface Props {
    item: {
        title: string;
        description: string;
        image: any; 
    };
}

export const OnboardingItem = ({ item: {title, description, image} }: Props) => {
    const { width, height } = useWindowDimensions(); 

    return (
        <View style={{width, height}} className="flex-1 -mb-20">
            <Image 
                source={image} 
                style={{ width, height: height * 0.7, resizeMode: 'contain' }} 
                className="flex-1 -mt-10" 
            />
            <View style={{ paddingHorizontal: 20 }} className="flex-1 justify-center -mt-80">
                <Text className="text-3xl font-bold text-center text-purple-700 mb-2">
                    {title}
                </Text>
                <Text className="text-center text-xl text-zinc-400">
                    {description}
                </Text>
            </View>
        </View>
    );
}
