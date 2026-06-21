import React, { useEffect, useState, useMemo } from "react";
import {
  FlatList,
  SafeAreaView,
  Text,
  View,
  TouchableOpacity,
  Modal,
  Image,
  Alert,
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
import { useTheme } from "@/src/contexts/ThemeContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Dashboard = () => {
  const auth = getAuth();
  const { colors, isDark } = useTheme();
  const [session, setSession] = useState<{ user: any } | null>(null);
  const [lists, setLists] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedList, setSelectedList] = useState<any | null>(null);
  const [items, setItems] = useState<any[]>([]);
  const font = useFont(
    require("../../../../assets/fonts/SpaceMono-Regular.ttf"),
    12
  );

  const signOut = async () => {
    try {
      await AsyncStorage.removeItem("userCredentials");
      await auth.signOut();
      router.replace("/");
    } catch {
      Alert.alert("Erro", "Não foi possível fazer logout.");
    }
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

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) setSession({ user });
      else setSession(null);
    });
  }, []);

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

  const openLists = lists.filter((l) => l.status === "open");
  const closedLists = lists.filter((l) => l.status === "finalizada");

  const parseTimestampString = (str: string) => {
    if (!str) return null;
    const match = str.match(
      /seconds(?:ec)?=(\d+)(?:,\s*nanoseconds(?:ec)?=(\d+))?/i
    );
    if (match) {
      const seconds = parseInt(match[1]);
      const nanos = parseInt(match[2] || "0");
      const ms = seconds * 1000 + Math.floor(nanos / 1_000_000);
      return new Date(ms);
    }
    const fallbackDate = new Date(str);
    return isNaN(fallbackDate.getTime()) ? null : fallbackDate;
  };

  const formatDateToString = (date: Date) => {
    if (!date) return "";
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    return `${day}/${month}`;
  };

  const formatXAxisLabel = (index: number) => {
    const item = chartData[index];
    if (!item) return "";
    const date = new Date(item.timestamp || 0);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    return `${day}/${month}`;
  };

  const chartData = useMemo(() => {
    const filteredAndSorted = closedLists
      .filter((l) => l.name && l.name.trim() !== "")
      .sort((a, b) => {
        const dateA = parseTimestampString(a.closed);
        const dateB = parseTimestampString(b.closed);
        const timeA = dateA?.getTime() || 0;
        const timeB = dateB?.getTime() || 0;
        return timeA - timeB;
      });

    return filteredAndSorted
      .map((l, index) => {
        const date = parseTimestampString(l.closed);
        const timestamp = date ? date.getTime() : null;
        const label = date ? formatDateToString(date) : "Data inválida";
        return {
          x: index,
          timestamp,
          label,
          total: Number(l.total) || 0,
        };
      })
      .filter((item) => item.timestamp !== null && item.total !== undefined);
  }, [closedLists]);

  if (!font) return <Text style={{ color: colors.text }}>Carregando fonte...</Text>;

  return (
    <>
      {session && session.user ? (
        <>
          <Header title="Dashboard" signOut={signOut} />
          <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            <Text
              style={{
                color: colors.primary,
                textAlign: "center",
                fontWeight: "bold",
                fontSize: 16,
                margin: 16,
              }}
            >
              Gráfico de gastos
            </Text>
            <View style={{ height: 300, padding: 16 }}>
              {chartData.length > 0 ? (
                <CartesianChart
                  data={chartData}
                  xKey="x"
                  yKeys={["total"]}
                  domainPadding={{ left: 60, right: 60, top: 30, bottom: 120 }}
                  axisOptions={{
                    font: font || undefined,
                    labelColor: colors.primary,
                    formatXLabel: (index: number) => chartData[index]?.label || "",
                  } as any}
                >
                  {({ points, chartBounds }) => (
                    <>
                      <Line
                        points={points.total}
                        color={colors.primary}
                        strokeWidth={3}
                        animate={{ type: "timing", duration: 800 }}
                      />
                      <Area
                        points={points.total}
                        y0={chartBounds.bottom}
                        animate={{ type: "timing", duration: 800 }}
                        color={colors.primary}
                        opacity={0.3}
                      >
                        <LinearGradient
                          start={vec(0, chartBounds.top)}
                          end={vec(0, chartBounds.bottom)}
                          colors={[colors.primary, "rgba(172, 36, 219, 0.05)"]}
                        />
                      </Area>
                      {points.total.map((p, i) => (
                        p.y != null && (
                          <React.Fragment key={i}>
                            <Line
                              points={[
                                { x: p.x - 3, y: Math.max(0, (p.y || 0) - 3) },
                                { x: p.x + 3, y: (p.y || 0) + 3 },
                              ] as any}
                              color={colors.primary}
                              strokeWidth={8}
                              animate={{ type: "timing", duration: 800 }}
                            />
                          </React.Fragment>
                        )
                      ))}
                    </>
                  )}
                </CartesianChart>
              ) : (
                <View className="flex-1 justify-center items-center">
                  <Text
                    style={{
                      textAlign: "center",
                      color: colors.textSecondary,
                      fontSize: 18,
                      fontWeight: "600",
                    }}
                  >
                    Nenhuma lista finalizada ainda 😊{"\n"}Crie e finalize uma pra
                    ver o gráfico!
                  </Text>
                </View>
              )}
            </View>
            <View style={{ flex: 1, paddingHorizontal: 16 }}>
              <Text
                style={{
                  color: colors.primary,
                  textAlign: "center",
                  fontWeight: "bold",
                  fontSize: 16,
                  margin: 16,
                }}
              >
                Listas fechadas
              </Text>
              <FlatList
                data={closedLists}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                  <TouchableOpacity onPress={() => handleOpenList(item)}>
                    <View
                      style={{
                        flexDirection: "row",
                        padding: 16,
                        backgroundColor: colors.card,
                        alignItems: "center",
                        justifyContent: "space-between",
                        borderRadius: 12,
                        marginTop: 8,
                      }}
                    >
                      <Text style={{ color: colors.primary, fontWeight: "bold" }}>
                        {item.name}
                      </Text>
                      <Text style={{ color: colors.primary, fontWeight: "bold" }}>
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
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: colors.overlay,
          }}
        >
          <View
            style={{
              backgroundColor: colors.white,
              padding: 16,
              borderRadius: 16,
              width: "91.666%",
              maxHeight: "90%",
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: "bold",
                marginBottom: 16,
                color: colors.primary,
              }}
            >
              {selectedList?.name}
            </Text>
            <FlatList
              data={items}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: 12,
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border,
                  }}
                >
                  {item.imageUrl && (
                    <Image
                      source={{ uri: item.imageUrl }}
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 8,
                        marginRight: 12,
                      }}
                    />
                  )}
                  <Text
                    style={{ color: colors.primary, flex: 1 }}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {item.name}
                  </Text>
                  <Text
                    style={{
                      color: isDark ? colors.textSecondary : "#374151",
                      width: 48,
                      textAlign: "right",
                    }}
                  >
                    {item.quantity}
                  </Text>
                  <Text
                    style={{
                      color: isDark ? colors.textSecondary : "#374151",
                      width: 80,
                      textAlign: "right",
                    }}
                  >
                    R$ {(item.price * item.quantity).toFixed(2)}
                  </Text>
                </View>
              )}
            />
            <View
              style={{
                flexDirection: "row",
                marginTop: 16,
                justifyContent: "space-between",
              }}
            >
              <Text
                style={{ color: colors.primary, fontWeight: "bold", textAlign: "right" }}
              >
                Total de itens:{" "}
                {items.reduce((acc, item) => acc + item.quantity, 0)}
              </Text>
              <Text
                style={{ color: colors.primary, fontWeight: "bold", textAlign: "right" }}
              >
                Total: R$ {selectedList?.total.toFixed(2)}
              </Text>
            </View>
            <TouchableOpacity
              style={{
                borderWidth: 1,
                borderColor: colors.primary,
                alignItems: "center",
                justifyContent: "center",
                paddingVertical: 12,
                borderRadius: 999,
                marginTop: 16,
              }}
              onPress={() => setModalVisible(false)}
            >
              <Text
                style={{
                  color: colors.primary,
                  fontWeight: "bold",
                  textAlign: "center",
                }}
              >
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
