import { useState, useCallback, useRef } from 'react'
import { Web3 } from 'web3'

export const useWeb3 = () => {
  const [web3, setWeb3] = useState(null)
  const [account, setAccount] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [chainId, setChainId] = useState(null)
  const [balance, setBalance] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  
  const web3Ref = useRef(null)

  // 连接到指定的RPC节点
  const connectToRPC = useCallback(async (rpcUrl) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const web3Instance = new Web3(rpcUrl)
      
      // 测试连接
      const isListening = await web3Instance.eth.net.isListening()
      if (!isListening) {
        throw new Error('无法连接到网络')
      }
      
      const networkChainId = await web3Instance.eth.getChainId()
      
      // 验证是否为Sepolia测试网 (链ID: 11155111)
      if (networkChainId !== 11155111n) {
        throw new Error(`错误的网络ID: ${networkChainId}, 应该是11155111 (Sepolia)`)
      }
      
      web3Ref.current = web3Instance
      setWeb3(web3Instance)
      setChainId(Number(networkChainId))
      setIsConnected(true)
      
      return { success: true, web3: web3Instance }
    } catch (err) {
      setError(err.message)
      setIsConnected(false)
      return { success: false, error: err.message }
    } finally {
      setIsLoading(false)
    }
  }, [])

  // 设置私钥和账户
  const setPrivateKey = useCallback(async (privateKey) => {
    if (!web3Ref.current) {
      throw new Error('请先连接网络')
    }
    
    try {
      // 验证私钥格式
      let key = privateKey.trim()
      if (key.startsWith('0x')) {
        key = key.slice(2)
      }
      
      if (key.length !== 64) {
        throw new Error(`私钥长度错误：当前${key.length}位，需要64位`)
      }
      
      if (!/^[0-9a-fA-F]{64}$/.test(key)) {
        throw new Error('私钥包含无效字符，必须是十六进制字符串')
      }
      
      const validKey = '0x' + key
      const accountObj = web3Ref.current.eth.accounts.privateKeyToAccount(validKey)
      
      setAccount(accountObj)
      setError(null)
      
      // 获取余额
      try {
        const balanceWei = await web3Ref.current.eth.getBalance(accountObj.address)
        const balanceEth = web3Ref.current.utils.fromWei(balanceWei, 'ether')
        setBalance(balanceEth)
      } catch (balanceErr) {
        console.warn('获取余额失败:', balanceErr)
      }
      
      return { success: true, account: accountObj }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    }
  }, [])

  // 更新账户余额
  const updateBalance = useCallback(async (address = null) => {
    if (!web3Ref.current) return null
    
    const targetAddress = address || account?.address
    if (!targetAddress) return null
    
    try {
      const balanceWei = await web3Ref.current.eth.getBalance(targetAddress)
      const balanceEth = web3Ref.current.utils.fromWei(balanceWei, 'ether')
      setBalance(balanceEth)
      return balanceEth
    } catch (err) {
      setError(err.message)
      return null
    }
  }, [account])

  // 生成调用数据
  const generateCallData = useCallback((walletAddress) => {
    if (!walletAddress) return null
    
    const cleanAddress = walletAddress.slice(2).toLowerCase()
    const walletParam = cleanAddress.padStart(64, '0')
    return '0x6a627842' + walletParam
  }, [])

  // 发送代币领取交易
  const claimTokens = useCallback(async (config) => {
    if (!web3Ref.current || !account) {
      throw new Error('请先连接网络并设置私钥')
    }
    
    try {
      const callData = generateCallData(account.address)
      const nonce = await web3Ref.current.eth.getTransactionCount(account.address)
      
      const transaction = {
        to: config.contractAddress,
        value: '0',
        gas: config.gasLimit,
        gasPrice: web3Ref.current.utils.toWei(config.gasPrice.toString(), 'gwei'),
        nonce: nonce,
        data: callData,
        chainId: 11155111
      }
      
      const signedTx = await web3Ref.current.eth.accounts.signTransaction(
        transaction, 
        account.privateKey
      )
      
      const receipt = await web3Ref.current.eth.sendSignedTransaction(
        signedTx.rawTransaction
      )
      
      // 更新余额
      try {
        const balanceWei = await web3Ref.current.eth.getBalance(account.address)
        const balanceEth = web3Ref.current.utils.fromWei(balanceWei, 'ether')
        setBalance(balanceEth)
      } catch (balanceErr) {
        console.warn('更新余额失败:', balanceErr)
      }
      
      return {
        success: receipt.status,
        hash: receipt.transactionHash,
        gasUsed: receipt.gasUsed,
        callData
      }
    } catch (err) {
      throw new Error(err.message)
    }
  }, [account, generateCallData])

  // 重置状态
  const disconnect = useCallback(() => {
    setWeb3(null)
    setAccount(null)
    setIsConnected(false)
    setChainId(null)
    setBalance(null)
    setError(null)
    web3Ref.current = null
  }, [])

  return {
    web3,
    account,
    isConnected,
    chainId,
    balance,
    isLoading,
    error,
    connectToRPC,
    setPrivateKey,
    updateBalance,
    generateCallData,
    claimTokens,
    disconnect
  }
} 