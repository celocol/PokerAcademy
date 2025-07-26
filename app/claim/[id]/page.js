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

  const getContract = () => {
    const provider = getProvider()
    if (!provider) return null
    
    return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider)
  }

  const verifyAddress = async (address) => {
    if (!address || !ethers.isAddress(address)) {
      setCanClaim(false)
      setClaimInfo(null)
      return
    }

    try {
      const contract = getContract()
      if (!contract) {
        console.log('No provider available, cannot verify eligibility')
        setCanClaim(false)
        setClaimInfo(null)
        return
      }

      console.log('Verifying claim eligibility for address:', address)
      const info = await contract.getUserClaimInfo(address)
      
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
      setCanClaim(false)
      setClaimInfo(null)
    }
  }

  const claimTokens = async () => {
    if (!destinationAddress || !ethers.isAddress(destinationAddress)) {
      setError('Please enter a valid destination address')
      return
    }

    if (!canClaim) {
      setError('This address is not eligible to claim tokens right now')
      return
    }

    if (typeof window.ethereum === 'undefined') {
      setError('Please install MetaMask or another Web3 wallet')
      return
    }

    try {
      setLoading(true)
      setError('')
      setSuccess('')

      // Request account access
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      })
      
      if (accounts.length === 0) {
        setError('Please connect your wallet to claim tokens')
        return
      }

      const provider = getProvider()
      const signer = await provider.getSigner()
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer)

      console.log('✅ Address verified as eligible, executing transaction...')

      // Try gasless transaction first
      try {
        console.log('Attempting gasless transaction...')
        await claimTokensGasless(destinationAddress, signer, contract)
        setSuccess(`✅ Successfully claimed 25,000 CCOP tokens for ${destinationAddress}! Session: ${sessionId}`)
      } catch (gaslessError) {
        console.log('Gasless transaction failed, trying regular transaction:', gaslessError.message)
        // Fallback to regular transaction
        const tx = await contract.claimDailyTokens()
        await tx.wait()
        setSuccess(`✅ Successfully claimed 25,000 CCOP tokens for ${destinationAddress}! Session: ${sessionId}`)
      }
      
      // Refresh claim info
      await verifyAddress(destinationAddress)
    } catch (error) {
      console.error('Error claiming tokens:', error)
      
      // Handle specific contract errors
      if (error.message.includes('AlreadyClaimedToday')) {
        setError('❌ This address has already claimed tokens today. Try again tomorrow!')
      } else if (error.message.includes('MaxLifetimeClaimsReached')) {
        setError('❌ This address has reached the maximum lifetime claims (3 times)')
      } else if (error.message.includes('InsufficientTokenBalance')) {
        setError('❌ Contract has insufficient token balance. Please try again later.')
      } else {
        setError('❌ Failed to claim tokens: ' + error.message)
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
    
    // Sign the message
    const signature = await signer.signMessage(ethers.getBytes(messageHash))
    
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
              <h1 className="text-3xl font-bold text-gradient">Claim CCOP Tokens</h1>
              <p className="text-gray-300">CCOP Token Claim System - Alfajores Testnet</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-md">
        


        {/* Destination Address Input */}
        <div className="card mb-8">
          <h3 className="text-xl font-semibold mb-4">Enter Destination Address</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Where do you want to receive the CCOP tokens?
              </label>
              <input
                type="text"
                placeholder="0x..."
                value={destinationAddress}
                onChange={(e) => setDestinationAddress(e.target.value)}
                className="input-field w-full"
              />
              <p className="text-sm text-gray-400 mt-2">
                Paste the address where you want to receive the 25,000 CCOP tokens
              </p>
            </div>
          </div>
        </div>

        {/* Claim Button - Always visible when address is valid */}
        {destinationAddress && ethers.isAddress(destinationAddress) && (
          <div className="card mb-8">
            <h3 className="text-xl font-semibold mb-4">Claim Tokens</h3>
            
            {/* Claim Status Info */}
            {claimInfo && (
              <div className="bg-white/5 rounded-lg p-4 space-y-3 mb-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Claims Used:</span>
                    <p className="font-medium">{claimInfo.totalClaims}/3</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Remaining Claims:</span>
                    <p className="font-medium">{claimInfo.remainingClaims}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Claimed Today:</span>
                    <p className="font-medium">{claimInfo.claimedToday ? 'Yes' : 'No'}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Can Claim Now:</span>
                    <p className={`font-medium ${canClaim ? 'text-green-400' : 'text-red-400'}`}>
                      {canClaim ? 'Yes' : 'No'}
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
              {loading ? 'Claiming...' : 'Claim 25,000 CCOP Tokens'}
            </button>

            {!claimInfo && (
              <p className="text-yellow-400 text-sm mt-2 text-center">
                Checking claim eligibility...
              </p>
            )}

            {claimInfo && !canClaim && (
              <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-red-400 text-sm text-center font-medium">
                  {claimInfo.claimedToday 
                    ? '❌ This address has already claimed tokens today. Try again tomorrow!' 
                    : parseInt(claimInfo.totalClaims) >= 3 
                      ? '❌ This address has reached the maximum lifetime claims (3 times)'
                      : '❌ This address cannot claim tokens right now (insufficient contract balance)'
                  }
                </p>
              </div>
            )}

            {claimInfo && canClaim && (
              <div className="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                <p className="text-green-400 text-sm text-center font-medium">
                  ✅ This address is eligible to claim 25,000 CCOP tokens!
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
            <p className="font-medium">Success</p>
            <p className="text-sm">{success}</p>
          </div>
        )}
      </main>
    </div>
  )
} 