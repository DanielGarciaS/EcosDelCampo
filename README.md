# 🌾 Ecos del Campo

Aplicación móvil para conectar agricultores locales con compradores, facilitando la venta directa de productos del campo.

---

## 🎯 Funcionalidades Implementadas

### 🔐 Autenticación
- Registro de usuarios (Agricultor/Comprador)
- Login con JWT
- Persistencia de sesión
- Logout seguro

### 🌾 Módulo Agricultor
- Dashboard con estadísticas en tiempo real
- CRUD completo de productos
- Gestión de inventario
- Perfil de usuario

### 🛒 Módulo Comprador
- Catálogo de productos disponibles
- Búsqueda por nombre/descripción
- Filtros por categoría
- Carrito de compras funcional
- Gestión de cantidades en tiempo real

### 📦 Órdenes y Pedidos
- Visualización de historial de pedidos
- Seguimiento de estado del pedido
- Detalles de cada compra

### 👤 Perfil
- Gestión y edición del perfil
- Logout seguro

---

## 🛠️ Tecnologías Utilizadas

### Frontend
- **React Native** - Framework de UI
- **Expo** - Herramientas de desarrollo
- **React Navigation** - Navegación entre pantallas
- **Axios** - Peticiones HTTP
- **Expo SecureStore** - Almacenamiento seguro

### Backend
- **Node.js** - Runtime de JavaScript
- **Express** - Framework web
- **MongoDB** - Base de datos NoSQL
- **Mongoose** - ODM para MongoDB
- **JWT** - Autenticación
- **bcrypt** - Encriptación de contraseñas

---

## ⚡ Cómo correr el proyecto

1. Clona el repositorio
2. Instala dependencias: `npm install` (backend) y `npx expo install` (frontend)
3. Configura variables de entorno del backend
4. Inicia el backend con `npm run dev`
5. En `/frontend`, ejecuta: `npx expo start`
6. Escanea el código QR con la app Expo Go o usa un emulador



## 🚧 Roadmap

- Notificaciones push para pedidos y status
- Métodos de pago integrados
- Historial de transacciones para Agricultores
- Valoraciones y comentarios de productos
