import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import Colors from '../../constants/colors';
import { ENDPOINTS } from '../../constants/endpoints';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

export default function CarritoScreen({ navigation }) {
  const { token } = useAuth();
  const [carrito, setCarrito] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actualizando, setActualizando] = useState(null);

  useEffect(() => {
    cargarCarrito();
  }, []);

  // Recargar carrito cuando la pantalla recibe el foco
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      cargarCarrito();
    });
    return unsubscribe;
  }, [navigation]);

  const cargarCarrito = async () => {
    try {
      const response = await axios.get(ENDPOINTS.CART, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setCarrito(response.data.data);
      }
    } catch (error) {
      console.error('Error cargando carrito:', error);
      Alert.alert('Error', 'No se pudo cargar el carrito');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    cargarCarrito();
  }, []);

  const actualizarCantidad = async (itemId, nuevaCantidad) => {
    if (nuevaCantidad < 1) {
      eliminarItem(itemId);
      return;
    }

    setActualizando(itemId);

    try {
      const response = await axios.put(
        ENDPOINTS.CART_UPDATE,
        {
          itemId,
          cantidad: nuevaCantidad,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setCarrito(response.data.data);
      }
    } catch (error) {
      console.error('Error actualizando cantidad:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'No se pudo actualizar la cantidad'
      );
    } finally {
      setActualizando(null);
    }
  };

  const eliminarItem = async (itemId) => {
    Alert.alert(
      'Eliminar producto',
      '¿Estás seguro de que deseas eliminar este producto del carrito?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await axios.delete(ENDPOINTS.CART_REMOVE(itemId), {
                headers: { Authorization: `Bearer ${token}` },
              });

              if (response.data.success) {
                setCarrito(response.data.data);
                Alert.alert('Éxito', 'Producto eliminado del carrito');
              }
            } catch (error) {
              console.error('Error eliminando item:', error);
              Alert.alert('Error', 'No se pudo eliminar el producto');
            }
          },
        },
      ]
    );
  };

  const vaciarCarrito = async () => {
    Alert.alert(
      'Vaciar carrito',
      '¿Estás seguro de que deseas vaciar todo el carrito?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sí, vaciar',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await axios.delete(ENDPOINTS.CART_CLEAR, {
                headers: { Authorization: `Bearer ${token}` },
              });

              if (response.data.success) {
                setCarrito(response.data.data);
                Alert.alert('Éxito', 'Carrito vaciado');
              }
            } catch (error) {
              console.error('Error vaciando carrito:', error);
              Alert.alert('Error', 'No se pudo vaciar el carrito');
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles.itemCard}>
      <View style={styles.itemHeader}>
        <View style={styles.itemInfo}>
          <Text style={styles.itemNombre}>{item.producto?.nombre || 'Producto'}</Text>
          <Text style={styles.itemPrecio}>${item.precio}</Text>
        </View>

        <TouchableOpacity
          style={styles.botonEliminar}
          onPress={() => eliminarItem(item._id)}
        >
          <Ionicons name="trash-outline" size={20} color={Colors.error} />
        </TouchableOpacity>
      </View>

      <View style={styles.itemFooter}>
        <View style={styles.cantidadContainer}>
          <TouchableOpacity
            style={styles.botonCantidad}
            onPress={() => actualizarCantidad(item._id, item.cantidad - 1)}
            disabled={actualizando === item._id}
          >
            <Ionicons name="remove" size={20} color={Colors.textPrimary} />
          </TouchableOpacity>

          <Text style={styles.cantidadText}>
            {actualizando === item._id ? '...' : item.cantidad}
          </Text>

          <TouchableOpacity
            style={styles.botonCantidad}
            onPress={() => actualizarCantidad(item._id, item.cantidad + 1)}
            disabled={actualizando === item._id}
          >
            <Ionicons name="add" size={20} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>

        <Text style={styles.subtotal}>
          Subtotal: ${(item.precio * item.cantidad).toFixed(2)}
        </Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.comprador} />
        <Text style={styles.loadingText}>Cargando carrito...</Text>
      </View>
    );
  }

  if (!carrito || carrito.items.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="cart-outline" size={100} color={Colors.gray} />
        <Text style={styles.emptyTitle}>Tu carrito está vacío</Text>
        <Text style={styles.emptySubtitle}>
          Agrega productos desde el catálogo
        </Text>
        <TouchableOpacity
          style={styles.botonCatalogo}
          onPress={() => navigation.navigate('Catálogo')}
        >
          <Text style={styles.botonCatalogoText}>Ver catálogo</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header con total */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Mi Carrito</Text>
          <Text style={styles.headerSubtitle}>
            {carrito.items.length} {carrito.items.length === 1 ? 'producto' : 'productos'}
          </Text>
        </View>
        <TouchableOpacity onPress={vaciarCarrito}>
          <Text style={styles.vaciarText}>Vaciar carrito</Text>
        </TouchableOpacity>
      </View>

      {/* Lista de productos */}
      <FlatList
        data={carrito.items}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />

      {/* Footer con total y botón */}
      <View style={styles.footer}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalValue}>${carrito.total.toFixed(2)}</Text>
        </View>

        <TouchableOpacity
          style={styles.botonPagar}
          onPress={() => Alert.alert('Próximamente', 'Función de pago en desarrollo')}
        >
          <Text style={styles.botonPagarText}>Proceder al pago</Text>
          <Ionicons name="arrow-forward" size={20} color={Colors.white} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundLight,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: Colors.textSecondary,
  },
  header: {
    backgroundColor: Colors.white,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  vaciarText: {
    fontSize: 14,
    color: Colors.error,
    fontWeight: '600',
  },
  listContainer: {
    padding: 15,
  },
  itemCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  itemInfo: {
    flex: 1,
  },
  itemNombre: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  itemPrecio: {
    fontSize: 16,
    color: Colors.comprador,
    fontWeight: '600',
  },
  botonEliminar: {
    padding: 8,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: Colors.lightGray,
  },
  cantidadContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.lightGray,
    borderRadius: 8,
    padding: 4,
  },
  botonCantidad: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 6,
  },
  cantidadText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginHorizontal: 20,
    minWidth: 30,
    textAlign: 'center',
  },
  subtotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  footer: {
    backgroundColor: Colors.white,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.lightGray,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 10,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  totalLabel: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  totalValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.comprador,
  },
  botonPagar: {
    backgroundColor: Colors.comprador,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  botonPagarText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginTop: 20,
  },
  emptySubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  botonCatalogo: {
    backgroundColor: Colors.comprador,
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  botonCatalogoText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
