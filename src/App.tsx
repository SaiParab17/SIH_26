import React, { useState, Component, type ReactNode } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { CollectionSetupPage } from './pages/CollectionSetupPage';
import { CollectionStatusPage } from './pages/CollectionStatusPage';
import { SentimentPage } from './pages/SentimentPage';
import { AudiencePage } from './pages/AudiencePage';
import { TopicExplorerPage } from './pages/TopicExplorerPage';
import { TrendsPage } from './pages/TrendsPage';
import { NetworkPage } from './pages/NetworkPage';
import { CrossPlatformPage } from './pages/CrossPlatformPage';
import { EvidenceVaultPage } from './pages/EvidenceVaultPage';
import { AIAnalystPage } from './pages/AIAnalystPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';

// ---------------------------------------------------------------------------
// Error Boundary — prevents blank white screen on any render-time exception
// ---------------------------------------------------------------------------

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<{ children: ReactNode; onReset?: () => void }, ErrorBoundaryState> {
  constructor(props: { children: ReactNode; onReset?: () => void }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[SocialScope] Page render error:', error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex-1 flex items-center justify-center min-h-[60vh]">
          <div className="max-w-lg w-full bg-[#FDF9F0] border border-[#C15D5D]/30 rounded-xl p-8 text-center shadow-md">
            <div className="w-12 h-12 rounded-full bg-[#C15D5D]/10 flex items-center justify-center mx-auto mb-4">
              <span className="text-[#C15D5D] text-2xl">⚠</span>
            </div>
            <h2 className="font-heading font-bold text-lg text-[#171717] mb-2">Page Render Error</h2>
            <p className="text-xs text-[#6E6A62] font-mono mb-1">{this.state.error?.message || 'An unexpected error occurred.'}</p>
            <p className="text-xs text-[#6E6A62] mb-6">This is likely a temporary issue. Try navigating back or reloading.</p>
            <button
              onClick={this.handleReset}
              className="clay-button text-sm px-5 py-2"
            >
              ↩ Go Back
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// ---------------------------------------------------------------------------
// Main App
// ---------------------------------------------------------------------------

export function App() {
  const [activeTab, setActiveTab] = useState<string>('landing');

  // If on public portal / landing page, render standalone view
  if (activeTab === 'landing') {
    return (
      <LandingPage
        onStartAnalysis={() => setActiveTab('collect')}
        onExploreDashboard={() => setActiveTab('dashboard')}
      />
    );
  }

  const renderActivePage = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardPage onNavigate={(tab) => setActiveTab(tab)} />;
      case 'collect':
        return <CollectionSetupPage onStartCollection={() => setActiveTab('status')} />;
      case 'status':
        return <CollectionStatusPage onProceedToDashboard={() => setActiveTab('dashboard')} />;
      case 'sentiment':
        return <SentimentPage />;
      case 'audience':
        return <AudiencePage />;
      case 'topics':
        return <TopicExplorerPage />;
      case 'trends':
        return <TrendsPage />;
      case 'network':
        return <NetworkPage />;
      case 'platforms':
        return <CrossPlatformPage />;
      case 'evidence':
        return <EvidenceVaultPage />;
      case 'ai-analyst':
        return <AIAnalystPage />;
      case 'reports':
        return <ReportsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardPage onNavigate={(tab) => setActiveTab(tab)} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F5F3EE] text-[#171717] font-sans antialiased">
      {/* Global Sidebar Navigation */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          activeTab={activeTab}
          onOpenCollect={() => setActiveTab('collect')}
          onOpenReport={() => setActiveTab('reports')}
        />
        <main className="flex-1 p-8 overflow-y-auto">
          <ErrorBoundary onReset={() => setActiveTab('dashboard')}>
            {renderActivePage()}
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}

export default App;
