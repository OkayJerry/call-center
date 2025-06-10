'use client';

interface StatCardProps {
  title: string;
  value: string;
  isActive: boolean;
  onClick: () => void;
}

export default function StatCard({ title, value, isActive, onClick }: StatCardProps) {
  return (
    <div
      onClick={onClick}
      className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
        isActive
          ? 'bg-indigo-50 border-indigo-500 ring-2 ring-indigo-500'
          : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
      }`}
    >
      <div className="flex justify-between items-center">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        {isActive && (
          <svg className="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        )}
      </div>
      <p className="mt-1 text-3xl font-semibold text-gray-900">{value}</p>
    </div>
  );
}
