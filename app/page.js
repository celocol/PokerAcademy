'use client'

import { useState, useEffect } from 'react'
import QRCode from 'qrcode.react'
import { 
  DocumentDuplicateIcon as CopyIcon, 
  CheckIcon, 
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon
} from '@heroicons/react/24/outline'

export default function Home() {
  const [copied, setCopied] = useState(false)
  const [claimUrl, setClaimUrl] = useState('')
  const [lastRegenerated, setLastRegenerated] = useState(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [regenerationCount, setRegenerationCount] = useState(0)
  const [isListening, setIsListening] = useState(true)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Generate a unique session ID for this QR code
      const sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      setClaimUrl(`${window.location.origin}/claim/${sessionId}`)
    }
  }, [])

  // Check for QR scans and regenerate when detected
  useEffect(() => {
    let lastCheckedScanTime = null
    
    const checkForScans = async () => {
      try {
        const response = await fetch('/api/scan-detected')
        const data = await response.json()
        
        if (data.lastScanTime && data.lastScanTime !== lastCheckedScanTime) {
          lastCheckedScanTime = data.lastScanTime
          
          // Regenerate QR when scan is detected
          const sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
          setClaimUrl(`${window.location.origin}/claim/${sessionId}`)
          setLastRegenerated(new Date())
          setRegenerationCount(prev => prev + 1)
          console.log('🔄 QR regenerated due to scan detection:', sessionId)
        }
      } catch (error) {
        console.error('Error checking for scans:', error)
      }
    }
    
    // Check every 2 seconds for new scans
    const interval = setInterval(checkForScans, 2000)
    
    return () => clearInterval(interval)
  }, [])

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }



  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-celo-dark via-gray-900 to-black flex items-center justify-center">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-between items-center mb-4">
              <div></div>
              <h1 className="text-4xl font-bold text-gradient">CCOP Dispenser</h1>
              <button
                onClick={toggleFullscreen}
                className="p-2 text-celo-primary hover:text-green-400 transition-colors"
                title={isFullscreen ? "Salir pantalla completa" : "Pantalla completa"}
              >
                {isFullscreen ? (
                  <ArrowsPointingInIcon className="w-6 h-6" />
                ) : (
                  <ArrowsPointingOutIcon className="w-6 h-6" />
                )}
              </button>
            </div>
            <p className="text-gray-300 text-lg">Escanea el QR para reclamar tus tokens CCOP</p>
          </div>

          {/* QR Code Card */}
          <div className="card">
            <div className="flex items-center justify-center space-x-2 mb-6">
              <h2 className="text-2xl font-semibold">Código QR de Reclamación</h2>
            </div>
            
            <div className="flex flex-col items-center space-y-6">
              {/* QR Code */}
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <QRCode 
                  value={claimUrl || '/claim'}
                  size={250}
                  level="H"
                  includeMargin={true}
                />
              </div>
              

              
                            {/* Scan Detection Status */}
              <div className="text-center">
                <div className="inline-flex items-center space-x-2 bg-blue-500/20 border border-blue-500/30 rounded-full px-3 py-1 mb-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                  <span className="text-xs text-blue-400">
                    Escuchando escaneos...
                  </span>
                </div>
                
                {lastRegenerated && (
                  <div className="inline-flex items-center space-x-2 bg-green-500/20 border border-green-500/30 rounded-full px-3 py-1 mb-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-xs text-green-400">
                      QR regenerado: {lastRegenerated.toLocaleTimeString()}
                    </span>
                  </div>
                )}
                
                <div className="flex justify-center items-center space-x-4">
                  <p className="text-xs text-gray-400">
                    Se regenera cuando alguien escanea el QR
                  </p>
                  <div className="bg-celo-primary/20 border border-celo-primary/30 rounded-full px-2 py-1">
                    <span className="text-xs text-celo-primary">
                      #{regenerationCount} regeneraciones
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Instructions */}
              <div className="text-center space-y-4">
                <div className="bg-celo-primary/10 border border-celo-primary/20 rounded-lg p-4">
                  <h3 className="font-semibold text-celo-primary mb-2">Cómo usar:</h3>
                  <ol className="text-sm text-gray-300 space-y-1 text-left">
                    <li>1. 📱 Abre la cámara de tu celular</li>
                    <li>2. 🔍 Escanea el código QR</li>
                    <li>3. 💰 Conecta tu wallet</li>
                    <li>4. 🎯 Reclama 25,000 CCOP tokens</li>
                  </ol>
                </div>
                
                <div className="bg-celo-secondary/10 border border-celo-secondary/20 rounded-lg p-4">
                  <h3 className="font-semibold text-celo-secondary mb-2">Información:</h3>
                  <ul className="text-sm text-gray-300 space-y-1 text-left">
                    <li>• 🎯 25,000 CCOP por día</li>
                    <li>• ⏰ Reset a medianoche UTC</li>
                    <li>• 🎲 Máximo 3 reclamaciones por vida</li>
                    <li>• 🌐 Red: Celo Alfajores (Testnet)</li>
                  </ul>
                </div>
              </div>

              {/* Direct Link */}
              <div className="w-full">
                <p className="text-gray-400 mb-2 text-center">O usa este enlace directo:</p>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={claimUrl || '/claim'}
                    readOnly
                    className="input-field flex-1 text-sm"
                  />
                  <button
                    onClick={() => copyToClipboard(claimUrl || '/claim')}
                    className="p-2 text-gray-400 hover:text-white transition-colors bg-white/5 rounded-lg"
                  >
                    {copied ? <CheckIcon className="w-4 h-4" /> : <CopyIcon className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-gray-400 text-sm">
              Token CCOP: 0x8A567e2aE79CA692Bd748aB832081C45de4041eA
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 