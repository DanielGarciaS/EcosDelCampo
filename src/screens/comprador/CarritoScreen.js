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
  Modal,
  TextInput,
  ScrollView
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

  // Modal checkout
  const [checkoutVisible, setCheckoutVisible] = useState(false);
  const [checkoutForm, setCheckoutForm] = useState({
    calle: '', ciudad: '', estado: '', codigoPostal: '', telefono: '', metodoPago: 'efectivo', notas: ''
  });
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useEffect(() => {
    cargarCarrito();
  }, []);

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
        { itemId, cantidad: nuevaCantidad },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        setCarrito(response.data.data);
      }
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'No se pudo actualizar la cantidad');
    } finally {
      setActualizando(null);
    }
  };

  const eliminarItem = async (itemId) => {
    Alert.alert('Eliminar producto', '¿Eliminar este producto del carrito?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar', style: 'destructive', onPress: async () => {
          try {
            const response = await axios.delete(ENDPOINTS.CART_REMOVE(itemId), {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (response.data.success) {
              setCarrito(response.data.data);
            }
          } catch (error) {
            Alert.alert('Error', 'No se pudo eliminar el producto');
          }
        }
      }
    ]);
  };

  const vaciarCarrito = async () => {
    Alert.alert('Vaciar carrito', '¿Vaciar todo el carrito?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sí, vaciar', style: 'destructive', onPress: async () => {
          try {
            const response = await axios.delete(ENDPOINTS.CART_CLEAR, {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (response.data.success) {
              setCarrito(response.data.data);
            }
          } catch (error) {
            Alert.alert('Error', 'No se pudo vaciar el carrito');
          }
        }
      }
    ]);
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
          <Ionicons name="trash-outline" size={22} color={Colors.error} />
        </TouchableOpacity>
      </View>

      <View style={styles.itemFooter}>
        <View style={styles.cantidadContainer}>
          <TouchableOpacity
            style={styles.botonCantidad}
            onPress={() => actualizarCantidad(item._id, item.cantidad - 1)}
            disabled={actualizando === item._id}
          >
            <Ionicons name="remove" size={18} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.cantidadText}>
            {actualizando === item._id ? '...' : item.cantidad}
          </Text>
          <TouchableOpacity
            style={styles.botonCantidad}
            onPress={() => actualizarCantidad(item._id, item.cantidad + 1)}
            disabled={actualizando === item._id}
          >
            <Ionicons name="add" size={18} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>
        <Text style={styles.subtotal}>Subtotal: ${(item.precio * item.cantidad).toFixed(2)}</Text>
      </View>
    </View>
  );

  // Checkout modal
  const handleCheckout = async () => {
    if (!checkoutForm.calle || !checkoutForm.ciudad || !checkoutForm.estado || !checkoutForm.codigoPostal || !checkoutForm.telefono) {
      Alert.alert('Error', 'Completa todos los campos de dirección y teléfono');
      return;
    }

    setCheckoutLoading(true);
    try {
      const body = {
        direccionEntrega: {
          calle: checkoutForm.calle,
          ciudad: checkoutForm.ciudad,
          estado: checkoutForm.estado,
          codigoPostal: checkoutForm.codigoPostal,
          telefono: checkoutForm.telefono
        },
        metodoPago: checkoutForm.metodoPago,
        notas: checkoutForm.notas,
      };

      await axios.post(ENDPOINTS.ORDERS, body, {
        headers: { Authorization: `Bearer ${token}` },
      });

      Alert.alert('¡Pedido realizado!', 'Tu pedido fue registrado correctamente');
      setCheckoutForm({
        calle: '', ciudad: '', estado: '', codigoPostal: '', telefono: '', metodoPago: 'efectivo', notas: ''
      });
      setCheckoutVisible(false);
      cargarCarrito();
      navigation.navigate('Pedidos', { screen: 'MisPedidos' });
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'No se pudo finalizar el pedido');
    } finally {
      setCheckoutLoading(false);
    }
  };

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
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <Ionicons name="cart-outline" size={80} color={Colors.textSecondary} />
          <Text style={styles.emptyTitle}>Tu carrito está vacío</Text>
          <Text style={styles.emptySubtitle}>Agrega productos desde el catálogo</Text>
          <TouchableOpacity
            style={styles.botonCatalogo}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.botonCatalogoText}>Ver catálogo</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
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

      <FlatList
        data={carrito.items}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.comprador]} />
        }
      />

      <View style={styles.footer}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalValue}>${carrito.total.toFixed(2)}</Text>
        </View>
        <TouchableOpacity
          style={styles.botonPagar}
          onPress={() => setCheckoutVisible(true)}
        >
          <Ionicons name="card-outline" size={20} color={Colors.white} />
          <Text style={styles.botonPagarText}>Finalizar compra</Text>
        </TouchableOpacity>
      </View>

      {/* Modal de checkout */}
      <Modal visible={checkoutVisible} transparent animationType="slide">
        <View style={styles.overlay}>
          <ScrollView style={styles.checkoutContainer}>
            <Text style={styles.checkoutTitle}>Finalizar compra</Text>
            <TextInput style={styles.input} placeholder="Calle" value={checkoutForm.calle} onChangeText={(v) => setCheckoutForm(f => ({ ...f, calle: v }))} />
            <TextInput style={styles.input} placeholder="Ciudad" value={checkoutForm.ciudad} onChangeText={(v) => setCheckoutForm(f => ({ ...f, ciudad: v }))} />
            <TextInput style={styles.input} placeholder="Estado" value={checkoutForm.estado} onChangeText={(v) => setCheckoutForm(f => ({ ...f, estado: v }))} />
            <TextInput style={styles.input} placeholder="Código Postal" value={checkoutForm.codigoPostal} onChangeText={(v) => setCheckoutForm(f => ({ ...f, codigoPostal: v }))} keyboardType="numeric" />
            <TextInput style={styles.input} placeholder="Teléfono" value={checkoutForm.telefono} onChangeText={(v) => setCheckoutForm(f => ({ ...f, telefono: v }))} keyboardType="phone-pad" />

            <Text style={styles.label}>Método de pago</Text>
            <View style={styles.row}>
              {['efectivo', 'tarjeta', 'transferencia'].map(mp => (
                <TouchableOpacity key={mp} onPress={() => setCheckoutForm(f => ({ ...f, metodoPago: mp }))} style={[styles.methodBtn, checkoutForm.metodoPago === mp && styles.methodBtnActive]}>
                  <Text style={[styles.methodText, checkoutForm.metodoPago === mp && styles.methodTextActive]}>{mp}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput style={[styles.input, styles.textArea]} placeholder="Notas adicionales (opcional)" value={checkoutForm.notas} onChangeText={(v) => setCheckoutForm(f => ({ ...f, notas: v }))} multiline numberOfLines={3} />

            <View style={styles.btns}>
              <TouchableOpacity onPress={() => setCheckoutVisible(false)} style={styles.cancelBtn}>
                <Text>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleCheckout} style={styles.confirmBtn} disabled={checkoutLoading}>
                <Text style={styles.confirmText}>{checkoutLoading ? 'Procesando...' : 'Confirmar pedido'}</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.backgroundLight },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, fontSize: 16, color: Colors.textSecondary },
  header: {
    backgroundColor: Colors.comprador,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.white,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.white,
    opacity: 0.85,
    marginTop: 2,
    textAlign: 'center',
  },

  vaciarText: {
    fontSize: 14,
    color: Colors.white,
    fontWeight: '600',
  },
  listContainer: { padding: 15 },
  itemCard: { backgroundColor: Colors.white, borderRadius: 12, padding: 15, marginBottom: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  itemInfo: { flex: 1 },
  itemNombre: { fontSize: 18, fontWeight: 'bold', color: Colors.textPrimary, marginBottom: 4 },
  itemPrecio: { fontSize: 16, color: Colors.comprador, fontWeight: '600' },
  botonEliminar: { padding: 8 },
  itemFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 15, borderTopWidth: 1, borderTopColor: Colors.lightGray },
  cantidadContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.lightGray, borderRadius: 8, padding: 4 },
  botonCantidad: { width: 32, height: 32, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.white, borderRadius: 6 },
  cantidadText: { fontSize: 16, fontWeight: 'bold', color: Colors.textPrimary, marginHorizontal: 20, minWidth: 30, textAlign: 'center' },
  subtotal: { fontSize: 16, fontWeight: 'bold', color: Colors.textPrimary },
  footer: { backgroundColor: Colors.white, padding: 20, borderTopWidth: 1, borderTopColor: Colors.lightGray, shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 10 },
  totalContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  totalLabel: { fontSize: 20, fontWeight: '600', color: Colors.textPrimary },
  totalValue: { fontSize: 28, fontWeight: 'bold', color: Colors.comprador },
  botonPagar: { backgroundColor: Colors.comprador, padding: 16, borderRadius: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 },
  botonPagarText: { color: Colors.white, fontSize: 18, fontWeight: 'bold' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyTitle: { fontSize: 22, fontWeight: 'bold', color: Colors.textPrimary, marginTop: 20 },
  emptySubtitle: { fontSize: 16, color: Colors.textSecondary, textAlign: 'center', marginTop: 10, marginBottom: 30 },
  botonCatalogo: { backgroundColor: Colors.comprador, paddingHorizontal: 30, paddingVertical: 15, borderRadius: 25 },
  botonCatalogoText: { color: Colors.white, fontSize: 16, fontWeight: 'bold' },
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0006' },
  checkoutContainer: { backgroundColor: 'white', padding: 20, borderRadius: 16, width: '85%', maxHeight: '80%' },
  checkoutTitle: { fontWeight: 'bold', fontSize: 20, marginBottom: 15 },
  input: { borderWidth: 1, borderColor: '#eee', borderRadius: 8, padding: 10, marginVertical: 8 },
  label: { marginTop: 10, fontWeight: '600', marginBottom: 8 },
  row: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  methodBtn: { backgroundColor: '#eee', borderRadius: 12, padding: 10, marginRight: 8, marginBottom: 8 },
  methodBtnActive: { backgroundColor: Colors.comprador },
  methodText: { color: '#666' },
  methodTextActive: { color: '#fff', fontWeight: 'bold' },
  textArea: { height: 80, textAlignVertical: 'top' },
  btns: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 18, marginBottom: 10 },
  cancelBtn: { padding: 12 },
  confirmBtn: { backgroundColor: Colors.comprador, borderRadius: 12, padding: 12, paddingHorizontal: 20 },
  confirmText: { color: 'white', fontWeight: 'bold' }
});
