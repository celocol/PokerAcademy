# 🔐 Configuración de Wallet de Producción

## 🎯 **Opción 1: MetaMask (RECOMENDADO)**

### ✅ **Ventajas:**
- Interfaz familiar y segura
- Fácil backup con seed phrase
- Integración con hardware wallets
- No requiere código adicional

### 📋 **Pasos:**

#### **1. Crear Nueva Wallet en MetaMask**
```
1. Abrir MetaMask
2. Crear nueva cuenta (Account 2, 3, etc.)
3. Renombrar como "CCOP Production"
4. Guardar seed phrase de forma segura
```

#### **2. Exportar Clave Privada**
```
1. En MetaMask → Account → Account Details
2. Export Private Key
3. Ingresar contraseña
4. Copiar clave privada (sin 0x)
```

#### **3. Configurar Red Celo**
```
Network Name: Celo
RPC URL: https://forno.celo.org
Chain ID: 42220
Currency Symbol: CELO
Block Explorer: https://celoscan.io
```

#### **4. Transferir Fondos**
```
- CELO: Para gas fees (mínimo 100 CELO)
- CCOP: Para distribución (mínimo 10,000,000 CCOP)
```

---

## ⚙️ **Opción 2: Generar Programáticamente**

### ⚠️ **ADVERTENCIA:**
- **NUNCA** guardar en GitHub
- **NUNCA** en archivos de código
- **SÍ** en variables de entorno seguras

### 📋 **Pasos Seguros:**

#### **1. Generar Wallet**
```bash
# Crear script temporal (NO committear)
npx hardhat console
> const wallet = ethers.Wallet.createRandom()
> console.log("Address:", wallet.address)
> console.log("Private Key:", wallet.privateKey.slice(2))
> console.log("Mnemonic:", wallet.mnemonic.phrase)
```

#### **2. Guardar de Forma Segura**
```
✅ Variables de entorno en Vercel
✅ Archivo .env local (NO committear)
✅ Gestor de contraseñas
✅ Hardware wallet backup
```

---

## 🚫 **NUNCA Hacer:**

### ❌ **En GitHub:**
- Claves privadas
- Seed phrases
- Archivos .env con secretos
- Scripts con claves hardcodeadas

### ❌ **En Código:**
- Hardcodear claves privadas
- Usar wallet de Hardhat
- Guardar en variables públicas

---

## ✅ **Mejor Práctica Recomendada:**

### **1. MetaMask + Hardware Wallet**
```
1. Crear wallet en MetaMask
2. Conectar hardware wallet (Ledger/Trezor)
3. Usar para transacciones críticas
4. Backup en lugar seguro
```

### **2. Variables de Entorno Seguras**
```env
# Solo en Vercel/Producción
NEXT_PUBLIC_PRIVATE_KEY=tu_clave_privada_sin_0x
NEXT_PUBLIC_WALLET_ADDRESS=tu_direccion_wallet
```

### **3. Monitoreo Continuo**
```
- Balance de CELO
- Balance de CCOP
- Transacciones fallidas
- Alertas de seguridad
```

---

## 🔒 **Seguridad Adicional:**

### **1. Multi-Sig Wallet**
```
- Múltiples firmantes requeridos
- Mayor seguridad
- Más complejo de configurar
```

### **2. Time-Locked Contracts**
```
- Límites de tiempo
- Límites de cantidad
- Pausas de emergencia
```

### **3. Monitoreo Automático**
```
- Alertas de balance bajo
- Detección de transacciones sospechosas
- Logs de todas las operaciones
```

---

## 📋 **Checklist de Seguridad:**

- [ ] Wallet creada en MetaMask
- [ ] Seed phrase guardada de forma segura
- [ ] Hardware wallet conectado (opcional)
- [ ] Fondos transferidos (CELO + CCOP)
- [ ] Variables de entorno configuradas en Vercel
- [ ] NO claves en GitHub
- [ ] Backup de configuración
- [ ] Plan de recuperación
- [ ] Monitoreo configurado 