import React, { useEffect, useState } from "react";
import {
  FlatList,
  SafeAreaView,
  Text,
  View,
  TouchableOpacity,
  Modal,
  Image,
  useColorScheme,
} from "react-native";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  collection,
  onSnapshot,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "@/src/database/firebaseConfig";
import { CartesianChart, Line, Area } from "victory-native";
import { router } from "expo-router";
import { LinearGradient, useFont, vec } from "@shopify/react-native-skia";
import Header from "@/src/components/header";
import Login from "../../login";

const mono = require("../../../../assets/fonts/SpaceMono-Regular.ttf");

const Dashboard = () => {
  const auth = getAuth();
  const [session, setSession] = useState<{ user: any } | null>(null);
  const [lists, setLists] = useState<any[]>([]); // listas do Firestore

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedList, setSelectedList] = useState<any | null>(null);
  const [items, setItems] = useState<any[]>([]);

  const font = useFont(mono, 12);
  const colorMode = useColorScheme();

  const labelColor = colorMode === "dark" ? "#fff" : "#000";
  const lineColor = colorMode === "dark" ? "lightgrey" : "#000";

  const signOut = () => {
    auth.signOut();
    router.replace("/login");
  };

  const handleOpenList = async (list: any) => {
    try {
      const snap = await getDocs(collection(db, "lists", list.id, "items"));
      const listItems = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      setItems(listItems);
      setSelectedList(list);
      setModalVisible(true);
    } catch (error) {
      console.error("Erro ao carregar itens da lista:", error);
    }
  };

  // Monitorar autenticação
  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) setSession({ user });
      else setSession(null);
    });
  }, []);

  // Buscar listas do Firestore
  useEffect(() => {
    const listsRef = collection(db, "lists");
    const q = query(listsRef, where("uid", "==", auth.currentUser?.uid));

    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name || "Sem nome",
        total: Number(doc.data().total) || 0,
        status: doc.data().status || "open",
      }));
      setLists(data);
    });

    return () => unsub();
  }, []);

  // Separar listas abertas e fechadas
  const openLists = lists.filter((l) => l.status === "open");
  const closedLists = lists.filter((l) => l.status === "finalizada");

  // Preparar dados para gráfico (somente listas fechadas)
  const chartData = closedLists
    .filter((l) => l.name && l.name.trim() !== "")
    .map((l) => ({
      label: l.name,
      total: Number(l.total) || 0,
    }));

  return (
    <>
      {session && session.user ? (
        <>
          <Header title="Dashboard" signOut={signOut} />
          <SafeAreaView className="flex-1 bg-white px-6">
            <Text className="text-purple-700 text-center font-bold text-md m-4">
              Gráfico de gastos
            </Text>
            <View style={{ height: 300, width: "auto", padding: 16 }}>
              {chartData.length > 0 ? (
                <CartesianChart
                  data={chartData}
                  xKey="label"
                  yKeys={["total"]}
                  domainPadding={{ top: 30 }}
                  axisOptions={{
                    font,
                    labelColor,
                    lineColor,
                  }}
                >
                  {({ points, chartBounds }) => (
                    <>
                      <Line
                        points={points.total}
                        color={"#ac24db"}
                        strokeWidth={3}
                        animate={{ type: "timing", duration: 500 }}
                      />
                      <Area
                        points={points.total}
                        y0={chartBounds.bottom}
                        animate={{ type: "timing", duration: 500 }}
                        color={"#ac24db"}
                        opacity={0.2}
                      >
                        <LinearGradient
                          start={vec(chartBounds.bottom, 200)}
                          end={vec(chartBounds.bottom, chartBounds.bottom)}
                          colors={["#ac24db", "#ac20db00"]}
                        />
                      </Area>
                    </>
                  )}
                </CartesianChart>
              ) : (
                <Text className="text-center text-gray-500 mt-10">
                  Nenhuma lista finalizada ainda
                </Text>
              )}
            </View>

            <View style={{ flex: 1, paddingHorizontal: 16 }}>
              <Text className="text-purple-700 text-center font-bold text-md m-4">
                Listas fechadas
              </Text>
              <FlatList
                data={closedLists}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                  <TouchableOpacity onPress={() => handleOpenList(item)}>
                    <View className="flex-row p-4 bg-gray-100 items-center justify-between rounded-lg mt-2 w-full">
                      <Text style={{ color: "#7b3fbd", fontWeight: "bold" }}>
                        {item.name}
                      </Text>
                      <Text style={{ color: "#7b3fbd", fontWeight: "bold" }}>
                        R$ {item.total.toFixed(2)}
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}
              />
            </View>
          </SafeAreaView>
        </>
      ) : (
        <Login />
      )}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white p-4 rounded-2xl w-11/12 max-h-[90%]">
            <Text className="text-lg font-bold mb-4 text-purple-700">
              {selectedList?.name}
            </Text>

            <FlatList
              data={items}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View className="flex-row justify-between items-center p-3 border-b border-gray-200">
                  {item.imageUrl && (
                    <Image
                      source={{ uri: item.imageUrl }}
                      className="w-10 h-10 rounded-md mr-3"
                    />
                  )}
                  <Text
                    className="text-purple-700 flex-1"
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {item.name}
                  </Text>
                  <Text className="text-gray-700 w-12 text-right">
                    {item.quantity}
                  </Text>
                  <Text className="text-gray-700 w-20 text-right">
                    R$ {(item.price * item.quantity).toFixed(2)}
                  </Text>
                </View>
              )}
            />

            <View className="flex-row mt-4 justify-between">
              <Text className="text-purple-700 font-bold text-right">
                Total de itens:{" "}
                {items.reduce((acc, item) => acc + item.quantity, 0)}
              </Text>
              <Text className="text-purple-700 font-bold text-right">
                Total: R$ {selectedList?.total.toFixed(2)}
              </Text>
            </View>

            <TouchableOpacity
              className="border border-purple-700 items-center justify-center py-3 rounded-full mt-4"
              onPress={() => setModalVisible(false)}
            >
              <Text className="text-purple-700 font-bold text-center">
                Fechar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default Dashboard;
