import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import CompradorHomeScreen from '../screens/comprador/CompradorHomeScreen';
import CarritoScreen from '../screens/comprador/CarritoScreen';
import PerfilCompradorScreen from '../screens/comprador/PerfilCompradorScreen';
import Colors from '../constants/colors';

const Tab = createBottomTabNavigator();

export default function CompradorNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Catálogo') {
            iconName = focused ? 'basket' : 'basket-outline';
          } else if (route.name === 'Carrito') {
            iconName = focused ? 'cart' : 'cart-outline';
          } else if (route.name === 'Perfil') {
            iconName = focused ? 'person' : 'person-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: Colors.comprador,
        tabBarInactiveTintColor: Colors.gray,
        headerStyle: { backgroundColor: Colors.comprador },
        headerTintColor: Colors.white,
        headerTitleStyle: { fontWeight: 'bold' },
      })}
    >
      <Tab.Screen name="Catálogo" component={CompradorHomeScreen} />
      <Tab.Screen name="Carrito" component={CarritoScreen} />
      <Tab.Screen name="Perfil" component={PerfilCompradorScreen} />
    </Tab.Navigator>
  );
}
