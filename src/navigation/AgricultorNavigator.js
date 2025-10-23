import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import AgricultorHomeScreen from '../screens/agricultor/AgricultorHomeScreen';
import InventarioScreen from '../screens/agricultor/InventarioScreen';
import PerfilAgricultorScreen from '../screens/agricultor/PerfilAgricultorScreen';
import Colors from '../constants/colors';

const Tab = createBottomTabNavigator();

export default function AgricultorNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Inicio') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Inventario') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'Perfil') {
            iconName = focused ? 'person' : 'person-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: Colors.agricultor,
        tabBarInactiveTintColor: Colors.gray,
        headerStyle: { backgroundColor: Colors.agricultor },
        headerTintColor: Colors.white,
        headerTitleStyle: { fontWeight: 'bold' },
      })}
    >
      <Tab.Screen name="Inicio" component={AgricultorHomeScreen} />
      <Tab.Screen name="Inventario" component={InventarioScreen} />
      <Tab.Screen name="Perfil" component={PerfilAgricultorScreen} />
    </Tab.Navigator>
  );
}
