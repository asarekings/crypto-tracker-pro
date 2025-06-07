import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Activity, Eye, Settings, Search, Star, Zap, BarChart3, PieChart, Globe } from 'lucide-react';

const CryptoTracker = () => {
  const [cryptoData, setCryptoData] = useState([]);
  const [selectedCrypto, setSelectedCrypto] = useState(null);
  const [historicalData, setHistoricalData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('market_cap');
  const [sortOrder, setSortOrder] = useState('desc');
  const [watchlist, setWatchlist] = useState(['bitcoin', 'ethereum', 'cardano']);
  const [timeRange, setTimeRange] = useState('7');
  const [loading, setLoading] = useState(true);
  const [marketStats, setMarketStats] = useState(null);
  const [technicalIndicators, setTechnicalIndicators] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Simulated API data for demo purposes (in real app, use CoinGecko API)
  const generateMockData = useCallback(() => {
    const cryptos = [
      { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC', image: '₿' },
      { id: 'ethereum', name: 'Ethereum', symbol: 'ETH', image: 'Ξ' },
      { id: 'cardano', name: 'Cardano', symbol: 'ADA', image: '₳' },
      { id: 'solana', name: 'Solana', symbol: 'SOL', image: '◎' },
      { id: 'chainlink', name: 'Chainlink', symbol: 'LINK', image: '⬡' },
      { id: 'polkadot', name: 'Polkadot', symbol: 'DOT', image: '●' },
      { id: 'avalanche', name: 'Avalanche', symbol: 'AVAX', image: '▲' },
      { id: 'polygon', name: 'Polygon', symbol: 'MATIC', image: '⬟' }
    ];

    return cryptos.map(crypto => ({
      ...crypto,
      current_price: Math.random() * 50000 + 100,
      price_change_percentage_24h: (Math.random() - 0.5) * 20,
      market_cap: Math.random() * 500000000000,
      volume_24h: Math.random() * 10000000000,
      circulating_supply: Math.random() * 100000000,
      total_supply: Math.random() * 200000000,
      max_supply: Math.random() * 300000000,
      market_cap_rank: Math.floor(Math.random() * 100) + 1,
      sparkline_in_7d: {
        price: Array.from({ length: 168 }, () => Math.random() * 1000 + 100)
      }
    }));
  }, []);

  const generateHistoricalData = useCallback((days = 7) => {
    return Array.from({ length: days * 24 }, (_, i) => ({
      timestamp: Date.now() - (days * 24 - i) * 3600000,
      date: new Date(Date.now() - (days * 24 - i) * 3600000).toISOString(),
      price: Math.random() * 10000 + 20000,
      volume: Math.random() * 1000000000,
      market_cap: Math.random() * 500000000000
    }));
  }, []);

  const calculateTechnicalIndicators = useCallback((priceData) => {
    if (!priceData || priceData.length < 20) return null;

    const prices = priceData.map(d => d.price);
    const volumes = priceData.map(d => d.volume);

    // Simple Moving Averages
    const sma20 = prices.slice(-20).reduce((a, b) => a + b, 0) / 20;
    const sma50 = prices.slice(-50).reduce((a, b) => a + b, 0) / Math.min(50, prices.length);

    // RSI Calculation (simplified)
    const changes = [];
    for (let i = 1; i < prices.length; i++) {
      changes.push(prices[i] - prices[i - 1]);
    }
    const gains = changes.filter(c => c > 0);
    const losses = changes.filter(c => c < 0).map(c => Math.abs(c));
    const avgGain = gains.reduce((a, b) => a + b, 0) / gains.length || 0;
    const avgLoss = losses.reduce((a, b) => a + b, 0) / losses.length || 0;
    const rs = avgGain / (avgLoss || 1);
    const rsi = 100 - (100 / (1 + rs));

    // Volume analysis
    const avgVolume = volumes.reduce((a, b) => a + b, 0) / volumes.length;
    const currentVolume = volumes[volumes.length - 1];
    const volumeRatio = currentVolume / avgVolume;

    return {
      sma20: sma20.toFixed(2),
      sma50: sma50.toFixed(2),
      rsi: rsi.toFixed(2),
      volumeRatio: volumeRatio.toFixed(2),
      trend: sma20 > sma50 ? 'bullish' : 'bearish',
      strength: rsi > 70 ? 'overbought' : rsi < 30 ? 'oversold' : 'neutral'
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockData = generateMockData();
      setCryptoData(mockData);
      
      if (!selectedCrypto) {
        setSelectedCrypto(mockData[0]);
      }
      
      setMarketStats({
        totalMarketCap: mockData.reduce((sum, crypto) => sum + crypto.market_cap, 0),
        total24hVolume: mockData.reduce((sum, crypto) => sum + crypto.volume_24h, 0),
        btcDominance: (mockData[0]?.market_cap / mockData.reduce((sum, crypto) => sum + crypto.market_cap, 0)) * 100,
        activeCryptocurrencies: mockData.length * 125 // Simulate larger market
      });
      
      setLoading(false);
    };

    fetchData();
    const interval = setInterval(fetchData, 30000); // Update every 30 seconds
    
    return () => clearInterval(interval);
  }, [generateMockData]);

  useEffect(() => {
    if (selectedCrypto) {
      const historical = generateHistoricalData(parseInt(timeRange));
      setHistoricalData(historical);
      const indicators = calculateTechnicalIndicators(historical);
      setTechnicalIndicators(indicators);
    }
  }, [selectedCrypto, timeRange, generateHistoricalData, calculateTechnicalIndicators]);

  const filteredAndSortedData = useMemo(() => {
    let filtered = cryptoData.filter(crypto =>
      crypto.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      crypto.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return filtered.sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      }
      return aVal < bVal ? 1 : -1;
    });
  }, [cryptoData, searchTerm, sortBy, sortOrder]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: price < 1 ? 6 : 2
    }).format(price);
  };

  const formatMarketCap = (value) => {
    if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    return `$${value.toLocaleString()}`;
  };

  const toggleWatchlist = (cryptoId) => {
    setWatchlist(prev => 
      prev.includes(cryptoId) 
        ? prev.filter(id => id !== cryptoId)
        : [...prev, cryptoId]
    );
  };

  const MarketStatsCard = () => (
    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Globe className="text-blue-400" size={20} />
        Global Market Stats
      </h3>
      {marketStats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">
              {formatMarketCap(marketStats.totalMarketCap)}
            </div>
            <div className="text-sm text-slate-400">Total Market Cap</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">
              {formatMarketCap(marketStats.total24hVolume)}
            </div>
            <div className="text-sm text-slate-400">24h Volume</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">
              {marketStats.btcDominance.toFixed(1)}%
            </div>
            <div className="text-sm text-slate-400">BTC Dominance</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">
              {marketStats.activeCryptocurrencies.toLocaleString()}
            </div>
            <div className="text-sm text-slate-400">Active Cryptos</div>
          </div>
        </div>
      )}
    </div>
  );

  const TechnicalAnalysisPanel = () => (
    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
        <BarChart3 className="text-purple-400" size={20} />
        Technical Analysis
      </h3>
      {technicalIndicators && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-800/50 rounded-lg p-3">
              <div className="text-sm text-slate-400">SMA 20</div>
              <div className="text-lg font-semibold text-blue-400">
                ${technicalIndicators.sma20}
              </div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3">
              <div className="text-sm text-slate-400">SMA 50</div>
              <div className="text-lg font-semibold text-green-400">
                ${technicalIndicators.sma50}
              </div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3">
              <div className="text-sm text-slate-400">RSI</div>
              <div className={`text-lg font-semibold ${
                technicalIndicators.rsi > 70 ? 'text-red-400' :
                technicalIndicators.rsi < 30 ? 'text-green-400' : 'text-yellow-400'
              }`}>
                {technicalIndicators.rsi}
              </div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3">
              <div className="text-sm text-slate-400">Volume Ratio</div>
              <div className={`text-lg font-semibold ${
                technicalIndicators.volumeRatio > 1.5 ? 'text-green-400' : 'text-slate-300'
              }`}>
                {technicalIndicators.volumeRatio}x
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-400">Trend:</span>
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                technicalIndicators.trend === 'bullish' 
                  ? 'bg-green-400/20 text-green-400' 
                  : 'bg-red-400/20 text-red-400'
              }`}>
                {technicalIndicators.trend.toUpperCase()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-400">Signal:</span>
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                technicalIndicators.strength === 'overbought' ? 'bg-red-400/20 text-red-400' :
                technicalIndicators.strength === 'oversold' ? 'bg-green-400/20 text-green-400' :
                'bg-yellow-400/20 text-yellow-400'
              }`}>
                {technicalIndicators.strength.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const PriceChart = () => (
    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <Activity className="text-green-400" size={20} />
          {selectedCrypto?.name} Price Chart
        </h3>
        <div className="flex gap-2">
          {['1', '7', '30', '90'].map(days => (
            <button
              key={days}
              onClick={() => setTimeRange(days)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                timeRange === days
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {days}D
            </button>
          ))}
        </div>
      </div>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={historicalData}>
            <defs>
              <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="timestamp"
              tickFormatter={(timestamp) => new Date(timestamp).toLocaleDateString()}
              stroke="#9ca3af"
              fontSize={12}
            />
            <YAxis 
              tickFormatter={(value) => `$${value.toLocaleString()}`}
              stroke="#9ca3af"
              fontSize={12}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#fff'
              }}
              formatter={(value) => [formatPrice(value), 'Price']}
              labelFormatter={(timestamp) => new Date(timestamp).toLocaleString()}
            />
            <Area
              type="monotone"
              dataKey="price"
              stroke="#3b82f6"
              strokeWidth={2}
              fill="url(#priceGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  const VolumeChart = () => (
    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
        <BarChart3 className="text-yellow-400" size={20} />
        Volume Analysis
      </h3>
      <div className="h-60">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={historicalData.slice(-30)}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="timestamp"
              tickFormatter={(timestamp) => new Date(timestamp).toLocaleDateString()}
              stroke="#9ca3af"
              fontSize={12}
            />
            <YAxis 
              tickFormatter={(value) => `$${(value/1e9).toFixed(1)}B`}
              stroke="#9ca3af"
              fontSize={12}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#fff'
              }}
              formatter={(value) => [formatMarketCap(value), 'Volume']}
            />
            <Bar dataKey="volume" fill="#fbbf24" opacity={0.8} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-slate-300 text-lg">Loading cryptocurrency data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <div className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-xl">
                <Zap className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  CryptoVision Pro
                </h1>
                <p className="text-sm text-slate-400">Advanced Cryptocurrency Analytics</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="Search cryptocurrencies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-slate-400"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Market Stats */}
        <MarketStatsCard />

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Crypto List */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Top Cryptocurrencies</h3>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-1 text-sm"
                >
                  <option value="market_cap">Market Cap</option>
                  <option value="current_price">Price</option>
                  <option value="price_change_percentage_24h">24h Change</option>
                  <option value="volume_24h">Volume</option>
                </select>
              </div>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredAndSortedData.map((crypto) => (
                  <div
                    key={crypto.id}
                    onClick={() => setSelectedCrypto(crypto)}
                    className={`p-3 rounded-lg cursor-pointer transition-all hover:bg-slate-700/50 ${
                      selectedCrypto?.id === crypto.id ? 'bg-blue-500/20 border border-blue-500/50' : 'bg-slate-800/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-sm font-bold">
                          {crypto.image}
                        </div>
                        <div>
                          <div className="font-semibold">{crypto.name}</div>
                          <div className="text-sm text-slate-400">{crypto.symbol.toUpperCase()}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{formatPrice(crypto.current_price)}</div>
                        <div className={`text-sm flex items-center gap-1 ${
                          crypto.price_change_percentage_24h >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {crypto.price_change_percentage_24h >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                          {Math.abs(crypto.price_change_percentage_24h).toFixed(2)}%
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleWatchlist(crypto.id);
                        }}
                        className={`ml-2 p-1 rounded ${
                          watchlist.includes(crypto.id) ? 'text-yellow-400' : 'text-slate-400 hover:text-yellow-400'
                        }`}
                      >
                        <Star size={16} fill={watchlist.includes(crypto.id) ? 'currentColor' : 'none'} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Charts and Analysis */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tab Navigation */}
            <div className="flex gap-2 bg-slate-800/50 rounded-lg p-1">
              {[
                { id: 'overview', label: 'Overview', icon: Eye },
                { id: 'technical', label: 'Technical', icon: BarChart3 },
                { id: 'volume', label: 'Volume', icon: Activity }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    activeTab === tab.id
                      ? 'bg-blue-500 text-white'
                      : 'text-slate-400 hover:text-white hover:bg-slate-700'
                  }`}
                >
                  <tab.icon size={16} />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <PriceChart />
                {selectedCrypto && (
                  <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <DollarSign className="text-green-400" size={20} />
                      {selectedCrypto.name} Details
                    </h3>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="bg-slate-800/50 rounded-lg p-4">
                        <div className="text-sm text-slate-400 mb-1">Market Cap</div>
                        <div className="text-lg font-semibold text-green-400">
                          {formatMarketCap(selectedCrypto.market_cap)}
                        </div>
                      </div>
                      <div className="bg-slate-800/50 rounded-lg p-4">
                        <div className="text-sm text-slate-400 mb-1">24h Volume</div>
                        <div className="text-lg font-semibold text-blue-400">
                          {formatMarketCap(selectedCrypto.volume_24h)}
                        </div>
                      </div>
                      <div className="bg-slate-800/50 rounded-lg p-4">
                        <div className="text-sm text-slate-400 mb-1">Circulating Supply</div>
                        <div className="text-lg font-semibold text-purple-400">
                          {selectedCrypto.circulating_supply.toLocaleString()}
                        </div>
                      </div>
                      <div className="bg-slate-800/50 rounded-lg p-4">
                        <div className="text-sm text-slate-400 mb-1">Total Supply</div>
                        <div className="text-lg font-semibold text-yellow-400">
                          {selectedCrypto.total_supply?.toLocaleString() || 'N/A'}
                        </div>
                      </div>
                      <div className="bg-slate-800/50 rounded-lg p-4">
                        <div className="text-sm text-slate-400 mb-1">Max Supply</div>
                        <div className="text-lg font-semibold text-red-400">
                          {selectedCrypto.max_supply?.toLocaleString() || '∞'}
                        </div>
                      </div>
                      <div className="bg-slate-800/50 rounded-lg p-4">
                        <div className="text-sm text-slate-400 mb-1">Market Rank</div>
                        <div className="text-lg font-semibold text-indigo-400">
                          #{selectedCrypto.market_cap_rank}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'technical' && (
              <div className="space-y-6">
                <PriceChart />
                <TechnicalAnalysisPanel />
              </div>
            )}

            {activeTab === 'volume' && (
              <div className="space-y-6">
                <VolumeChart />
                <TechnicalAnalysisPanel />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CryptoTracker;