// ← Verifica se esse path tá certo!
import React, { useEffect, useState, useMemo } from "react";
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
import * as Font from "expo-font";
import { RotateInDownLeft } from "react-native-reanimated";

const Dashboard = () => {
  const auth = getAuth();
  const [session, setSession] = useState<{ user: any } | null>(null);
  const [lists, setLists] = useState<any[]>([]); // listas do Firestore
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedList, setSelectedList] = useState<any | null>(null);
  const [items, setItems] = useState<any[]>([]);
  const font = useFont(
    require("../../../../assets/fonts/SpaceMono-Regular.ttf"),
    12
  );
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
      const data = snapshot.docs.map((doc) => {
        const raw = doc.data();
        return {
          id: doc.id,
          name: raw.name ?? "Sem nome",
          total: parseFloat(raw.total ?? raw.total_value ?? 0),
          status: (raw.status ?? "open").toLowerCase(),
          closed: raw?.updatedAt?.toString(),
        };
      });
      setLists(data);
    });
    return () => unsub();
  }, []);

  // Filtrar listas abertas e fechadas
  const openLists = lists.filter((l) => l.status === "open");
  const closedLists = lists.filter((l) => l.status === "finalizada");

  // Funções de parse e format
  const parseTimestampString = (str: string) => {
    if (!str) return null;
    // Regex mais flexível pro Firestore Timestamp
    const match = str.match(
      /seconds(?:ec)?=(\d+)(?:,\s*nanoseconds(?:ec)?=(\d+))?/i
    );
    if (match) {
      const seconds = parseInt(match[1]);
      const nanos = parseInt(match[2] || "0");
      const ms = seconds * 1000 + Math.floor(nanos / 1_000_000);
      return new Date(ms);
    }
    // Fallback: tenta parse direto se for ISO string
    const fallbackDate = new Date(str);
    return isNaN(fallbackDate.getTime()) ? null : fallbackDate;
  };

  const formatDateToString = (date: Date) => {
    if (!date) return "";
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = String(date.getFullYear()).slice(-2);
    return `${day}/${month}`; // Ou só data sem hora, como você tinha
  };

  const formatXAxisLabel = (index: number) => {
    const item = chartData[index];
    if (!item) return "";
    const date = new Date(item.timestamp || 0);
    const day = String(date.getDate()).padStart(2, "0"); // Dia com zero à esquerda
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Mês (0-based +1)
    const year = String(date.getFullYear()).slice(-2); // Ano completo
    return `${day}/${month}`; // Formato DD/MM/YYYY
  };

  // useMemo pro chartData (com logs)
  const chartData = useMemo(() => {
    const filteredAndSorted = closedLists
      .filter((l) => l.name && l.name.trim() !== "")
      .sort((a, b) => {
        const dateA = parseTimestampString(a.closed);
        const dateB = parseTimestampString(b.closed);
        const timeA = dateA?.getTime() || 0;
        const timeB = dateB?.getTime() || 0;
        return timeA - timeB; // Inverte pra mais recente primeiro (ajusta se quiser asc)
      });

    const processedData = filteredAndSorted
      .map((l, index) => {
        // index aqui!
        const date = parseTimestampString(l.closed);
        const timestamp = date ? date.getTime() : null;
        const label = date ? formatDateToString(date) : "Data inválida";
        return {
          x: index, // Índice simples pra X
          timestamp, // Mantém pro sort, mas não usa no chart
          label,
          total: Number(l.total) || 0,
        };
      })
      .filter((item) => item.timestamp !== null && item.total !== undefined);
    return processedData;
  }, [closedLists]);

  if (!font) return <Text>Carregando fonte...</Text>;

  const validPoints = chartData.map((item, i) => ({
    x: i * 50, // espaçamento horizontal fixo ou calculado
    y: item.total,
    label: item.label,
  }));

  return (
    <>
      {session && session.user ? (
        <>
          <Header title="Dashboard" signOut={signOut} />
          <SafeAreaView className="flex-1 bg-white">
            <Text className="text-purple-700 text-center font-bold text-md m-4">
              Gráfico de gastos
            </Text>
            <View className="h-[300] w-auto p-4">
              {chartData.length > 0 ? (
                <CartesianChart
                  data={chartData}
                  xKey="x" // Muda pra "x" index!
                  yKeys={["total"]}
                  domainPadding={{ left: 60, right: 60, top: 30, bottom: 120 }}
                  axisOptions={{
                    font: font || undefined,
                    labelColor: "#ac24db",
                    formatXLabel: (index) => chartData[index]?.label || "",
                    x: { labelCount: Math.min(5, chartData.length) },
                  }}
                >
                  {({ points, chartBounds }) => (
                    <>
                      <Line
                        points={points.total}
                        color="#ac24db"
                        strokeWidth={3}
                        animate={{ type: "timing", duration: 800 }}
                      />
                      <Area
                        points={points.total}
                        y0={chartBounds.bottom}
                        animate={{ type: "timing", duration: 800 }}
                        color="#ac24db"
                        opacity={0.3}
                      >
                        <LinearGradient
                          start={vec(0, chartBounds.top)}
                          end={vec(0, chartBounds.bottom)}
                          colors={["#ac24db", "rgba(172, 36, 219, 0.05)"]}
                        />
                      </Area>
                      {points.total.map((p, i) => (
                        <React.Fragment key={i}>
                          <Line
                            points={[
                              { x: p.x - 3, y: p.y - 3 },
                              { x: p.x + 3, y: p.y + 3 },
                            ]}
                            color="#ac24db"
                            strokeWidth={8}
                            animate={{
                              type: "timing",
                              duration: 800,
                            }}
                          />
                        </React.Fragment>
                      ))}
                    </>
                  )}
                </CartesianChart>
              ) : (
                <View className="flex-1 justify-center items-center">
                  <Text className="text-center text-gray-500 text-lg font-semibold">
                    Nenhuma lista finalizada ainda 😊{"\n"}Crie e finalize uma
                    pra ver o gráfico!
                  </Text>
                </View>
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
