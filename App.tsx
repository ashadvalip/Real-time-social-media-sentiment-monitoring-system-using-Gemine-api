import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Activity,
  BarChart3,
  MessageSquare,
  AlertCircle,
  Play,
  Square,
  RefreshCw,
  Search
} from 'lucide-react';

import { fetchSimulatedBatch } from './services/gemini';
import { SocialPost, SentimentLabel, SentimentStats, ChartDataPoint } from './types';

import { StatCard } from './components/StatCard';
import { LiveFeed } from './components/LiveFeed';
import { Dashboard } from './components/Dashboard';

const MAX_POST_HISTORY = 50;

const App: React.FC = () => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [topic, setTopic] = useState('Cyberpunk 2077');
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [stats, setStats] = useState<SentimentStats>({
    total: 0,
    positive: 0,
    negative: 0,
    neutral: 0,
    averageScore: 0
  });

  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);

  const incomingBuffer = useRef<SocialPost[]>([]);

  // --------------------------------------------------------
  // Handle new batch
  // --------------------------------------------------------
  const handleNewBatch = useCallback((batch: SocialPost[]) => {
    if (!batch || batch.length === 0) return;

    incomingBuffer.current = [...incomingBuffer.current, ...batch];

    if (isLoading) setIsLoading(false);
  }, [isLoading]);

  // --------------------------------------------------------
  // Fetch Loop
  // --------------------------------------------------------
  useEffect(() => {
    if (!isStreaming) return;

    let isActive = true;
    let intervalId: any;

    const fetchData = async () => {
      try {
        const batch = await fetchSimulatedBatch(topic);

        if (!isActive) return;

        if (batch.length === 0) {
          console.warn("⚠ Gemini returned an empty array.");
          return;
        }

        handleNewBatch(batch);
        setError(null);

      } catch (err: any) {
        console.error("❌ Fetch Error:", err);

        let msg = "Failed to fetch data stream.";
        if (err.message && err.message.includes("API")) {
          msg = "API request failed — check your API key or network.";
        }

        setError(msg);
        setIsStreaming(false);
        setIsLoading(false);
      }
    };

    // Initial run
    setIsLoading(true);
    fetchData();

    // Continuous streaming
    intervalId = setInterval(fetchData, 4000);

    return () => {
      isActive = false;
      clearInterval(intervalId);
    };
  }, [isStreaming, topic, handleNewBatch]);

  // --------------------------------------------------------
  // Buffer Drain Loop — animate feed
  // --------------------------------------------------------
  useEffect(() => {
    if (!isStreaming) return;

    const interval = setInterval(() => {
      if (incomingBuffer.current.length === 0) return;

      const nextPost = incomingBuffer.current.shift();
      if (!nextPost) return;

      setPosts(prev => [nextPost, ...prev].slice(0, MAX_POST_HISTORY));

      // Update Stats
      setStats(prev => {
        const total = prev.total + 1;
        const positive = prev.positive + (nextPost.sentimentLabel === SentimentLabel.POSITIVE ? 1 : 0);
        const negative = prev.negative + (nextPost.sentimentLabel === SentimentLabel.NEGATIVE ? 1 : 0);
        const neutral = prev.neutral + (nextPost.sentimentLabel === SentimentLabel.NEUTRAL ? 1 : 0);

        const averageScore = ((prev.averageScore * prev.total) + nextPost.sentimentScore) / total;

        return {
          total,
          positive,
          negative,
          neutral,
          averageScore
        };
      });

      // Update Chart
      setChartData(prev => {
        const now = new Date().toLocaleTimeString([], {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit"
        });

        const point = {
          time: now,
          score: nextPost.sentimentScore,
          volume: 1,
        };

        return [...prev, point].slice(-20);
      });

    }, 700);

    return () => clearInterval(interval);
  }, [isStreaming]);

  // --------------------------------------------------------
  // Handlers
  // --------------------------------------------------------
  const toggleStream = () => {
    if (!isStreaming) {
      incomingBuffer.current = [];
      setError(null);
    }
    setIsStreaming(!isStreaming);
  };

  const resetData = () => {
    setIsStreaming(false);
    setIsLoading(false);
    incomingBuffer.current = [];
    setPosts([]);
    setStats({ total: 0, positive: 0, negative: 0, neutral: 0, averageScore: 0 });
    setChartData([]);
    setError(null);
  };

  // --------------------------------------------------------
  // UI
  // --------------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans">

      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">

          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-lg">
              <Activity size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">PulseStream AI</h1>
              <p className="text-xs text-slate-400">Real-time Sentiment Monitoring</p>
            </div>
          </div>

          <div className="flex items-center gap-4">

            <div className="hidden md:flex items-center bg-slate-800 rounded-lg border border-slate-700 px-3 py-1.5">
              <Search size={16} className="text-slate-500 mr-2" />
              <input
                type="text"
                value={topic}
                onChange={e => setTopic(e.target.value)}
                className="bg-transparent outline-none text-sm text-slate-200 w-48"
              />
            </div>

            <button
              onClick={toggleStream}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isStreaming
                  ? 'bg-rose-500/10 text-rose-400 border border-rose-500/50'
                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/50'
              }`}
            >
              {isStreaming ? <><Square size={16} /> Stop Stream</> : <><Play size={16} /> Start Monitor</>}
            </button>

            <button
              onClick={resetData}
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg"
            >
              <RefreshCw size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="max-w-7xl mx-auto px-4 py-8">

        {/* Errors */}
        {error && (
          <div className="mb-6 bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl flex items-center gap-3">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {/* Dashboard */}
        <Dashboard chartData={chartData} stats={stats} isLoading={isLoading} />

        {/* Live Feed */}
        <div className="mt-10 bg-slate-800 border border-slate-700 rounded-xl h-[600px] shadow-xl overflow-hidden">
          <div className="p-4 border-b border-slate-700 bg-slate-900/50">
            <h3 className="text-slate-200 font-semibold">Live Incoming Feed</h3>
          </div>
          <div className="h-[520px] overflow-y-auto p-4 custom-scrollbar">
            <LiveFeed posts={posts} isLoading={isLoading} />
          </div>
        </div>

      </main>
    </div>
  );
};

export default App;
