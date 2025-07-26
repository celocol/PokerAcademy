'use client'

import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { 
  DocumentDuplicateIcon as CopyIcon, 
  CheckIcon, 
  ArrowLeftIcon 
} from '@heroicons/react/24/outline'

// Contract ABI (simplified for the main functions)
const CONTRACT_ABI = [
  "function claimDailyTokens() external",
  "function claimDailyTokensGasless(address user, uint256 deadline, bytes calldata signature) external",
  "function ownerClaimForUser(address user) external",
  "function getUserClaimInfo(address user) external view returns (uint256, uint256, bool, uint256, bool)",
  "function getTimeUntilNextClaim(address user) external view returns (uint256)",
  "function getContractBalance() external view returns (uint256)",
  "function getTokenInfo() external view returns (address, string, string, uint256)",
  "function ccopToken() external view returns (address)"
]

export default function DynamicClaimPage({ params }) {
  const [destinationAddress, setDestinationAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [canClaim, setCanClaim] = useState(false)
  const [claimInfo, setClaimInfo] = useState(null)
  const [copied, setCopied] = useState(false)
  const [sessionId, setSessionId] = useState('')

  // Contract address - replace with your deployed contract address
  const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000'
  
  // Private key for transaction signing (should be in environment variables)
  const PRIVATE_KEY = process.env.NEXT_PUBLIC_PRIVATE_KEY || '0x0000000000000000000000000000000000000000000000000000000000000000'

  useEffect(() => {
    // Generate a unique session ID for this claim attempt
    const uniqueId = `${params.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    setSessionId(uniqueId)
    
    console.log(`🎯 New claim session: ${uniqueId}`)
    
    // Notify that this QR was scanned
    const notifyScan = async () => {
      try {
        await fetch('/api/scan-detected', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sessionId: uniqueId
          })
        })
      } catch (error) {
        console.error('Error notifying scan:', error)
      }
    }
    
    notifyScan()
  }, [params.id])

  const getProvider = () => {
    if (typeof window.ethereum !== 'undefined') {
      return new ethers.BrowserProvider(window.ethereum)
    }
    return null
  }

  const getPublicProvider = () => {
    // Use Celo Alfajores testnet RPC
    const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || 'https://alfajores-forno.celo-testnet.org'
    return new ethers.JsonRpcProvider(rpcUrl)
  }

  const getSigner = () => {
    const provider = getPublicProvider()
    return new ethers.Wallet(PRIVATE_KEY, provider)
  }

  const getContract = () => {
    const provider = getProvider()
    if (!provider) return null
    
    return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider)
  }

  const getPublicContract = () => {
    const provider = getPublicProvider()
    return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider)
  }

  const getContractWithSigner = () => {
    const signer = getSigner()
    return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer)
  }

  const verifyAddress = async (address) => {
    if (!address || !ethers.isAddress(address)) {
      setCanClaim(false)
      setClaimInfo(null)
      return
    }

    try {
      console.log('Verifying claim eligibility for address:', address)
      
      // Try to get contract info using public provider
      const publicContract = getPublicContract()
      const info = await publicContract.getUserClaimInfo(address)
      
      const claimData = {
        lastClaim: info[0].toString(),
        totalClaims: info[1].toString(),
        claimedToday: info[2],
        remainingClaims: info[3].toString(),
        canClaimNow: info[4]
      }
      
      console.log('Claim info received:', claimData)
      setClaimInfo(claimData)
      setCanClaim(info[4])
      
      if (info[4]) {
        console.log('✅ Address is eligible to claim')
      } else {
        console.log('❌ Address is not eligible to claim')
        if (claimData.claimedToday) {
          console.log('Reason: Already claimed today')
        } else if (parseInt(claimData.totalClaims) >= 3) {
          console.log('Reason: Max lifetime claims reached')
        } else {
          console.log('Reason: Contract has insufficient balance')
        }
      }
    } catch (error) {
      console.error('Error verifying address:', error)
      // If we can't verify, assume eligible and let the contract handle it
      console.log('Could not verify eligibility, assuming eligible for manual claim')
      setCanClaim(true)
      setClaimInfo({
        lastClaim: '0',
        totalClaims: '0',
        claimedToday: false,
        remainingClaims: '3',
        canClaimNow: true
      })
    }
  }

  const claimTokens = async () => {
    if (!destinationAddress || !ethers.isAddress(destinationAddress)) {
      setError('Por favor ingresa una dirección de destino válida')
      return
    }

    if (!canClaim) {
      setError('Esta dirección no es elegible para reclamar tokens en este momento')
      return
    }

    try {
      setLoading(true)
      setError('')
      setSuccess('')

      console.log('✅ Address verified as eligible, executing transaction...')

      // Get contract with signer using private key
      const contract = getContractWithSigner()
      const signer = getSigner()

      // Execute transaction to send tokens to the specified address
      try {
        console.log('Executing owner claim for address:', destinationAddress)
        
        // Use the owner function to claim tokens for the user
        const tx = await contract.ownerClaimForUser(destinationAddress)
        const receipt = await tx.wait()
        const txHash = receipt.hash
        const celoscanUrl = getCeloscanUrl(txHash)
        const shortHash = formatTransactionHash(txHash)
        
        setSuccess(`✅ ¡Tokens CCOP reclamados exitosamente para ${destinationAddress}! Transacción: ${shortHash} | ${celoscanUrl}`)
      } catch (error) {
        console.error('Transaction failed:', error)
        throw error
      }
      
      // Refresh claim info
      await verifyAddress(destinationAddress)
    } catch (error) {
      console.error('Error claiming tokens:', error)
      
      // Handle specific contract errors
      if (error.message.includes('AlreadyClaimedToday')) {
        setError('❌ Esta dirección ya reclamó tokens hoy. ¡Inténtalo de nuevo mañana!')
      } else if (error.message.includes('MaxLifetimeClaimsReached')) {
        setError('❌ Esta dirección ha alcanzado el máximo de reclamaciones de por vida (3 veces)')
      } else if (error.message.includes('InsufficientTokenBalance')) {
        setError('❌ El contrato tiene balance insuficiente de tokens. Por favor inténtalo más tarde.')
      } else {
        setError('❌ Error al reclamar tokens: ' + error.message)
      }
    } finally {
      setLoading(false)
    }
  }

  const claimTokensGasless = async (userAddress, signer, contract) => {
    // Create the message hash
    const deadline = Math.floor(Date.now() / 1000) + 3600 // 1 hour from now
    const messageHash = ethers.keccak256(ethers.solidityPacked(
      ["address", "uint256", "address"],
      [userAddress, deadline, CONTRACT_ADDRESS]
    ))
    
    // Sign the message as if it were the user (this is the issue - we need the user's signature)
    const signature = await signer.signMessage(ethers.getBytes(messageHash))
    
    console.log('Executing gasless transaction with:')
    console.log('User Address:', userAddress)
    console.log('Deadline:', deadline)
    console.log('Signature:', signature)
    
    // Execute gasless transaction
    const tx = await contract.claimDailyTokensGasless(userAddress, deadline, signature)
    await tx.wait()
  }

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const getCeloscanUrl = (txHash) => {
    const networkId = process.env.NEXT_PUBLIC_NETWORK_ID || '44787' // Alfajores testnet
    if (networkId === '42220') {
      return `https://celoscan.io/tx/${txHash}` // Mainnet
    } else {
      return `https://alfajores.celoscan.io/tx/${txHash}` // Testnet
    }
  }

  const formatTransactionHash = (txHash) => {
    if (!txHash) return ''
    return `${txHash.slice(0, 6)}...${txHash.slice(-4)}`
  }

  // Auto-verify when address changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      verifyAddress(destinationAddress)
    }, 500) // Debounce for 500ms

    return () => clearTimeout(timeoutId)
  }, [destinationAddress])

  return (
    <div className="min-h-screen bg-gradient-to-br from-celo-dark via-gray-900 to-black">
      <header className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <a 
              href="/" 
              className="text-celo-primary hover:text-green-400 transition-colors"
            >
              <ArrowLeftIcon className="w-6 h-6" />
            </a>
            <div>
              <h1 className="text-3xl font-bold text-gradient">Reclamar Tokens CCOP</h1>
              <p className="text-gray-300">Sistema de Reclamación de Tokens CCOP</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-md">
        


        {/* Destination Address Input */}
        <div className="card mb-8">
          <h3 className="text-xl font-semibold mb-4">Ingresar Dirección de Destino</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                ¿Dónde quieres recibir los tokens CCOP?
              </label>
              <input
                type="text"
                placeholder="0x..."
                value={destinationAddress}
                onChange={(e) => setDestinationAddress(e.target.value)}
                className="input-field w-full"
              />
              <p className="text-sm text-gray-400 mt-2">
                Pega la dirección donde quieres recibir los 25,000 tokens CCOP
              </p>
            </div>
          </div>
        </div>

        {/* Claim Button - Always visible when address is valid */}
        {destinationAddress && ethers.isAddress(destinationAddress) && (
          <div className="card mb-8">
            <h3 className="text-xl font-semibold mb-4">Reclamar Tokens</h3>
            
            {/* Claim Status Info */}
            {claimInfo && (
              <div className="bg-white/5 rounded-lg p-4 space-y-3 mb-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Reclamaciones Usadas:</span>
                    <p className="font-medium">{claimInfo.totalClaims}/3</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Reclamaciones Restantes:</span>
                    <p className="font-medium">{claimInfo.remainingClaims}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Reclamado Hoy:</span>
                    <p className="font-medium">{claimInfo.claimedToday ? 'Sí' : 'No'}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Puede Reclamar Ahora:</span>
                    <p className={`font-medium ${canClaim ? 'text-green-400' : 'text-red-400'}`}>
                      {canClaim ? 'Sí' : 'No'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Claim Button */}
            <button
              onClick={claimTokens}
              disabled={loading || !canClaim}
              className={`w-full py-4 px-6 rounded-lg font-semibold transition-all duration-200 ${
                loading || !canClaim
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'btn-primary'
              }`}
            >
              {loading ? 'Procesando Transacción...' : 'Reclamar 25,000 Tokens CCOP'}
            </button>

            {/* Test Success Message Button (Temporary) */}
            <button
              onClick={() => {
                const testTxHash = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
                const celoscanUrl = getCeloscanUrl(testTxHash)
                const shortHash = formatTransactionHash(testTxHash)
                setSuccess(`✅ ¡Tokens CCOP reclamados exitosamente para ${destinationAddress}! Transacción: ${shortHash} | ${celoscanUrl}`)
              }}
              className="w-full mt-2 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
            >
              🧪 Probar Mensaje de Éxito con TXN ID
            </button>

            {!claimInfo && (
              <p className="text-yellow-400 text-sm mt-2 text-center">
                Verificando elegibilidad de reclamación...
              </p>
            )}

            {claimInfo && !canClaim && (
              <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-red-400 text-sm text-center font-medium">
                  {claimInfo.claimedToday 
                    ? '❌ Esta dirección ya reclamó tokens hoy. ¡Inténtalo de nuevo mañana!' 
                    : parseInt(claimInfo.totalClaims) >= 3 
                      ? '❌ Esta dirección ha alcanzado el máximo de reclamaciones de por vida (3 veces)'
                      : '❌ Esta dirección no puede reclamar tokens ahora (balance insuficiente del contrato)'
                  }
                </p>
              </div>
            )}

            {claimInfo && canClaim && (
              <div className="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                <p className="text-green-400 text-sm text-center font-medium">
                  ✅ ¡Esta dirección es elegible para reclamar 25,000 tokens CCOP!
                </p>
              </div>
            )}
          </div>
        )}



        {/* Error and Success Messages */}
        {error && (
          <div className="fixed bottom-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg max-w-md">
            <p className="font-medium">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg max-w-md">
            <p className="font-medium">✅ ¡Transacción Exitosa!</p>
            <div className="text-sm mb-2">
              {success.includes('Transacción:') ? (
                <div>
                  <p>{success.split('Transacción:')[0]}</p>
                  <div className="mt-2">
                    <span className="text-gray-300">TXN ID: </span>
                    <a 
                      href={success.split('|')[1]?.trim() || '#'} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-200 hover:text-blue-100 underline font-mono"
                    >
                      {success.split('Transacción:')[1]?.split('|')[0]?.trim()}
                    </a>
                  </div>
                </div>
              ) : (
                <p>{success}</p>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
} 