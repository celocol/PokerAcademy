# 🎯 CCOP Token Dispenser - QR Code System

Un sistema completo de distribución de tokens CCOP en la blockchain Celo con códigos QR dinámicos y transacciones sin gas.

## ✨ Características Principales

### 🔗 Smart Contract
- **Distribución de tokens**: 25,000 CCOP tokens por claim
- **Límites diarios**: 1 claim por día por wallet
- **Límites de por vida**: Máximo 3 claims por wallet
- **Transacciones sin gas**: Soporte para meta-transacciones
- **Verificación de firmas**: Sistema seguro de autenticación

### 📱 Frontend
- **QR dinámico**: Se regenera automáticamente cuando se escanea
- **Páginas únicas**: Cada escaneo genera una URL única
- **Detección en tiempo real**: Sistema que detecta cuando se escanea el QR
- **Modo pantalla completa**: Ideal para displays públicos
- **Diseño responsive**: Optimizado para móviles

### 🔧 Tecnologías
- **Blockchain**: Celo (Alfajores testnet)
- **Smart Contracts**: Solidity 0.8.20 + OpenZeppelin
- **Frontend**: Next.js 14 + React
- **Styling**: Tailwind CSS
- **Web3**: Ethers.js
- **QR Codes**: qrcode.react

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js 18+ 
- npm o yarn
- Git

### 1. Clonar el repositorio
```bash
git clone https://github.com/celocol/PokerAcademy.git
cd PokerAcademy
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
```bash
cp env.example .env
```

Editar `.env` con tus valores:
```env
# Celo Network
NEXT_PUBLIC_NETWORK=alfajores
NEXT_PUBLIC_RPC_URL=https://alfajores-forno.celo-testnet.org

# Contract Address (después del deploy)
NEXT_PUBLIC_CONTRACT_ADDRESS=0x03418Ae92FC2238dc565449C0a16355F22b92A4f

# Private Key para deploy (opcional)
PRIVATE_KEY=tu_private_key_aqui
```

### 4. Compilar contratos
```bash
npx hardhat compile
```

### 5. Ejecutar tests
```bash
npx hardhat test
```

### 6. Deployar contrato (opcional)
```bash
npx hardhat run scripts/deploy.js --network alfajores
```

### 7. Iniciar frontend
```bash
npm run dev
```

## 📱 Uso del Sistema

### Para Usuarios
1. **Escanear QR**: Abrir la cámara del celular y escanear el código QR
2. **Conectar wallet**: Conectar MetaMask o wallet compatible con Celo
3. **Ingresar dirección**: Pegar la dirección donde recibir los tokens
4. **Verificar**: El sistema verifica automáticamente si puede reclamar
5. **Claim**: Hacer clic en "Claim" para recibir 25,000 CCOP tokens

### Para Administradores
1. **Mostrar QR**: Abrir la página principal en una pantalla
2. **Modo pantalla completa**: Hacer clic en el botón de pantalla completa
3. **Monitorear**: El QR se regenera automáticamente cuando se escanea
4. **Seguimiento**: Contador de regeneraciones y timestamps

## 🔄 Flujo del Sistema

### Generación de QR
```
1. Página principal genera URL única
2. QR se muestra en pantalla
3. Sistema escucha escaneos cada 2 segundos
4. Cuando se detecta escaneo → QR se regenera
5. Nueva URL única para siguiente usuario
```

### Proceso de Claim
```
1. Usuario escanea QR → Accede a /claim/[sessionId]
2. Sistema notifica escaneo → API /api/scan-detected
3. Página principal detecta → Regenera QR
4. Usuario conecta wallet → Verifica condiciones
5. Usuario hace claim → Recibe tokens
```

## 🏗️ Arquitectura del Proyecto

```
PokerAcademy/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   └── scan-detected/        # Detección de escaneos
│   ├── claim/[id]/               # Páginas dinámicas de claim
│   ├── globals.css               # Estilos globales
│   ├── layout.js                 # Layout principal
│   └── page.js                   # Página principal con QR
├── contracts/                    # Smart Contracts
│   ├── CCOPDispenser.sol         # Contrato principal
│   ├── MockERC20.sol             # Token mock para tests
│   └── PokerAcademyToken.sol     # Token original (no usado)
├── scripts/                      # Scripts de deploy
│   ├── deploy.js                 # Deploy del contrato
│   └── generateGaslessSignature.js # Generación de firmas
├── test/                         # Tests
│   ├── CCOPDispenser.test.js     # Tests del dispensador
│   └── PokerAcademyToken.test.js # Tests del token
├── hardhat.config.js             # Configuración de Hardhat
├── next.config.js                # Configuración de Next.js
├── tailwind.config.js            # Configuración de Tailwind
└── package.json                  # Dependencias
```

## 🔐 Seguridad

### Smart Contract
- **ReentrancyGuard**: Previene ataques de reentrancy
- **Ownable**: Solo el owner puede modificar configuraciones
- **Signature verification**: Verificación criptográfica de firmas
- **Rate limiting**: Límites diarios y de por vida
- **Error handling**: Mensajes de error claros

### Frontend
- **Session IDs únicos**: Cada claim tiene ID único
- **Auto-regeneración**: QR se regenera automáticamente
- **Validación de direcciones**: Verificación de formatos de wallet
- **Debounce**: Prevención de múltiples requests

## 🌐 Redes Soportadas

### Testnet (Alfajores)
- **RPC URL**: https://alfajores-forno.celo-testnet.org
- **Chain ID**: 44787
- **CCOP Token**: 0xe6A57340f0df6E020c1c0a80bC6E13048601f0d4
- **Contract**: 0x03418Ae92FC2238dc565449C0a16355F22b92A4f

### Mainnet (Celo)
- **RPC URL**: https://forno.celo.org
- **Chain ID**: 42220
- **CCOP Token**: 0x8A567e2aE79CA692Bd748aB832081C45de4041eA

## 🧪 Testing

### Ejecutar todos los tests
```bash
npx hardhat test
```

### Tests específicos
```bash
npx hardhat test test/CCOPDispenser.test.js
npx hardhat test test/PokerAcademyToken.test.js
```

### Tests con coverage
```bash
npx hardhat coverage
```

## 📊 Estadísticas del Proyecto

- **Líneas de código**: ~17,000+
- **Archivos**: 21
- **Smart Contracts**: 3
- **Tests**: 2 suites
- **Scripts**: 2
- **Páginas**: 2 (principal + claim dinámico)

## 🤝 Contribuir

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🆘 Soporte

Si tienes problemas o preguntas:

1. Revisar los [Issues](https://github.com/celocol/PokerAcademy/issues)
2. Crear un nuevo Issue con detalles del problema
3. Contactar al equipo de desarrollo

## 🎉 Agradecimientos

- **Celo Foundation** por la blockchain
- **OpenZeppelin** por los contratos base
- **Next.js** por el framework
- **Tailwind CSS** por el styling
- **Ethers.js** por la integración Web3

---

**Desarrollado con ❤️ para la comunidad Celo Colombia** 