export default function DashboardPage() {
  return (
    <main style={{ padding: "20px", fontFamily: "sans-serif", color: "white", backgroundColor: "#0A0A0A", minHeight: "100vh" }}>
      <h1>Test: Root Page Loaded</h1>
      <p>If you see this, the basic routing to frontend/app/page.tsx is working.</p>
      <p>The previous 404 error might be related to components used in the original page.tsx (Header or EmptyDashboard) or their children, possibly during server-side rendering.</p>
    </main>
  );
}
