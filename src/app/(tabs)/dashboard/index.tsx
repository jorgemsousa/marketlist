import React, { Component, useEffect, useState } from 'react'
import { SafeAreaView, Text, TouchableOpacity, View } from 'react-native'
import { supabase } from '../../../database/supabase'
import { Session } from '@supabase/supabase-js'
import { CartesianChart, CartesianChartRenderArg } from "victory-native";
import Login from '../../login'
import Container from '../../../components/container'
import { FontAwesome, Ionicons } from '@expo/vector-icons'

const Dashboard = () => {
    const [session, setSession] = useState<Session | null>(null)

    const DATA = Array.from({ length: 31 }, (_, i) => ({
        day: i,
        highTmp: 40 + 30 * Math.random(),
      }));

    const signOut = () => {
        supabase.auth.signOut();
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
                    <View className='mt-80 justify-center items-center'>
                        <Text className='text-purple-700 text-center font-bold text-3xl'>Dashboard</Text>
                    </View>
                </SafeAreaView>
            ): (
                <Login />
            )}
        </>
    )

}

export default Dashboard;