import React, { Component, useEffect, useState } from 'react'
import { SafeAreaView, Text, TouchableOpacity, useColorScheme, View } from 'react-native'
import { supabase } from '../../../database/supabase'
import { Session } from '@supabase/supabase-js'
import { CartesianChart, Bar, Line, Area } from "victory-native";
import Login from '../../login'
import { FontAwesome, Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router';
import { LinearGradient, useFont, vec } from '@shopify/react-native-skia';

const mono = require('../../../../assets/fonts/SpaceMono-Regular.ttf');

const Dashboard = () => {
    const [session, setSession] = useState<Session | null>(null)
    
    const font = useFont(mono, 12);
    const colorMode = useColorScheme();
 
    const labelColor = colorMode === "dark" ? "#fff" : "#000";   
    const lineColor = colorMode === "dark" ? "lightgrey" : "#000";

    const DATA = [
        {day: "08-01", highTmp: 100},
        {day: "08-02", highTmp: 300},
        {day: "08-03", highTmp: 400},
        {day: "08-04", highTmp: 600},  
        {day: "08-05", highTmp: 1000},
        {day: "08-06", highTmp: 700},
    ];

    const signOut = () => {
        supabase.auth.signOut();
        router.replace('/login');
    }

    useEffect(() => {
        supabase.auth.getSession().then(({data: {session}}) => {
            setSession(session);
        });

        supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });
    }, [])

    return (
        <>
            {session && session.user ? (
                <SafeAreaView>
                    <View className='flex-row items-center justify-end mt-4 p-4 w-full'>                       
                        <TouchableOpacity onPress={signOut}>
                            <Ionicons name="exit" size={24} color="#72cc" />
                        </TouchableOpacity>
                    </View>
                    <Text className='text-purple-700 text-center font-bold text-md mb-4'>Ultimas Compras</Text>
                    <View className='tems-center justify-center px-8 mt-2 w-full'>
                        <View style={{ height: 300, width: "auto" }}>
                            <CartesianChart
                                data={DATA}                
                                xKey={"day"}               
                                yKeys={["highTmp"]}
                                domainPadding={{ top: 30 }}
                                axisOptions={{
                                    font,
                                    labelColor,
                                    lineColor
                                }}    
                            >
                                {({ points, chartBounds }) => {
                                    return (
                                        <>
                                            <Line
                                                points={points.highTmp}
                                                color={"#ac24db"}
                                                strokeWidth={3}
                                                animate={{ type: "timing", duration: 500 }}
                                            />
                                            <Area
                                                points={points.highTmp}
                                                y0={chartBounds.bottom}
                                                animate={{ type: "timing", duration: 500 }}
                                                color={"#ac24db"}
                                                opacity={0.2}
                                            >
                                                <LinearGradient
                                                    start={vec(chartBounds.bottom, 200)}
                                                    end={vec(chartBounds.bottom, chartBounds.bottom)}
                                                    colors={["#ac24db", "#ac24db00"]}
                                                />
                                            </Area>
                                      </>
                                    );
                                }}
                            </CartesianChart>
                        </View>
                    </View>
                </SafeAreaView>
            ): (
                <Login />
            )}
        </>
    )

}

export default Dashboard;