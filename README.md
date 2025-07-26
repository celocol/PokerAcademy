# CCOP Dispenser - Celo Token Claim System

Un sistema completo de dispersión de tokens CCOP en la blockchain de Celo que permite a los usuarios reclamar 25,000 tokens CCOP una vez al día, con un máximo de 3 reclamaciones por billetera.

## 🎯 Características

- **Reclamación Diaria**: 25,000 tokens CCOP por día
- **Límite de Vida**: Máximo 3 reclamaciones por billetera
- **Reset Automático**: Se reinicia a medianoche UTC (0:00)
- **Sistema QR**: Código QR para acceso fácil desde móviles
- **Frontend Moderno**: Interfaz web responsive y atractiva
- **Conexión de Wallet**: Soporte para MetaMask y otras wallets Web3
- **Mensajes de Error**: Manejo completo de errores con mensajes claros

## 🏗️ Arquitectura

### Smart Contract (`CCOPDispenser.sol`)
- Dispensador de tokens CCOP existentes
- Sistema de reclamación diaria con límites
- Control de tiempo basado en timestamps
- Funciones de emergencia para el owner
- Manejo de errores personalizado

### Frontend (Next.js)
- Página principal con QR code
- Página de reclamación accesible via QR
- Conexión de wallet automática
- Interfaz responsive y moderna
- Contador de tiempo hasta próxima reclamación

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js 18+ 
- npm o yarn
- Wallet con CELO para deployment

### 1. Clonar y Instalar Dependencias

```bash
git clone <repository-url>
cd PokerAcademy
npm install
```

### 2. Configurar Variables de Entorno

Copia el archivo de ejemplo y configura tus variables:

```bash
cp env.example .env
```

Edita `.env` con tus valores:

```env
# Private key para deployment (sin prefijo 0x)
PRIVATE_KEY=tu_private_key_aqui

# API key de CeloScan para verificación
CELOSCAN_API_KEY=tu_celoscan_api_key_aqui

# Dirección del contrato (se llenará después del deployment)
CONTRACT_ADDRESS=

# Variables de entorno de Next.js
NEXT_PUBLIC_CONTRACT_ADDRESS=
NEXT_PUBLIC_NETWORK_ID=42220
NEXT_PUBLIC_NETWORK_NAME=Celo
```

### 3. Compilar el Smart Contract

```bash
npm run compile
```

### 4. Ejecutar Tests

```bash
npm test
```

### 5. Deploy en Testnet (Alfajores)

```bash
npm run deploy:testnet
```

### 6. Deploy en Mainnet (Celo)

```bash
npm run deploy
```

### 7. Actualizar Variables de Entorno

Después del deployment, actualiza `NEXT_PUBLIC_CONTRACT_ADDRESS` en tu `.env` con la dirección del contrato desplegado.

### 8. Ejecutar el Frontend

```bash
npm run dev
```

El frontend estará disponible en `http://localhost:3000`

## 📱 Uso del Sistema

### Para Usuarios

1. **Acceso Principal**: Visita la página principal para ver el QR code
2. **Escaneo QR**: Escanea el código QR con tu móvil
3. **Conexión Wallet**: Conecta tu wallet Web3 (MetaMask, etc.)
4. **Reclamación**: Haz clic en "Claim 25,000 POKER Tokens"
5. **Confirmación**: Confirma la transacción en tu wallet

### Para Administradores

1. **Monitoreo**: Usa CeloScan para monitorear transacciones
2. **Emergencias**: Usa `emergencyResetDailyClaim()` si es necesario
3. **Verificación**: El contrato se verifica automáticamente en CeloScan

## 🔧 Funciones del Smart Contract

### Funciones Públicas
- `claimDailyTokens()`: Reclamar tokens diarios
- `getUserClaimInfo(address user)`: Obtener información del usuario
- `getTimeUntilNextClaim(address user)`: Tiempo hasta próxima reclamación
- `balanceOf(address account)`: Balance de tokens

### Funciones del Owner
- `emergencyResetDailyClaim(address user)`: Reset de emergencia

### Constantes
- `DAILY_CLAIM_AMOUNT`: 25,000 tokens (con 18 decimales)
- `MAX_LIFETIME_CLAIMS`: 3 reclamaciones máximas
- `SECONDS_PER_DAY`: 86,400 segundos

## 🎨 Características del Frontend

### Diseño
- **Tema Oscuro**: Interfaz moderna con gradientes
- **Responsive**: Funciona en desktop y móvil
- **Animaciones**: Transiciones suaves y efectos hover
- **Colores Celo**: Paleta de colores oficial de Celo

### Funcionalidades
- **QR Code Dinámico**: Se actualiza con la dirección del usuario
- **Conexión Wallet**: Soporte para múltiples wallets
- **Contador de Tiempo**: Muestra tiempo hasta próxima reclamación
- **Mensajes de Error**: Errores claros y específicos
- **Copia de Direcciones**: Botones para copiar direcciones

## 🧪 Testing

El proyecto incluye tests completos que cubren:

- Deployment del contrato
- Reclamaciones diarias
- Límites de vida
- Manejo de errores
- Funciones del owner
- Casos edge y timezone

Ejecuta los tests con:

```bash
npm test
```

## 🔒 Seguridad

### Smart Contract
- **ReentrancyGuard**: Protección contra ataques de reentrancy
- **Ownable**: Control de acceso para funciones administrativas
- **Custom Errors**: Errores específicos y gas-efficient
- **Time-based Logic**: Lógica robusta basada en timestamps

### Frontend
- **Validación de Direcciones**: Verificación de direcciones Ethereum
- **Manejo de Errores**: Captura y display de errores de contrato
- **Sanitización**: Limpieza de inputs del usuario

## 📊 Monitoreo y Analytics

### CeloScan
- Verificación automática del contrato
- Monitoreo de transacciones
- Análisis de gas usage

### Eventos del Contrato
- `TokensClaimed`: Cuando un usuario reclama tokens
- `DailyReset`: Cuando se resetea una reclamación diaria

## 🚨 Troubleshooting

### Problemas Comunes

1. **"Already Claimed Today"**
   - Espera hasta medianoche UTC
   - Verifica la zona horaria

2. **"Max Lifetime Claims Reached"**
   - Límite de 3 reclamaciones alcanzado
   - No se puede reclamar más

3. **"Failed to Connect Wallet"**
   - Instala MetaMask o similar
   - Verifica que esté conectado a Celo

4. **"Transaction Failed"**
   - Verifica que tienes CELO para gas
   - Revisa el estado de la red

### Logs y Debugging

```bash
# Ver logs de Hardhat
npx hardhat console

# Verificar contrato en CeloScan
npx hardhat verify --network celo <contract-address>
```

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 🆘 Soporte

Para soporte técnico o preguntas:
- Abre un issue en GitHub
- Contacta al equipo de desarrollo
- Revisa la documentación de Celo

## 🔗 Enlaces Útiles

- [Documentación de Celo](https://docs.celo.org/)
- [CeloScan](https://celoscan.io/)
- [Hardhat Documentation](https://hardhat.org/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Ethers.js Documentation](https://docs.ethers.org/)

---

**Poker Academy Token System** - Construido con ❤️ para la comunidad de Celo 