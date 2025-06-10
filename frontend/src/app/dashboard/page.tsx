'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getAuth, signOut } from 'firebase/auth';
import firebase_app from '@/lib/firebase/config';

// Import components
import CallHistoryTable from '@/components/CallHistoryTable';
import StatCard from '@/components/StatCard';
import CallChart from '@/components/CallChart';
import CallDetailModal from '@/components/CallDetailModal'; 

const auth = getAuth(firebase_app);

// --- Strict Type Definitions for New Data Format ---
interface TranscriptEntry {
  role: 'agent' | 'user';
  message: string | null;
  conversation_turn_metrics?: { metrics?: any } | null;
}

interface Analysis {
  call_successful: 'success' | 'failure' | 'unknown';
  data_collection_results: object;
  evaluation_criteria_results: object;
  transcript_summary: string;
}

interface Metadata {
  start_time_unix_secs: number;
  call_duration_secs: number;
  phone_call: {
    external_number: string;
  };
}

export interface Call {
  id: string; // The conversation_id
  transcript: TranscriptEntry[];
  analysis: Analysis;
  metadata: Metadata;
}
// --- End of Type Definitions ---

interface ChartDataPoint {
  date: string;
  calls: number;
  duration: number;
}

type ActiveMetric = 'calls' | 'duration';
type TimeRange = 'last_day' | 'last_week' | 'last_month';

const timeRangeOptions: { label: string; value: TimeRange }[] = [
  { label: 'Last 24h', value: 'last_day' },
  { label: 'Last 7d', value: 'last_week' },
  { label: 'Last 30d', value: 'last_month' },
];

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [allCalls, setAllCalls] = useState<Call[]>([]);
  const [activeMetric, setActiveMetric] = useState<ActiveMetric>('calls');
  const [timeRange, setTimeRange] = useState<TimeRange>('last_month');
  const [selectedCall, setSelectedCall] = useState<Call | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/signin');
      return;
    }
    const fetchCalls = async () => {
      if (user) {
        const idToken = await user.getIdToken();
        const response = await fetch('http://localhost:8081/me/calls', {
          headers: { 'Authorization': `Bearer ${idToken}` },
        });
        if (response.ok) {
          const data = await response.json();
          setAllCalls(data);
        }
      }
    };
    fetchCalls();
  }, [user, loading, router]);

  const { totalCalls, avgDuration, chartData } = useMemo(() => {
    const now = new Date();
    const startDate = new Date();
    let timeUnit: 'hour' | 'day' = 'day';
    switch (timeRange) {
      case 'last_day':
        startDate.setDate(now.getDate() - 1);
        timeUnit = 'hour';
        break;
      case 'last_week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'last_month':
        startDate.setDate(now.getDate() - 30);
        break;
    }
    
    const filteredCalls = allCalls.filter(call => new Date(call.metadata.start_time_unix_secs * 1000) >= startDate);
    
    const total = filteredCalls.length;
    const totalDuration = filteredCalls.reduce((acc, call) => acc + call.metadata.call_duration_secs, 0);
    const avg = total > 0 ? (totalDuration / total).toFixed(0) : '0';

    const callsByTimeUnit = filteredCalls.reduce((acc, call) => {
      const callDate = new Date(call.metadata.start_time_unix_secs * 1000);
      let key: string;
      if (timeUnit === 'hour') {
        key = callDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric' });
      } else {
        key = callDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }
      if (!acc[key]) {
        acc[key] = { calls: 0, totalDuration: 0 };
      }
      acc[key].calls++;
      acc[key].totalDuration += call.metadata.call_duration_secs;
      return acc;
    }, {} as Record<string, { calls: number, totalDuration: number }>);

    const fullDateRange: ChartDataPoint[] = [];
    let loopDate = new Date(startDate);
    while(loopDate <= now) {
      let key: string;
      if (timeUnit === 'hour') {
        key = loopDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric' });
        loopDate.setHours(loopDate.getHours() + 1);
      } else {
        key = loopDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        loopDate.setDate(loopDate.getDate() + 1);
      }
      const data = callsByTimeUnit[key];
      fullDateRange.push({
        date: key,
        calls: data?.calls || 0,
        duration: data ? Math.round(data.totalDuration / data.calls) : 0,
      });
    }
    return { totalCalls: total, avgDuration: avg, chartData: fullDateRange };
  }, [allCalls, timeRange]);
  
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/signin');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) return <main className="flex min-h-screen flex-col items-center justify-center"><p>Loading...</p></main>;

  if (user) {
    return (
      <>
        <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="mt-1 text-sm text-gray-500">Welcome back, {user.email}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center p-1 bg-gray-200 rounded-lg">
                  {timeRangeOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setTimeRange(option.value)}
                      className={`px-3 py-1 text-sm font-medium rounded-md transition-colors duration-200 ${
                        timeRange === option.value
                          ? 'bg-white text-gray-800 shadow-sm'
                          : 'bg-transparent text-gray-600 hover:text-gray-800'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                <button onClick={handleSignOut} className="px-4 py-2 font-medium text-white bg-red-600 rounded-md hover:bg-red-700">
                  Sign Out
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <StatCard title="Number of calls" value={totalCalls.toString()} isActive={activeMetric === 'calls'} onClick={() => setActiveMetric('calls')} />
              <StatCard title="Average duration" value={`${avgDuration}s`} isActive={activeMetric === 'duration'} onClick={() => setActiveMetric('duration')} />
            </div>

            <CallChart data={chartData} metric={activeMetric} />

            <div className="mt-10">
              <h2 className="text-xl font-semibold text-gray-800">Recent Calls</h2>
              <CallHistoryTable onCallSelect={setSelectedCall} />
            </div>
          </div>
        </main>
        
        {selectedCall && (
          <CallDetailModal call={selectedCall} onClose={() => setSelectedCall(null)} />
        )}
      </>
    );
  }

  return null;
}
