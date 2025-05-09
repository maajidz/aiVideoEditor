import EmptyDashboard from "@/components/EmptyDashboard";
import Header from "@/components/Header";

export default function DashboardPage() {
  return (
    <main className="flex-1 overflow-y-auto bg-slate-950">
      <Header />
      <EmptyDashboard />
      </main>
  );
}