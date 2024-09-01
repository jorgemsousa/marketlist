import { Tabs } from "expo-router";
import { FontAwesome } from "@expo/vector-icons";

export default function DashLayout() {
  return (
    <Tabs 
        screenOptions={{
            tabBarShowLabel: false,
            tabBarStyle: {
                position: "absolute",
                borderRadius: 14,
                borderTopWidth: 2,
                borderBottomWidth: 2,
                borderLeftWidth: 2,
                borderRightWidth: 2,
                borderTopColor: "#7e22ce",
                borderBottomColor: "#7e22ce",
                borderLeftColor: "#7e22ce",
                borderRightColor: "#7e22ce",
                marginTop: 12,
                paddingTop: 4,
                paddingBottom: -2,
                
                
                bottom: 40,
                left: 14,
                right: 14,
                elevation: 0,
                height: 60,
            }           
            
        }}
    >     
      <Tabs.Screen 
        name="index"
        options={{
            headerShown: false,
            title: "Dashboard",
            tabBarIcon: ({ focused, color, size }) => {
                if (focused) {
                    return <FontAwesome name="dashboard" color={"#7e22ce"} size={size} />
                }

                return <FontAwesome name="dashboard" color={color} size={size} />
            }
        }}
      />
      <Tabs.Screen 
        name="orders"
        options={{
            headerShown: false,
            title: "Compras",
            tabBarIcon: ({ focused, color, size }) => {
                if (focused) {
                    return <FontAwesome name="list" color={"#7e22ce"} size={size} />
                }

                return <FontAwesome name="list" color={color} size={size} />
            }
        }}
      />
      <Tabs.Screen 
        name="profile"
        options={{
            headerShown: false,
            title: "Perfil",
            tabBarIcon: ({ focused, color, size }) => {
                if (focused) {
                    return <FontAwesome name="user" color={"#7e22ce"} size={size} />
                }

                return <FontAwesome name="user" color={color} size={size} />
            }
        }}
      />      
    </Tabs>
  );
}
