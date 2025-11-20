import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Colors from '../constants/colors';
import Ionicons from '@expo/vector-icons/Ionicons';
import AgricultorHomeScreen from '../screens/agricultor/AgricultorHomeScreen';
import InventarioScreen from '../screens/agricultor/InventarioScreen';
import PedidosRecibidosScreen from '../screens/agricultor/PedidosRecibidosScreen';
import PerfilAgricultorScreen from '../screens/agricultor/PerfilAgricultorScreen';
import DetallePedidoScreen from '../screens/comprador/DetallePedidoScreen';
import EditProfileScreen from '../screens/EditProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function HomeStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.agricultor,
        },
        headerTintColor: Colors.white,
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 18,
        },
      }}
    >
      <Stack.Screen
        name="AgricultorHome"
        component={AgricultorHomeScreen}
        options={{
          headerTitle: 'Inicio',
        }}
      />
      <Stack.Screen
        name="InventarioScreen"
        component={InventarioScreen}
        options={{
          headerTitle: 'Mi Inventario',
        }}
      />
    </Stack.Navigator>
  );
}

function PedidosStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.agricultor,
        },
        headerTintColor: Colors.white,
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 18,
        },
      }}
    >
      <Stack.Screen
        name="PedidosRecibidos"
        component={PedidosRecibidosScreen}
        options={{
          headerTitle: 'Pedidos Recibidos',
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
          backgroundColor: Colors.agricultor,
        },
        headerTintColor: Colors.white,
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 18,
        },
      }}
    >
      <Stack.Screen
        name="PerfilAgricultorScreen"
        component={PerfilAgricultorScreen}
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

export default function AgricultorNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = 'home-outline';
          } else if (route.name === 'Pedidos') {
            iconName = 'clipboard-outline';
          } else if (route.name === 'Perfil') {
            iconName = 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: Colors.agricultor,
        tabBarInactiveTintColor: '#999',
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={{
          title: 'Inicio',
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
