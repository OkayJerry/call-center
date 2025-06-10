'use client';

import type { Call } from '@/app/dashboard/page'; // Import the main Call type

interface CallDetailModalProps {
  call: Call;
  onClose: () => void;
}

// --- Icon Components ---
const AgentIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
  </svg>
);

const CallerIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);


// --- Main Component ---

export default function CallDetailModal({ call, onClose }: CallDetailModalProps) {
  // Helper to get count of keys in an object
  const getObjectKeyCount = (obj: object) => Object.keys(obj).length;

  return (
    // Main container for the modal
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      
      {/* Modal content panel */}
      <div 
        className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">Call Details</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-grow overflow-y-auto">
          {/* Summary Section */}
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Summary</h3>
            <p className="text-sm text-gray-600">{call.analysis.transcript_summary}</p>
          </div>

          {/* Transcript Section */}
          <div className="p-6 bg-gray-50 border-t border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Transcript</h3>
            <div className="space-y-6">
              {call.transcript.map((entry, index) => {
                if (!entry.message) return null;
                if (entry.role === 'agent') {
                  const latency = entry.conversation_turn_metrics?.metrics?.convai_llm_service_ttfb?.elapsed_time;
                  return (
                    <div key={index} className="flex items-start gap-3">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center">
                        <AgentIcon />
                      </div>
                      <div className="flex flex-col items-start">
                        <div className="bg-gray-200 rounded-lg p-3 max-w-md">
                          <p className="text-sm text-gray-800">{entry.message}</p>
                        </div>
                        {latency && (
                          <p className="mt-1 text-xs text-gray-400">LLM {(latency * 1000).toFixed(0)}ms</p>
                        )}
                      </div>
                    </div>
                  );
                }
                if (entry.role === 'user') {
                  return (
                    <div key={index} className="flex items-start gap-3 justify-end">
                      <div className="bg-blue-500 rounded-lg p-3 max-w-md">
                        <p className="text-sm text-white">{entry.message}</p>
                      </div>
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center">
                        <CallerIcon />
                      </div>
                    </div>
                  );
                }
                return null;
              })}
            </div>
          </div>
          
          {/* Analysis Section */}
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Analysis</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="bg-gray-100 p-3 rounded-md">
                <p className="font-medium text-gray-600">Call Outcome</p>
                <p className={`capitalize font-semibold ${
                  call.analysis.call_successful === 'success' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {call.analysis.call_successful}
                </p>
              </div>
              <div className="bg-gray-100 p-3 rounded-md">
                <p className="font-medium text-gray-600">Data Collection</p>
                <p className="font-semibold text-gray-800">{getObjectKeyCount(call.analysis.data_collection_results)} results found</p>
              </div>
              <div className="bg-gray-100 p-3 rounded-md sm:col-span-2">
                <p className="font-medium text-gray-600">Evaluation Criteria</p>
                <p className="font-semibold text-gray-800">{getObjectKeyCount(call.analysis.evaluation_criteria_results)} criteria met</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
