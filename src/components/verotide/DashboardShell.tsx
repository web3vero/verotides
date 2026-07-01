import VeroDashboard from './VeroDashboard';
import IntelCrawler from './IntelCrawler';

export default function DashboardShell() {
  return (
    <>
      <IntelCrawler />
      <section className="flex-1 overflow-x-hidden">
        <VeroDashboard />
      </section>
    </>
  );
}
