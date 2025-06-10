import Link from 'next/link';

/**
 * The main landing page of the application.
 * It directs users to the sign-in page.
 */
export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 text-center">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">
          Welcome to the AI Call Center Platform
        </h1>
        <p className="text-lg text-gray-600">
          Manage your AI agents and review call analytics.
        </p>
        <div>
          <Link 
            href="/signin" 
            className="mt-6 inline-block rounded-md bg-indigo-600 px-6 py-3 text-lg font-semibold text-white shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Go to Sign In
          </Link>
        </div>
      </div>
    </main>
  );
}
