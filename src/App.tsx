import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { BlockedUserBanner } from './components/common/BlockedUserBanner';
import { BlockedUserScreen } from './components/common/BlockedUserScreen';
import { OverviewDashboard } from './components/dashboard/OverviewDashboard';
import { CampaignList } from './components/campaigns/CampaignList';
import { NewCampaignModal } from './components/campaigns/NewCampaignModal';
import { LiveCampaignRunnerModal } from './components/campaigns/LiveCampaignRunnerModal';
import { ContactManagement } from './components/contacts/ContactManagement';
import { TemplateManagement } from './components/templates/TemplateManagement';
import { AnalyticsReports } from './components/analytics/AnalyticsReports';
import { BillingSubscriptions } from './components/billing/BillingSubscriptions';
import { AdminUserControl } from './components/admin/AdminUserControl';
import { PaymentGatewayModal } from './components/billing/PaymentGatewayModal';
import { YapePlinCheckoutModal } from './components/billing/YapePlinCheckoutModal';
import { MetaApiConfigModal } from './components/settings/MetaApiConfigModal';
import { NotificationDrawer } from './components/notifications/NotificationDrawer';
import { LoginView } from './components/auth/LoginView';

const MainLayout: React.FC = () => {
  const { isSuperAdmin, currentUser } = useApp();
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Modals state
  const [showNewCampaignModal, setShowNewCampaignModal] = useState<boolean>(false);
  const [runnerCampaignId, setRunnerCampaignId] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
  const [showYapePlinModal, setShowYapePlinModal] = useState<boolean>(false);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [showNotificationDrawer, setShowNotificationDrawer] = useState<boolean>(false);

  const isUserBlocked = !isSuperAdmin && currentUser.status === 'suspended_unpaid';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased selection:bg-emerald-500 selection:text-white">
      {/* 3-Zone Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSettings={() => setShowSettingsModal(true)}
        onOpenNotifications={() => setShowNotificationDrawer(true)}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar & Mobile Bottom Bar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenSettings={() => setShowSettingsModal(true)}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8 max-w-7xl mx-auto w-full">
          {/* If user is completely restricted due to overdue payment */}
          {isUserBlocked ? (
            <BlockedUserScreen
              onOpenPayment={() => setShowPaymentModal(true)}
              onOpenYapePlin={() => setShowYapePlinModal(true)}
            />
          ) : (
            <>
              {/* Tab Views */}
              {activeTab === 'dashboard' && (
                <OverviewDashboard
                  onNewCampaign={() => setShowNewCampaignModal(true)}
                  onNavigateTab={(tab) => setActiveTab(tab)}
                  onOpenSettings={() => setShowSettingsModal(true)}
                />
              )}

              {activeTab === 'campaigns' && (
                <CampaignList
                  onNewCampaign={() => setShowNewCampaignModal(true)}
                  onOpenRunner={(id) => setRunnerCampaignId(id)}
                  onNavigateAnalytics={() => setActiveTab('analytics')}
                />
              )}

              {activeTab === 'contacts' && <ContactManagement />}

              {activeTab === 'templates' && <TemplateManagement />}

              {activeTab === 'analytics' && <AnalyticsReports />}

              {activeTab === 'billing' && <BillingSubscriptions />}

              {activeTab === 'admin' && isSuperAdmin && <AdminUserControl />}
            </>
          )}
        </main>
      </div>

      {/* Global Modals */}
      <NewCampaignModal
        isOpen={showNewCampaignModal}
        onClose={() => setShowNewCampaignModal(false)}
        onLaunchSuccess={(campaignId) => setRunnerCampaignId(campaignId)}
      />

      <LiveCampaignRunnerModal
        campaignId={runnerCampaignId}
        onClose={() => setRunnerCampaignId(null)}
      />

      <PaymentGatewayModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
      />

      <YapePlinCheckoutModal
        isOpen={showYapePlinModal}
        onClose={() => setShowYapePlinModal(false)}
      />

      <MetaApiConfigModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
      />

      <NotificationDrawer
        isOpen={showNotificationDrawer}
        onClose={() => setShowNotificationDrawer(false)}
        onOpenPayment={() => setShowPaymentModal(true)}
      />
    </div>
  );
};

const AppContent: React.FC = () => {
  const { isAuthenticated } = useApp();

  if (!isAuthenticated) {
    return <LoginView />;
  }

  return <MainLayout />;
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
