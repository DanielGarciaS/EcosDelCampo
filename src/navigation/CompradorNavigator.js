import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Ionicons from '@expo/vector-icons/Ionicons';
import HomeScreen from '../screens/comprador/CompradorHomeScreen';
import PerfilCompradorScreen from '../screens/comprador/PerfilCompradorScreen';
import CarritoScreen from '../screens/comprador/CarritoScreen';
import MisPedidosScreen from '../screens/comprador/MisPedidosScreen';
import DetallePedidoScreen from '../screens/comprador/DetallePedidoScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import Colors from '../constants/colors';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function PedidosStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.comprador,
        },
        headerTintColor: Colors.white,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="MisPedidosScreen"
        component={MisPedidosScreen}
        options={{
          headerTitle: 'Mis Pedidos',
        }}
      />
      <Stack.Screen
        name="DetallePedido"
        component={DetallePedidoScreen}
        options={{
          headerTitle: 'Detalle del Pedido',
        }}
      />
    </Stack.Navigator>
  );
}

function PerfilStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.comprador,
        },
        headerTintColor: Colors.white,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="PerfilCompradorScreen"
        component={PerfilCompradorScreen}
        options={{
          headerTitle: 'Mi Perfil',
        }}
      />
      <Stack.Screen
        name="EditProfileScreen"
        component={EditProfileScreen}
        options={{
          headerTitle: 'Editar Perfil',
          headerBackTitleVisible: false,
        }}
      />
    </Stack.Navigator>
  );
}

export default function CompradorNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Home') iconName = 'home-outline';
          else if (route.name === 'Carrito') iconName = 'cart-outline';
          else if (route.name === 'Pedidos') iconName = 'clipboard-outline';
          else if (route.name === 'Perfil') iconName = 'person-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: Colors.comprador,
        tabBarInactiveTintColor: '#999',
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Inicio',
        }}
      />
      <Tab.Screen
        name="Carrito"
        component={CarritoScreen}
        options={{
          title: 'Carrito',
        }}
      />
      <Tab.Screen
        name="Pedidos"
        component={PedidosStack}
        options={{
          title: 'Pedidos',
        }}
      />
      <Tab.Screen
        name="Perfil"
        component={PerfilStack}
        options={{
          title: 'Perfil',
        }}
      />
    </Tab.Navigator>
  );
}
