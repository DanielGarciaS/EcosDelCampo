# 🌾 Ecos del Campo

Aplicación móvil para conectar agricultores locales con compradores, facilitando la venta directa de productos del campo.


## 🎯 Funcionalidades Implementadas - Sprint 1

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

## 📂 Estructura del Proyecto
EcosDelCampoApp/
├── src/
│ ├── components/ # Componentes reutilizables
│ ├── constants/ # Colores, endpoints
│ ├── context/ # Context API (Auth)
│ ├── navigation/ # Configuración de navegación
│ └── screens/ # Pantallas de la app
│ ├── auth/ # Login, Registro
│ ├── agricultor/ # Pantallas del agricultor
│ └── comprador/ # Pantallas del comprador
├── App.js # Punto de entrada
└── package.json


## 🚀 Instalación y Ejecución

### Prerrequisitos
- Node.js (v16 o superior)
- Expo CLI
- MongoDB
- Expo Go (en tu dispositivo móvil)

### Backend
1. Clona el repositorio del backend.