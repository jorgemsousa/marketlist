import React, { Component, useEffect, useState } from 'react'
import { SafeAreaView, Text, TouchableOpacity, View } from 'react-native'
import { supabase } from '../../../database/supabase'
import { Session } from '@supabase/supabase-js'
import Login from '../../login'
import Container from '../../../components/container'
import { FontAwesome, Ionicons } from '@expo/vector-icons'

const Dashboard = () => {
    const [session, setSession] = useState<Session | null>(null)

    const DATA = [
        { day: 'Segunda', value: 10 },
        { day: 'Terça', value: 15 },
        { day: 'Quarta', value: 12 },
        { day: 'Quinta', value: 18 },
        { day: 'Sexta', value: 14 },
        { day: 'Sábado', value: 16 },
        { day: 'Domingo', value: 11 },
    ]

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
                    <View className='flex-row items-center justify-between mt-4 p-4'>
                        <View className='flex-row items-center justify-start gap-2'>
                            <FontAwesome name="user-circle" size={44} color="#72cc" />
                            <Text className='text-zinc-400 text-xl'>{session.user.email}</Text>
                        </View>
                        <TouchableOpacity onPress={signOut}>
                            <Ionicons name="exit" size={24} color="#72cc" />
                        </TouchableOpacity>
                    </View>
                    <View className='flex-2 items-center justify-center w-full h-90'>
                        <Text className='text-zinc-800 text-2xl'>bem-vindo </Text>
                    </View>
                </SafeAreaView>
            ): (
                <Login />
            )}
        </>
    )

}

export default Dashboard;