import React, { useEffect, useState } from 'react';
import { FlatList, SafeAreaView, Text, View, useColorScheme } from 'react-native';
import { supabase } from '../../../database/supabase';
import { Session } from '@supabase/supabase-js';
import { CartesianChart, Line, Area } from "victory-native";
import { router } from 'expo-router';
import { LinearGradient, useFont, vec } from '@shopify/react-native-skia';
import Header from '@/src/components/header';
import Login from '../../login';

const mono = require('../../../../assets/fonts/SpaceMono-Regular.ttf');

const Dashboard = () => {
  const [session, setSession] = useState<Session | null>(null);
  const font = useFont(mono, 12);
  const colorMode = useColorScheme();

  const labelColor = colorMode === "dark" ? "#fff" : "#000";
  const lineColor = colorMode === "dark" ? "lightgrey" : "#000";

  const DATA = [
    { day: "08-01", highTmp: 100 },
    { day: "08-02", highTmp: 300 },
    { day: "08-03", highTmp: 400 },
    { day: "08-04", highTmp: 600 },
    { day: "08-05", highTmp: 1000 },
    { day: "08-06", highTmp: 700 },
  ];

  const ORDERS = [
    { day: "08-01", highTmp: 100, name: "Janeiro", open: false },
    { day: "08-02", highTmp: 300, name: "Fevereiro", open: false },
    { day: "08-03", highTmp: 400, name: "Março", open: false },
    { day: "18-03", highTmp: 600, name: "Março-02", open: false },
    { day: "08-04", highTmp: 1000, name: "Abril", open: true },
    { day: "08-05", highTmp: 700, name: "Maio", open: true },
  ];

  const signOut = () => {
    supabase.auth.signOut();
    router.replace('/login');
  };

  const chartOrders = (open: boolean) => {
    const orders = ORDERS.filter((order) => order.open === open);
    const data = orders.forEach(element => {
        element.day, element.highTmp
    });
    return data
  }

  const filterOrders = (open: boolean) => {
    return ORDERS.filter((order) => order.open === open);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  return (
    <>
      {session && session.user ? (
        <>
          <Header title='Dashboard' signOut={signOut} />
          <SafeAreaView className='flex-1 bg-white px-4'>
            <Text className='text-purple-700 text-center font-bold text-md m-4'>Gráfico de gastos</Text>
            <View style={{ height: 300, width: 'auto'}}>
              <CartesianChart
                data={DATA}
                xKey={"day"}
                yKeys={["highTmp"]}
                domainPadding={{ top: 30 }}
                axisOptions={{
                  font,
                  labelColor,
                  lineColor,
                }}
              >
                {({ points, chartBounds }) => (
                  <>
                    <Line points={points.highTmp} color={"#ac24db"} strokeWidth={3} animate={{ type: 'timing', duration: 500 }} />
                    <Area points={points.highTmp} y0={chartBounds.bottom} animate={{ type: 'timing', duration: 500 }} color={"#ac24db"} opacity={0.2}>
                      <LinearGradient start={vec(chartBounds.bottom, 200)} end={vec(chartBounds.bottom, chartBounds.bottom)} colors={["#ac24db", "#ac20db00"]} />
                    </Area>
                  </>
                )}
              </CartesianChart>
            </View>
            <View style={{ flex: 1, paddingHorizontal: 16 }}>
              <FlatList
                data={filterOrders(false)}
                keyExtractor={(item, index) => item?.day ?? index.toString()}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                  <View  className="flex-row p-4 bg-gray-100 items-center justify-between rounded-lg mt-2 w-full">
                    <Text style={{ color: '#7b3fbd', fontWeight: 'bold' }}>{item.name}</Text>
                    <Text style={{ color: '#7b3fbd', fontWeight: 'bold' }}>{item.highTmp}</Text>
                  </View>
                )}
              />
            </View>
          </SafeAreaView>
        </>
      ) : (
        <Login />
      )}
    </>
  );
};

export default Dashboard;
