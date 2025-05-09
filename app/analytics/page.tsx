// Placeholder page for Analytics
import Header from '@/components/Header';
// import Sidebar from '@/components/Sidebar'; // Now in RootLayout

export default function AnalyticsPage() {
  return (
    // Outer div and Sidebar removed
    <main className="flex-1 overflow-y-auto bg-slate-950">
      <Header />
      <div className="p-6">
        <h1 className="text-2xl font-semibold text-white mb-4">Analytics</h1>
        <div className="bg-slate-900 p-6 rounded">
          <p className="text-slate-400">Detailed analytics dashboards will go here...</p>
          {/* TODO: Implement detailed analytics UI */}
        </div>
      </div>
    </main>
  );
} 