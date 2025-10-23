import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  TextInput,
  Modal,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import Colors from '../../constants/colors';
import { ENDPOINTS } from '../../constants/endpoints';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

export default function InventarioScreen() {
  const { user, token } = useAuth();
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Formulario
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precio, setPrecio] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [unidad, setUnidad] = useState('kg');
  const [categoria, setCategoria] = useState('Verduras');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    try {
      const response = await axios.get(ENDPOINTS.MY_PRODUCTS, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setProductos(response.data.data);
      }
    } catch (error) {
      console.error('Error cargando productos:', error);
      Alert.alert('Error', 'No se pudieron cargar los productos');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    cargarProductos();
  }, []);

  const abrirModalNuevo = () => {
    limpiarFormulario();
    setEditingProduct(null);
    setModalVisible(true);
  };

  const abrirModalEditar = (producto) => {
    setEditingProduct(producto);
    setNombre(producto.nombre);
    setDescripcion(producto.descripcion || '');
    setPrecio(producto.precio.toString());
    setCantidad(producto.cantidad.toString());
    setUnidad(producto.unidad || 'kg');
    setCategoria(
      producto.categoria.charAt(0).toUpperCase() + producto.categoria.slice(1)
    );
    setModalVisible(true);
  };

  const limpiarFormulario = () => {
    setNombre('');
    setDescripcion('');
    setPrecio('');
    setCantidad('');
    setUnidad('kg');
    setCategoria('Verduras');
  };

  const handleGuardar = async () => {
    // Validaciones
    if (!nombre || !precio || !cantidad) {
      Alert.alert('Error', 'Por favor completa todos los campos obligatorios');
      return;
    }

    if (!descripcion || descripcion.trim() === '') {
      Alert.alert('Error', 'La descripción es requerida');
      return;
    }

    const precioNum = parseFloat(precio);
    const cantidadNum = parseFloat(cantidad);

    if (isNaN(precioNum) || precioNum <= 0) {
      Alert.alert('Error', 'El precio debe ser un número mayor a 0');
      return;
    }

    if (isNaN(cantidadNum) || cantidadNum <= 0) {
      Alert.alert('Error', 'La cantidad debe ser un número mayor a 0');
      return;
    }

    setSubmitting(true);

    try {
      const productoData = {
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
        precio: precioNum,
        cantidad: cantidadNum,
        unidad,
        categoria: categoria.toLowerCase(),
      };

      if (editingProduct) {
        // Editar
        const response = await axios.put(
          `${ENDPOINTS.PRODUCTS}/${editingProduct._id}`,
          productoData,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.data.success) {
          Alert.alert('Éxito', 'Producto actualizado correctamente');
          setModalVisible(false);
          cargarProductos();
        }
      } else {
        // Crear nuevo
        const response = await axios.post(ENDPOINTS.PRODUCTS, productoData, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.success) {
          Alert.alert('Éxito', 'Producto creado correctamente');
          setModalVisible(false);
          cargarProductos();
        }
      }
    } catch (error) {
      console.error('Error guardando producto:', error);
      console.error('Respuesta del servidor:', error.response?.data);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'No se pudo guardar el producto'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleEliminar = (producto) => {
    Alert.alert(
      'Eliminar producto',
      `¿Estás seguro de que deseas eliminar "${producto.nombre}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await axios.delete(
                `${ENDPOINTS.PRODUCTS}/${producto._id}`,
                { headers: { Authorization: `Bearer ${token}` } }
              );

              if (response.data.success) {
                Alert.alert('Éxito', 'Producto eliminado');
                cargarProductos();
              }
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar el producto');
            }
          },
        },
      ]
    );
  };

  const renderProducto = ({ item }) => (
    <View style={styles.productoCard}>
      <View style={styles.productoHeader}>
        <View style={styles.productoInfo}>
          <Text style={styles.productoNombre}>{item.nombre}</Text>
          <Text style={styles.productoCategoria}>
            {item.categoria.charAt(0).toUpperCase() + item.categoria.slice(1)}
          </Text>
        </View>
        <View style={styles.productoBadge}>
          <Text style={styles.productoPrecio}>${item.precio}</Text>
          <Text style={styles.productoUnidad}>/{item.unidad}</Text>
        </View>
      </View>

      {item.descripcion && (
        <Text style={styles.productoDescripcion} numberOfLines={2}>
          {item.descripcion}
        </Text>
      )}

      <View style={styles.productoFooter}>
        <View style={styles.cantidadContainer}>
          <Ionicons name="cube-outline" size={16} color={Colors.textSecondary} />
          <Text style={styles.cantidadText}>
            {item.cantidad} {item.unidad} disponibles
          </Text>
        </View>

        <View style={styles.accionesContainer}>
          <TouchableOpacity
            style={styles.botonEditar}
            onPress={() => abrirModalEditar(item)}
          >
            <Ionicons name="create-outline" size={20} color={Colors.info} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.botonEliminar}
            onPress={() => handleEliminar(item)}
          >
            <Ionicons name="trash-outline" size={20} color={Colors.error} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.agricultor} />
        <Text style={styles.loadingText}>Cargando inventario...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {productos.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="cube-outline" size={80} color={Colors.gray} />
          <Text style={styles.emptyTitle}>No tienes productos</Text>
          <Text style={styles.emptySubtitle}>
            Comienza agregando tu primer producto
          </Text>
          <TouchableOpacity style={styles.botonAgregar} onPress={abrirModalNuevo}>
            <Ionicons name="add" size={24} color={Colors.white} />
            <Text style={styles.botonAgregarText}>Agregar producto</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={productos}
            renderItem={renderProducto}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.listContainer}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          />

          <TouchableOpacity style={styles.fab} onPress={abrirModalNuevo}>
            <Ionicons name="add" size={32} color={Colors.white} />
          </TouchableOpacity>
        </>
      )}

      {/* Modal de agregar/editar */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={28} color={Colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {editingProduct ? 'Editar producto' : 'Nuevo producto'}
            </Text>
            <View style={{ width: 28 }} />
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.label}>Nombre del producto *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: Tomates rojos"
              value={nombre}
              onChangeText={setNombre}
            />

            <Text style={styles.label}>Descripción *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Descripción del producto"
              value={descripcion}
              onChangeText={setDescripcion}
              multiline
              numberOfLines={3}
            />

            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Text style={styles.label}>Precio *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0.00"
                  value={precio}
                  onChangeText={setPrecio}
                  keyboardType="decimal-pad"
                />
              </View>

              <View style={styles.halfInput}>
                <Text style={styles.label}>Cantidad *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0"
                  value={cantidad}
                  onChangeText={setCantidad}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>

            <Text style={styles.label}>Unidad de medida</Text>
            <View style={styles.unidadesContainer}>
              {['kg', 'piezas', 'litros', 'cajas', 'toneladas'].map((u) => (
                <TouchableOpacity
                  key={u}
                  style={[
                    styles.unidadButton,
                    unidad === u && styles.unidadButtonActive,
                  ]}
                  onPress={() => setUnidad(u)}
                >
                  <Text
                    style={[
                      styles.unidadText,
                      unidad === u && styles.unidadTextActive,
                    ]}
                  >
                    {u}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Categoría</Text>
            <View style={styles.categoriasContainer}>
              {['Frutas', 'Verduras', 'Granos', 'Lacteos', 'Carnes', 'Otros'].map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[
                    styles.categoriaButton,
                    categoria === c && styles.categoriaButtonActive,
                  ]}
                  onPress={() => setCategoria(c)}
                >
                  <Text
                    style={[
                      styles.categoriaText,
                      categoria === c && styles.categoriaTextActive,
                    ]}
                  >
                    {c}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.botonGuardar, submitting && styles.botonDisabled]}
              onPress={handleGuardar}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <Text style={styles.botonGuardarText}>
                  {editingProduct ? 'Actualizar' : 'Guardar producto'}
                </Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
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
  listContainer: {
    padding: 15,
  },
  productoCard: {
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
  productoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  productoInfo: {
    flex: 1,
  },
  productoNombre: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  productoCategoria: {
    fontSize: 12,
    color: Colors.textSecondary,
    backgroundColor: Colors.lightGray,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  productoBadge: {
    alignItems: 'flex-end',
  },
  productoPrecio: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.agricultor,
  },
  productoUnidad: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  productoDescripcion: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 10,
  },
  productoFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.lightGray,
  },
  cantidadContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  cantidadText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  accionesContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  botonEditar: {
    padding: 8,
  },
  botonEliminar: {
    padding: 8,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.agricultor,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
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
  botonAgregar: {
    flexDirection: 'row',
    backgroundColor: Colors.agricultor,
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    gap: 10,
  },
  botonAgregarText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 8,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.gray,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    backgroundColor: Colors.white,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: 15,
  },
  halfInput: {
    flex: 1,
  },
  unidadesContainer: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  unidadButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.gray,
  },
  unidadButtonActive: {
    backgroundColor: Colors.agricultor,
    borderColor: Colors.agricultor,
  },
  unidadText: {
    fontSize: 14,
    color: Colors.textPrimary,
  },
  unidadTextActive: {
    color: Colors.white,
    fontWeight: 'bold',
  },
  categoriasContainer: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  categoriaButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.gray,
  },
  categoriaButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoriaText: {
    fontSize: 14,
    color: Colors.textPrimary,
  },
  categoriaTextActive: {
    color: Colors.white,
    fontWeight: 'bold',
  },
  botonGuardar: {
    backgroundColor: Colors.agricultor,
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 20,
  },
  botonGuardarText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  botonDisabled: {
    backgroundColor: Colors.gray,
  },
});
