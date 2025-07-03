import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { 
  ArrowLeftIcon,
  GlobeAltIcon,
  WalletIcon,
  CogIcon,
  PlayIcon,
  StopIcon,
  ArrowPathIcon,
  DocumentDuplicateIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  EyeIcon,
  EyeSlashIcon,
  TrashIcon,
  InformationCircleIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { useWeb3 } from '../hooks/useWeb3'
import clsx from 'clsx'

export default function SepoliaClaimer() {
  const router = useRouter()
  const {
    web3,
    account,
    isConnected,
    balance,
    isLoading,
    error: web3Error,
    connectToRPC,
    setPrivateKey,
    updateBalance,
    generateCallData,
    claimTokens,
    disconnect
  } = useWeb3()

  // 配置状态
  const [config, setConfig] = useState({
    rpcUrl: 'https://rpc.sepolia.ethpandaops.io',
    contractAddress: '0x3edf60dd017ace33a0220f78741b5581c385a1ba',
    gasPrice: 20,
    gasLimit: 100000,
    interval: 300
  })

  // UI状态
  const [privateKeyInput, setPrivateKeyInput] = useState('')
  const [showPrivateKey, setShowPrivateKey] = useState(false)
  const [isClaimingAuto, setIsClaimingAuto] = useState(false)
  const [nextClaimCountdown, setNextClaimCountdown] = useState(0)
  const [successCount, setSuccessCount] = useState(0)
  const [failCount, setFailCount] = useState(0)
  const [logs, setLogs] = useState([])
  const [activeTab, setActiveTab] = useState('network')

  // 引用
  const intervalRef = useRef(null)
  const countdownRef = useRef(null)
  const logsEndRef = useRef(null)
  const isRunningRef = useRef(false)

  // 自动滚动到日志底部
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  // 清理定时器
  useEffect(() => {
    return () => {
      isRunningRef.current = false
      if (intervalRef.current) {
        clearTimeout(intervalRef.current)
        intervalRef.current = null
      }
      if (countdownRef.current) {
        clearInterval(countdownRef.current)
        countdownRef.current = null
      }
    }
  }, [])

  // 初始化日志
  useEffect(() => {
    addLog('欢迎使用Sepolia代币领取工具 (Web版本)', 'info')
  }, [])

  // 添加日志
  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleString('zh-CN')
    const icons = {
      info: '📋',
      success: '✅',
      error: '❌',
      warning: '⚠️',
      network: '🌐',
      wallet: '💰',
      tx: '📤',
      time: '⏰'
    }
    
    setLogs(prev => [...prev, {
      id: Date.now(),
      timestamp,
      message,
      type,
      icon: icons[type] || '📋'
    }])
  }

  // 处理网络连接
  const handleConnectNetwork = async () => {
    addLog('正在连接Sepolia测试网...', 'network')
    const result = await connectToRPC(config.rpcUrl)
    
    if (result.success) {
      addLog('成功连接到Sepolia测试网', 'success')
    } else {
      addLog(`网络连接失败: ${result.error}`, 'error')
    }
  }

  // 处理私钥设置
  const handleSetPrivateKey = async () => {
    if (!privateKeyInput.trim()) {
      addLog('请输入私钥', 'warning')
      return
    }

    addLog('正在验证私钥...', 'info')
    const result = await setPrivateKey(privateKeyInput)
    
    if (result.success) {
      addLog(`钱包地址: ${result.account.address}`, 'wallet')
      addLog('私钥验证成功', 'success')
    } else {
      addLog(`私钥验证失败: ${result.error}`, 'error')
    }
  }

  // 检查余额
  const handleCheckBalance = async () => {
    if (!account) {
      addLog('请先设置私钥', 'warning')
      return
    }

    addLog('🔍 正在查询余额...', 'info')
    try {
      const newBalance = await updateBalance()
      if (newBalance !== null && newBalance !== undefined) {
        addLog(`✅ 余额查询成功! 当前ETH余额: ${newBalance} ETH`, 'success')
      } else {
        // 如果返回值为null，但没有抛出异常，说明可能是网络问题但连接正常
        addLog('⚠️  余额查询完成，但未获取到数据', 'warning')
      }
    } catch (error) {
      addLog(`❌ 余额查询失败: ${error.message}`, 'error')
    }
  }

  // 测试调用数据
  const handleTestCallData = () => {
    if (!account) {
      addLog('请先设置私钥', 'warning')
      return
    }

    const callData = generateCallData(account.address)
    addLog('🧪 测试调用数据格式:', 'info')
    addLog(`  钱包地址: ${account.address}`)
    addLog(`  方法ID: 0x6a627842`)
    addLog(`  地址参数: ${callData.slice(10)}`)
    addLog(`  完整调用数据: ${callData}`)
    addLog(`  数据长度: ${callData.length} 字符`)

    const successData = "0x6a627842000000000000000000000000a896713c759b12254fbd0fafeb61e06b6303c4bb"
    addLog(`  成功案例: ${successData}`)
    addLog(`  格式匹配: ${callData.length === successData.length ? '✅ 是' : '❌ 否'}`)
  }

  // 手动领取
  const handleManualClaim = async () => {
    if (!isConnected || !account) {
      addLog('请先连接网络并设置私钥', 'warning')
      return
    }

    try {
      addLog('👆 手动领取：正在尝试领取代币...', 'info')
      
      const result = await claimTokens(config)
      
      if (result.success) {
        setSuccessCount(prev => prev + 1)
        addLog(`✅ 手动领取成功! Gas使用: ${result.gasUsed}`, 'success')
        addLog(`🔗 交易链接: https://sepolia.etherscan.io/tx/${result.hash}`)
        addLog(`📊 总成功次数: ${successCount + 1}`, 'success')
      } else {
        setFailCount(prev => prev + 1)
        addLog('❌ 手动领取失败: 交易执行失败', 'error')
        addLog(`📊 总失败次数: ${failCount + 1}`, 'error')
      }
    } catch (error) {
      setFailCount(prev => prev + 1)
      let errorMsg = error.message
      
      if (errorMsg.toLowerCase().includes('insufficient funds')) {
        errorMsg = 'ETH余额不足，无法支付Gas费用'
      } else if (errorMsg.toLowerCase().includes('nonce too low')) {
        errorMsg = 'Nonce值过低，请稍后重试'
      } else if (errorMsg.toLowerCase().includes('replacement transaction underpriced')) {
        errorMsg = '交易费用过低，请提高Gas价格'
      } else if (errorMsg.includes('max fee per gas less than block base fee')) {
        // 解析 baseFee 和当前 maxFeePerGas
        const baseFeeMatch = errorMsg.match(/baseFee: (\d+)/)
        const maxFeeMatch = errorMsg.match(/maxFeePerGas: (\d+)/)
        
        if (baseFeeMatch && maxFeeMatch) {
          const baseFeeWei = parseInt(baseFeeMatch[1])
          const currentMaxFeeWei = parseInt(maxFeeMatch[1])
          
          // 将 Wei 转换为 Gwei
          const baseFeeGwei = Math.ceil(baseFeeWei / 1e9)
          const currentMaxFeeGwei = Math.ceil(currentMaxFeeWei / 1e9)
          
          // 根据前两位数字+1计算建议值
          const baseFeeStr = baseFeeGwei.toString()
          let suggestedGwei
          if (baseFeeStr.length >= 2) {
            const firstTwoDigits = parseInt(baseFeeStr.substring(0, 2))
            suggestedGwei = firstTwoDigits + 1
          } else {
            suggestedGwei = baseFeeGwei + 1
          }
          
          errorMsg = `Gas价格过低，当前设置为${currentMaxFeeGwei} Gwei，网络基础费用为${baseFeeGwei} Gwei，请调整至最少${suggestedGwei} Gwei`
        } else {
          errorMsg = 'Gas价格过低，请提高Gas价格设置'
        }
      }
      
      addLog(`❌ 手动领取失败: ${errorMsg}`, 'error')
      addLog(`📊 总失败次数: ${failCount + 1}`, 'error')
    }
  }

  // 自动领取的单次领取
  const handleAutoSingleClaim = async () => {
    if (!isConnected || !account) {
      addLog('请先连接网络并设置私钥', 'warning')
      return
    }

    try {
      addLog('🔄 自动领取：开始尝试领取代币...', 'info')
      
      const result = await claimTokens(config)
      
      if (result.success) {
        setSuccessCount(prev => prev + 1)
        addLog(`✅ 自动领取成功! Gas使用: ${result.gasUsed}`, 'success')
        addLog(`🔗 交易链接: https://sepolia.etherscan.io/tx/${result.hash}`)
        addLog(`📊 总成功次数: ${successCount + 1}`, 'success')
      } else {
        setFailCount(prev => prev + 1)
        addLog('❌ 自动领取失败: 交易执行失败', 'error')
        addLog(`📊 总失败次数: ${failCount + 1}`, 'error')
      }
         } catch (error) {
       setFailCount(prev => prev + 1)
       let errorMsg = error.message
       
       if (errorMsg.toLowerCase().includes('insufficient funds')) {
         errorMsg = 'ETH余额不足，无法支付Gas费用'
       } else if (errorMsg.toLowerCase().includes('nonce too low')) {
         errorMsg = 'Nonce值过低，请稍后重试'
       } else if (errorMsg.toLowerCase().includes('replacement transaction underpriced')) {
         errorMsg = '交易费用过低，请提高Gas价格'
       } else if (errorMsg.includes('max fee per gas less than block base fee')) {
         // 解析 baseFee 和当前 maxFeePerGas
         const baseFeeMatch = errorMsg.match(/baseFee: (\d+)/)
         const maxFeeMatch = errorMsg.match(/maxFeePerGas: (\d+)/)
         
         if (baseFeeMatch && maxFeeMatch) {
           const baseFeeWei = parseInt(baseFeeMatch[1])
           const currentMaxFeeWei = parseInt(maxFeeMatch[1])
           
           // 将 Wei 转换为 Gwei
           const baseFeeGwei = Math.ceil(baseFeeWei / 1e9)
           const currentMaxFeeGwei = Math.ceil(currentMaxFeeWei / 1e9)
           
           // 根据前两位数字+1计算建议值
           const baseFeeStr = baseFeeGwei.toString()
           let suggestedGwei
           if (baseFeeStr.length >= 2) {
             const firstTwoDigits = parseInt(baseFeeStr.substring(0, 2))
             suggestedGwei = firstTwoDigits + 1
           } else {
             suggestedGwei = baseFeeGwei + 1
           }
           
           errorMsg = `Gas价格过低，当前设置为${currentMaxFeeGwei} Gwei，网络基础费用为${baseFeeGwei} Gwei，请调整至最少${suggestedGwei} Gwei`
         } else {
           errorMsg = 'Gas价格过低，请提高Gas价格设置'
         }
       }
       
       addLog(`❌ 自动领取失败: ${errorMsg}`, 'error')
       addLog(`📊 总失败次数: ${failCount + 1}`, 'error')
     }
  }

  // 开始自动领取
  const handleStartAutoClaim = () => {
    if (!isConnected || !account) {
      addLog('请先连接网络并设置私钥', 'warning')
      return
    }

    if (config.interval < 60) {
      if (!confirm('领取间隔小于60秒可能会被限制，是否继续？')) {
        return
      }
    }

    setIsClaimingAuto(true)
    isRunningRef.current = true
    addLog('🚀 开始自动领取代币', 'success')

          const runClaimLoop = async () => {
        while (isRunningRef.current) {
          try {
            await handleAutoSingleClaim()
          } catch (error) {
            addLog(`领取异常: ${error.message}`, 'error')
          }
        
        if (!isRunningRef.current) break
        
        // 开始倒计时
        setNextClaimCountdown(config.interval)
        addLog(`⏰ 等待 ${config.interval} 秒后进行下次领取...`, 'time')
        
        // 倒计时显示
        countdownRef.current = setInterval(() => {
          setNextClaimCountdown(prev => {
            if (prev <= 1) {
              clearInterval(countdownRef.current)
              return 0
            }
            return prev - 1
          })
        }, 1000)

        // 等待间隔时间
        await new Promise(resolve => {
          intervalRef.current = setTimeout(() => {
            if (countdownRef.current) {
              clearInterval(countdownRef.current)
            }
            resolve()
          }, config.interval * 1000)
        })
      }
      
      addLog('自动领取循环已结束', 'info')
    }

    runClaimLoop().catch(error => {
      addLog(`自动领取异常: ${error.message}`, 'error')
      handleStopAutoClaim()
    })
  }

  // 停止自动领取
  const handleStopAutoClaim = () => {
    setIsClaimingAuto(false)
    isRunningRef.current = false
    setNextClaimCountdown(0)
    
    if (intervalRef.current) {
      clearTimeout(intervalRef.current)
      intervalRef.current = null
    }
    
    if (countdownRef.current) {
      clearInterval(countdownRef.current)
      countdownRef.current = null
    }
    
    addLog('⏹️ 停止自动领取', 'warning')
  }

  // 清空日志
  const handleClearLogs = () => {
    setLogs([])
    setSuccessCount(0)
    setFailCount(0)
    addLog('📝 日志已清空', 'info')
  }

  // 保存配置
  const handleSaveConfig = () => {
    try {
      const configToSave = { ...config }
      // 不保存私钥
      localStorage.setItem('sepolia_config', JSON.stringify(configToSave))
      addLog('💾 配置已保存到本地存储', 'success')
    } catch (error) {
      addLog(`保存配置失败: ${error.message}`, 'error')
    }
  }

  // 加载配置
  useEffect(() => {
    try {
      const savedConfig = localStorage.getItem('sepolia_config')
      if (savedConfig) {
        const parsedConfig = JSON.parse(savedConfig)
        setConfig(prev => ({ ...prev, ...parsedConfig }))
        addLog('📂 配置已从本地存储加载', 'success')
      }
    } catch (error) {
      addLog('配置加载失败，使用默认配置', 'warning')
    }

    // 页面卸载时停止自动领取
    const handleBeforeUnload = () => {
      isRunningRef.current = false
    }
    
    window.addEventListener('beforeunload', handleBeforeUnload)
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [])

  // 复制到剪贴板
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      addLog('已复制到剪贴板', 'success')
    } catch (err) {
      addLog('复制失败', 'error')
    }
  }

  return (
    <>
      <Head>
        <title>Sepolia代币领取工具 - 区块链</title>
        <meta name="description" content="自动化领取Sepolia测试网代币工具" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Header */}
        <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link href="/">
                  <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors">
                    <ArrowLeftIcon className="w-5 h-5" />
                    <span>返回</span>
                  </button>
                </Link>
                <div className="w-px h-6 bg-gray-300" />
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                    <CurrencyDollarIcon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-lg font-bold text-gray-900">Sepolia代币领取工具</h1>
                    <p className="text-sm text-gray-600">zama测试网代币领取工具</p>
                  </div>
                </div>
              </div>
              
              {/* 状态指示器 */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className={clsx(
                    'w-2 h-2 rounded-full',
                    isConnected ? 'bg-green-500' : 'bg-red-500'
                  )} />
                  <span className="text-sm text-gray-600">
                    {isConnected ? '网络已连接' : '网络未连接'}
                  </span>
                </div>
                
                {account && (
                  <div className="flex items-center space-x-2">
                    <WalletIcon className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-gray-600 font-mono">
                      {account.address.slice(0, 6)}...{account.address.slice(-4)}
                    </span>
                    <button
                      onClick={() => copyToClipboard(account.address)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <DocumentDuplicateIcon className="w-4 h-4" />
                    </button>
                  </div>
                )}
                
                {balance !== null && (
                  <div className="text-sm text-gray-600">
                    余额: {parseFloat(balance).toFixed(6)} ETH
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-6 py-8">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Left Panel - Controls */}
            <div className="xl:col-span-2 space-y-6">
              {/* Tab Navigation */}
              <div className="card p-6">
                <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-6">
                  {[
                    { id: 'network', name: '网络配置', icon: GlobeAltIcon },
                    { id: 'wallet', name: '钱包配置', icon: WalletIcon },
                    { id: 'settings', name: '交易配置', icon: CogIcon }
                  ].map((tab) => {
                    const Icon = tab.icon
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={clsx(
                          'flex items-center space-x-2 px-4 py-2 rounded-md transition-all text-sm font-medium',
                          activeTab === tab.id
                            ? 'bg-white text-blue-600 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                        )}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{tab.name}</span>
                      </button>
                    )
                  })}
                </div>

                {/* Network Configuration */}
                {activeTab === 'network' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        RPC节点
                      </label>
                      <input
                        type="text"
                        value={config.rpcUrl}
                        onChange={(e) => setConfig(prev => ({ ...prev, rpcUrl: e.target.value }))}
                        className="input"
                        placeholder="https://rpc.sepolia.ethpandaops.io"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        合约地址
                      </label>
                      <input
                        type="text"
                        value={config.contractAddress}
                        onChange={(e) => setConfig(prev => ({ ...prev, contractAddress: e.target.value }))}
                        className="input"
                        placeholder="0x3edf60dd017ace33a0220f78741b5581c385a1ba"
                      />
                    </div>

                    <button
                      onClick={handleConnectNetwork}
                      disabled={isLoading}
                      className={clsx(
                        'btn w-full flex items-center justify-center space-x-2',
                        isConnected ? 'btn-success' : 'btn-primary',
                        isLoading && 'btn-disabled'
                      )}
                    >
                      {isLoading ? (
                        <ArrowPathIcon className="w-4 h-4 animate-spin" />
                      ) : (
                        <GlobeAltIcon className="w-4 h-4" />
                      )}
                      <span>
                        {isLoading ? '连接中...' : isConnected ? '已连接 (Sepolia)' : '连接网络'}
                      </span>
                    </button>
                  </div>
                )}

                {/* Wallet Configuration */}
                {activeTab === 'wallet' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        私钥 (64位十六进制字符串)
                      </label>
                      <div className="relative">
                        <input
                          type={showPrivateKey ? 'text' : 'password'}
                          value={privateKeyInput}
                          onChange={(e) => setPrivateKeyInput(e.target.value)}
                          className="input pr-10"
                          placeholder="输入你的私钥..."
                        />
                        <button
                          type="button"
                          onClick={() => setShowPrivateKey(!showPrivateKey)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                        >
                          {showPrivateKey ? (
                            <EyeSlashIcon className="w-4 h-4" />
                          ) : (
                            <EyeIcon className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        私钥要求：64位十六进制字符串，不包含0x前缀
                      </p>
                    </div>

                    {account && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          钱包地址
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={account.address}
                            readOnly
                            className="input bg-gray-50 text-gray-600 pr-10"
                          />
                          <button
                            onClick={() => copyToClipboard(account.address)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                          >
                            <DocumentDuplicateIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="flex space-x-3">
                      <button
                        onClick={handleSetPrivateKey}
                        disabled={!isConnected || !privateKeyInput.trim()}
                        className={clsx(
                          'btn flex-1 flex items-center justify-center space-x-2',
                          account ? 'btn-success' : 'btn-primary',
                          (!isConnected || !privateKeyInput.trim()) && 'btn-disabled'
                        )}
                      >
                        <WalletIcon className="w-4 h-4" />
                        <span>{account ? '已验证' : '验证私钥'}</span>
                      </button>
                      
                      <button
                        onClick={handleCheckBalance}
                        disabled={!account}
                        className={clsx(
                          'btn btn-secondary flex items-center justify-center space-x-2',
                          !account && 'btn-disabled'
                        )}
                      >
                        <ArrowPathIcon className="w-4 h-4" />
                        <span>查余额</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Transaction Settings */}
                {activeTab === 'settings' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Gas价格 (Gwei)
                        </label>
                        <input
                          type="number"
                          value={config.gasPrice}
                          onChange={(e) => setConfig(prev => ({ ...prev, gasPrice: parseInt(e.target.value) || 20 }))}
                          className="input"
                          min="1"
                          max="100"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Gas限制
                        </label>
                        <input
                          type="number"
                          value={config.gasLimit}
                          onChange={(e) => setConfig(prev => ({ ...prev, gasLimit: parseInt(e.target.value) || 100000 }))}
                          className="input"
                          min="21000"
                          max="500000"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        领取间隔 (秒)
                      </label>
                      <input
                        type="number"
                        value={config.interval}
                        onChange={(e) => setConfig(prev => ({ ...prev, interval: parseInt(e.target.value) || 300 }))}
                        className="input"
                        min="60"
                        max="3600"
                      />
                      <p className="text-xs text-gray-500 mt-1">建议间隔不少于60秒，避免被限制</p>
                    </div>

                    <button
                      onClick={handleTestCallData}
                      disabled={!account}
                      className={clsx(
                        'btn btn-secondary w-full flex items-center justify-center space-x-2',
                        !account && 'btn-disabled'
                      )}
                    >
                      <InformationCircleIcon className="w-4 h-4" />
                      <span>测试调用数据</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <PlayIcon className="w-5 h-5" />
                  <span>操作控制</span>
                </h3>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <button
                    onClick={handleCheckBalance}
                    disabled={!account}
                    className={clsx(
                      'btn btn-secondary flex items-center justify-center space-x-2 h-12',
                      !account && 'btn-disabled'
                    )}
                  >
                    <ArrowPathIcon className="w-5 h-5" />
                    <span>检查余额</span>
                  </button>

                  <button
                    onClick={handleManualClaim}
                    disabled={!isConnected || !account || isClaimingAuto}
                    className={clsx(
                      'btn btn-primary flex items-center justify-center space-x-2 h-12',
                      (!isConnected || !account || isClaimingAuto) && 'btn-disabled'
                    )}
                  >
                    <PlayIcon className="w-5 h-5" />
                    <span>手动领取</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  {!isClaimingAuto ? (
                    <button
                      onClick={handleStartAutoClaim}
                      disabled={!isConnected || !account}
                      className={clsx(
                        'btn btn-success flex items-center justify-center space-x-2 h-12',
                        (!isConnected || !account) && 'btn-disabled'
                      )}
                    >
                      <PlayIcon className="w-5 h-5" />
                      <span>开始自动领取</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleStopAutoClaim}
                      className="btn btn-error flex items-center justify-center space-x-2 h-12"
                    >
                      <StopIcon className="w-5 h-5" />
                      <span>停止自动领取</span>
                    </button>
                  )}

                  <button
                    onClick={handleSaveConfig}
                    className="btn btn-secondary flex items-center justify-center space-x-2 h-12"
                  >
                    <DocumentDuplicateIcon className="w-5 h-5" />
                    <span>保存配置</span>
                  </button>
                </div>

                {/* Auto Claim Status */}
                {isClaimingAuto && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-sm font-medium text-green-800">
                          自动领取运行中
                        </span>
                      </div>
                      {nextClaimCountdown > 0 && (
                        <div className="flex items-center space-x-2 text-sm text-green-700">
                          <ClockIcon className="w-4 h-4" />
                          <span>下次领取: {nextClaimCountdown}秒</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Warning */}
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-yellow-800">
                      <p className="font-medium mb-1">安全提醒</p>
                      <ul className="space-y-1 text-xs">
                        <li>• 仅在Sepolia测试网使用，切勿用于主网</li>
                        <li>• 私钥仅在浏览器本地处理，不会上传服务器</li>
                        <li>• 建议使用测试专用的钱包账户</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Panel - Status & Logs */}
            <div className="space-y-6">
              {/* Status Panel */}
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <InformationCircleIcon className="w-5 h-5" />
                  <span>状态信息</span>
                </h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">网络状态</span>
                    <div className="flex items-center space-x-2">
                      {isConnected ? (
                        <CheckCircleIcon className="w-4 h-4 text-green-600" />
                      ) : (
                        <XCircleIcon className="w-4 h-4 text-red-600" />
                      )}
                      <span className={clsx(
                        'text-sm font-medium',
                        isConnected ? 'text-green-600' : 'text-red-600'
                      )}>
                        {isConnected ? '已连接 (Sepolia)' : '未连接'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">钱包状态</span>
                    <div className="flex items-center space-x-2">
                      {account ? (
                        <CheckCircleIcon className="w-4 h-4 text-green-600" />
                      ) : (
                        <XCircleIcon className="w-4 h-4 text-red-600" />
                      )}
                      <span className={clsx(
                        'text-sm font-medium',
                        account ? 'text-green-600' : 'text-red-600'
                      )}>
                        {account ? '已设置' : '未设置'}
                      </span>
                    </div>
                  </div>

                  {balance !== null && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">ETH余额</span>
                      <span className="text-sm font-medium text-gray-900">
                        {parseFloat(balance).toFixed(6)} ETH
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">领取状态</span>
                    <div className="flex items-center space-x-2">
                      <div className={clsx(
                        'w-2 h-2 rounded-full',
                        isClaimingAuto ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                      )} />
                      <span className="text-sm font-medium text-gray-900">
                        {isClaimingAuto ? '运行中' : '已停止'}
                      </span>
                    </div>
                  </div>

                  {nextClaimCountdown > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">下次领取</span>
                      <span className="text-sm font-medium text-blue-600">
                        {nextClaimCountdown}秒后
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">成功次数</span>
                    <span className="text-sm font-medium text-green-600">
                      {successCount}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">失败次数</span>
                    <span className="text-sm font-medium text-red-600">
                      {failCount}
                    </span>
                  </div>

                  <div className="border-t pt-3">
                    <div className="text-xs text-gray-500 space-y-1">
                      <div>RPC节点: {config.rpcUrl.replace('https://', '').slice(0, 30)}...</div>
                      <div>合约地址: {config.contractAddress.slice(0, 10)}...{config.contractAddress.slice(-6)}</div>
                      <div>Gas设置: {config.gasPrice} Gwei / {config.gasLimit} limit</div>
                      <div>领取间隔: {config.interval} 秒</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Logs Panel */}
              <div className="card">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                      <DocumentDuplicateIcon className="w-5 h-5" />
                      <span>领取记录</span>
                    </h3>
                    <button
                      onClick={handleClearLogs}
                      className="btn btn-secondary flex items-center space-x-1 text-xs py-1 px-2"
                    >
                      <TrashIcon className="w-3 h-3" />
                      <span>清空记录</span>
                    </button>
                  </div>
                </div>
                
                <div className="h-96 overflow-y-auto p-4 space-y-2">
                  {logs.length === 0 ? (
                    <div className="text-center text-gray-500 text-sm py-8">
                      暂无操作记录
                    </div>
                  ) : (
                    logs.map((log) => (
                      <div key={log.id} className="log-entry text-xs">
                        <div className="flex space-x-2">
                          <span className="text-gray-400 flex-shrink-0">
                            [{log.timestamp}]
                          </span>
                          <span className="flex-shrink-0">{log.icon}</span>
                          <span className={clsx(
                            'flex-1 break-words',
                            log.type === 'error' && 'text-red-600',
                            log.type === 'success' && 'text-green-600',
                            log.type === 'warning' && 'text-yellow-600',
                            log.type === 'info' && 'text-gray-700'
                          )}>
                            {log.message}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={logsEndRef} />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  )
} 