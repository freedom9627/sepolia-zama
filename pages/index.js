import { useState } from 'react'
import Link from 'next/link'
import Head from 'next/head'
import { 
  CubeTransparentIcon, 
  ChevronRightIcon,
  GlobeAltIcon,
  CurrencyDollarIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'

export default function Home() {
  const [selectedProject, setSelectedProject] = useState(null)

  const projects = [
    {
      id: 'sepolia-claimer',
      name: 'Sepolia测试网zama项目代币领取工具',
      description: '自动化领取Sepolia测试网zama项目代币，支持自定义配置和循环领取',
      icon: CurrencyDollarIcon,
      features: [
        '自动连接Sepolia测试网',
        '私钥安全验证',
        '实时余额查询',
        '智能合约调用测试',
        '可配置的循环领取',
        '详细的操作日志'
      ],
      status: 'available',
      path: '/sepolia-claimer'
    },
    // 未来可以添加更多项目
    {
      id: 'coming-soon',
      name: '更多工具开发中...',
      description: '我们正在开发更多区块链工具，敬请期待',
      icon: CubeTransparentIcon,
      features: [
        '多链支持',
        '更多代币类型',
        '高级交易功能',
        '批量操作'
      ],
      status: 'coming-soon',
      path: '#'
    }
  ]

  return (
    <>
      <Head>
        <title>区块链工具集合 - Blockchain Tools</title>
        <meta name="description" content="专业的区块链工具集合，包含代币领取、交易分析等功能" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Header */}
        <header className="border-b bg-white/80 backdrop-blur-sm">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <GlobeAltIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">区块链工具集合</h1>
                <p className="text-sm text-gray-600">专业的Web3工具平台</p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-6 py-12">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              选择你需要的工具
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              我们提供一系列专业的区块链工具，帮助你更高效地进行Web3开发和操作
            </p>
          </div>

          {/* Projects Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {projects.map((project) => {
              const IconComponent = project.icon
              const isAvailable = project.status === 'available'
              const isSelected = selectedProject === project.id

              return (
                <div
                  key={project.id}
                  className={`card p-8 transition-all duration-300 cursor-pointer transform hover:scale-105 ${
                    isSelected ? 'ring-2 ring-blue-500 shadow-lg' : 'hover:shadow-lg'
                  } ${!isAvailable ? 'opacity-75' : ''}`}
                  onClick={() => setSelectedProject(project.id)}
                >
                  {/* Project Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        isAvailable 
                          ? 'bg-gradient-to-br from-blue-100 to-purple-100 text-blue-600' 
                          : 'bg-gray-100 text-gray-400'
                      }`}>
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-1">
                          {project.name}
                        </h3>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            isAvailable 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {isAvailable ? '可用' : '开发中'}
                          </span>
                          {isAvailable && (
                            <ShieldCheckIcon className="w-4 h-4 text-green-600" />
                          )}
                        </div>
                      </div>
                    </div>
                    {isAvailable && (
                      <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                    )}
                  </div>

                  {/* Project Description */}
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {project.description}
                  </p>

                  {/* Features */}
                  <div className="mb-8">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">主要功能：</h4>
                    <ul className="grid grid-cols-1 gap-2">
                      {project.features.map((feature, index) => (
                        <li key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Action Button */}
                  {isAvailable ? (
                    <Link href={project.path}>
                      <button className="btn-primary w-full justify-center flex items-center space-x-2">
                        <span>开始使用</span>
                        <ChevronRightIcon className="w-4 h-4" />
                      </button>
                    </Link>
                  ) : (
                    <button className="btn-disabled w-full justify-center">
                      敬请期待
                    </button>
                  )}
                </div>
              )
            })}
          </div>

          {/* Info Section */}
          <div className="mt-16 text-center">
            <div className="card p-8 max-w-2xl mx-auto">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                安全提醒
              </h3>
              <div className="text-left space-y-3 text-gray-600">
                <p className="flex items-start space-x-2">
                  <ShieldCheckIcon className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <span>请仅在测试网络中使用，切勿在主网使用真实资产</span>
                </p>
                <p className="flex items-start space-x-2">
                  <ShieldCheckIcon className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <span>妥善保管你的私钥，不要分享给任何人</span>
                </p>
                <p className="flex items-start space-x-2">
                  <ShieldCheckIcon className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <span>建议在隔离环境中测试，确保操作安全</span>
                </p>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t bg-white/80 backdrop-blur-sm mt-20">
          <div className="container mx-auto px-6 py-8">
            <div className="text-center text-gray-600">
              <p className="mb-2">© 2025 区块链工具集合. 专业各种实时撸毛工具.</p>
              <p className="text-sm">x: <a href="https://x.com/mica_freedom" target="_blank" rel="noopener noreferrer">design_by_mica</a> </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
} 