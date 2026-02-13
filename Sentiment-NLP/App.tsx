
import React, { useState, useMemo, useEffect } from 'react';
import { analyzeSentiment } from './services/geminiService';
import { AnalysisRecord, DashboardStats, SentimentType } from './types';
import SentimentChart from './components/SentimentChart';
import HistoryTable from './components/HistoryTable';

const App: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [records, setRecords] = useState<AnalysisRecord[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('sentiment_history');
    if (saved) {
      try {
        setRecords(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  // Save to localStorage when records change
  useEffect(() => {
    localStorage.setItem('sentiment_history', JSON.stringify(records));
  }, [records]);

  const stats = useMemo<DashboardStats>(() => {
    const total = records.length;
    if (total === 0) return { positive: 0, negative: 0, neutral: 0, total: 0, averageConfidence: 0 };

    const positive = records.filter(r => r.sentiment === SentimentType.POSITIVE).length;
    const negative = records.filter(r => r.sentiment === SentimentType.NEGATIVE).length;
    const neutral = records.filter(r => r.sentiment === SentimentType.NEUTRAL).length;
    const averageConfidence = records.reduce((acc, r) => acc + r.confidence, 0) / total;

    return { positive, negative, neutral, total, averageConfidence };
  }, [records]);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isAnalyzing) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      const result = await analyzeSentiment(inputText);
      const newRecord: AnalysisRecord = {
        ...result,
        id: crypto.randomUUID(),
        text: inputText,
        timestamp: Date.now(),
      };
      setRecords(prev => [newRecord, ...prev]);
      setInputText('');
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDeleteRecord = (id: string) => {
    setRecords(prev => prev.filter(r => r.id !== id));
  };

  const handleClearAll = () => {
    if (confirm('Are you sure you want to clear all analysis history?')) {
      setRecords([]);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-12">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 p-2 rounded-lg">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                SentimentPro NLP
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-slate-500 hidden sm:inline">Powered by Gemini AI</span>
              {records.length > 0 && (
                <button 
                  onClick={handleClearAll}
                  className="text-sm text-rose-600 hover:text-rose-700 font-semibold px-3 py-1 transition-colors"
                >
                  Clear History
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <header className="mb-10 text-center sm:text-left">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
            Sentiment Analysis Tool
          </h2>
          <p className="text-lg text-slate-600">
            Paste a review or any text to classify it as positive, negative, or neutral.
          </p>
        </header>

        {/* Hero Section: Input and Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Main Input Area */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <form onSubmit={handleAnalyze} className="space-y-4">
                <div className="relative">
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Enter customer review, social media post, or feedback here..."
                    className="w-full min-h-[180px] p-4 text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                    required
                  />
                  {inputText.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setInputText('')}
                      className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
                
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="text-xs text-slate-400">
                    Press <kbd className="px-1 py-0.5 bg-slate-100 border rounded">Cmd + Enter</kbd> to analyze
                  </div>
                  <button
                    type="submit"
                    disabled={isAnalyzing || !inputText.trim()}
                    className={`w-full sm:w-auto px-8 py-3 rounded-xl font-bold text-white shadow-lg transition-all transform active:scale-95 flex items-center justify-center gap-2 ${
                      isAnalyzing || !inputText.trim() 
                        ? 'bg-slate-300 cursor-not-allowed shadow-none' 
                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                    }`}
                  >
                    {isAnalyzing ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Analyzing...
                      </>
                    ) : (
                      <>
                        Analyze Sentiment
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </>
                    )}
                  </button>
                </div>
              </form>
              
              {error && (
                <div className="mt-4 p-4 bg-rose-50 border border-rose-100 text-rose-700 rounded-lg text-sm flex items-center gap-3">
                  <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              )}
            </div>

            {/* Quick Tips / Info */}
            <div className="bg-blue-50/50 border border-blue-100 p-6 rounded-2xl flex items-start gap-4">
              <div className="bg-blue-600 p-2 rounded-lg text-white">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h4 className="text-blue-900 font-bold mb-1">Advanced NLP Logic</h4>
                <p className="text-sm text-blue-700 leading-relaxed">
                  Our system goes beyond simple keyword matching. It understands context, sarcasm, and complex sentence structures to provide high-accuracy sentiment scores.
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar Stats */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Current Session Stats</h3>
              <div className="space-y-6">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-3xl font-extrabold text-slate-900">{stats.total}</p>
                    <p className="text-sm font-medium text-slate-500">Total Analyzed</p>
                  </div>
                  <div className="h-12 w-12 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-50">
                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1 uppercase tracking-tighter">
                      <span className="text-emerald-600">Positive</span>
                      <span className="text-slate-400">{stats.positive}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-emerald-500 h-full transition-all duration-700" 
                        style={{ width: `${stats.total ? (stats.positive / stats.total) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1 uppercase tracking-tighter">
                      <span className="text-slate-600">Neutral</span>
                      <span className="text-slate-400">{stats.neutral}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-slate-400 h-full transition-all duration-700" 
                        style={{ width: `${stats.total ? (stats.neutral / stats.total) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1 uppercase tracking-tighter">
                      <span className="text-rose-600">Negative</span>
                      <span className="text-slate-400">{stats.negative}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-rose-500 h-full transition-all duration-700" 
                        style={{ width: `${stats.total ? (stats.negative / stats.total) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-50 text-center">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Avg Confidence</p>
                  <p className="text-2xl font-black text-blue-600">
                    {(stats.averageConfidence * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Section */}
        {records.length > 0 ? (
          <>
            <SentimentChart stats={stats} />
            <HistoryTable records={records} onDelete={handleDeleteRecord} />
          </>
        ) : (
          <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200">
            <div className="inline-block p-4 bg-slate-50 rounded-full mb-4">
              <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-700">No data analyzed yet</h3>
            <p className="text-slate-500 max-w-xs mx-auto">Analyze some text above to see the sentiment distribution and history here.</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-12 py-8 border-t border-slate-200">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-sm text-slate-400 flex items-center justify-center gap-1">
            Made with <span className="text-rose-500">♥</span> for NLP Enthusiasts • Using Gemini 3 Flash
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
