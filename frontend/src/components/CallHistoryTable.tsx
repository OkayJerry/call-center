'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import type { Call } from '@/app/dashboard/page'; // Import the main Call type

interface CallHistoryTableProps {
  onCallSelect: (call: Call) => void;
}

type SortableKey = 'startTime' | 'durationSecs';

export default function CallHistoryTable({ onCallSelect }: CallHistoryTableProps) {
  const { user } = useAuth();
  const [calls, setCalls] = useState<Call[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: SortableKey; direction: 'ascending' | 'descending' }>({
    key: 'startTime',
    direction: 'descending',
  });

  useEffect(() => {
    const fetchCalls = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }
      try {
        const idToken = await user.getIdToken();
        const response = await fetch('http://localhost:8081/me/calls', {
          headers: {
            'Authorization': `Bearer ${idToken}`,
          },
        });
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to fetch call history.');
        }
        const data: Call[] = await response.json();
        setCalls(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCalls();
  }, [user]);

  const sortedCalls = useMemo(() => {
    let sortableItems = [...calls];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        let aValue: number;
        let bValue: number;
        
        if (sortConfig.key === 'startTime') {
          aValue = a.metadata.start_time_unix_secs;
          bValue = b.metadata.start_time_unix_secs;
        } else {
          aValue = a.metadata.call_duration_secs;
          bValue = b.metadata.call_duration_secs;
        }
        
        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [calls, sortConfig]);

  const requestSort = (key: SortableKey) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIndicator = (key: SortableKey) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'ascending' ? '▲' : '▼';
  };

  if (isLoading) return <p className="text-center text-gray-500 py-8">Loading call history...</p>;
  if (error) return <p className="text-center text-red-500 py-8">Error: {error}</p>;
  if (calls.length === 0) {
    return (
      <div className="text-center bg-white border border-gray-200 rounded-lg py-12">
        <p className="text-lg text-gray-500">No call history found.</p>
        <p className="text-sm text-gray-400 mt-2">Make your first call to see data here.</p>
      </div>
    );
  }

  return (
    <div className="mt-4 overflow-x-auto">
      <div className="inline-block min-w-full align-middle">
        <div className="overflow-hidden border border-gray-200 rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Caller</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => requestSort('startTime')}>
                  Date {getSortIndicator('startTime')}
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => requestSort('durationSecs')}>
                  Duration {getSortIndicator('durationSecs')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedCalls.map((call) => (
                <tr key={call.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => onCallSelect(call)}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{call.metadata.phone_call.external_number}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(call.metadata.start_time_unix_secs * 1000).toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{call.metadata.call_duration_secs}s</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
