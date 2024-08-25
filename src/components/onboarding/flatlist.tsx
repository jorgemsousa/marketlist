import React, {useState, useRef} from "react";
import { FlatList, Animated, View } from "react-native";
import { DATA } from "@/src/constants/slides";
import { OnboardingItem } from "./onboardingItem";
import { Paginator } from "./paginator";
import { NextButton } from "./nextButton";
import { useNavigation } from "expo-router";


export const OnboardingList = () => {
    const {navigate} = useNavigation();
    const [currentIndex, setCurrentIndex] = useState(0);
    const scrollX = useRef(new Animated.Value(0)).current;
    const slidesRef = useRef(null);

    const navigation = navigate;

    const viewableItemsChanged = useRef(({viewableItems}: any) => {
        setCurrentIndex(viewableItems[0].index);
    }).current;

    const viewConfig = useRef({viewAreaCoveragePercentThreshold: 50}).current;

    const scrollTo = () => {
        if (currentIndex < DATA.length - 1) {
            (slidesRef.current as any)?.scrollToIndex({index: currentIndex + 1});
        }
        else {
            navigation('login' as never);
        }
    };

    return (
        <View className="flex-1 bg-white">
            <View className="flex-3">
                <FlatList 
                    data={DATA}
                    renderItem={({item}) => (
                        <OnboardingItem item={item} />
                    )} 
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    pagingEnabled
                    bounces={false}
                    keyExtractor={(item) => item.id}
                    onScroll={Animated.event(
                        [{nativeEvent: {contentOffset: {x: scrollX}}}],
                        {useNativeDriver: false}
                    )}
                    scrollEventThrottle={32}
                    onViewableItemsChanged={viewableItemsChanged}
                    viewabilityConfig={viewConfig}
                    ref={slidesRef}
                />
            </View>
            <Paginator data={DATA} scrollX={scrollX} />
            <NextButton scrollTo={scrollTo} percentage={(currentIndex + 1) * (100 / DATA.length)}  />
        </View>
    );
}