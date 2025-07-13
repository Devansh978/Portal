import { Switch, Route, Redirect } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { GlassNavbar } from "@/components/layout/GlassNavbar";
import { GlassBackground } from "@/components/layout/GlassBackground";
import { NewsletterModal, useNewsletterModal } from "@/components/ui/newsletter-modal";

// Pages
import  Dashboard from "@/pages/Dashboard";
import  LeadManagementPage  from "@/pages/LeadManagement";
import  UserManagement  from "@/pages/UserManagement";
import   AuditLogs  from "@/pages/AuditLogs";
import { Tracking } from "@/pages/Tracking";
import  Analytics  from "@/pages/Analytics";
import { Settings } from "@/pages/Settings";
import GlassLogin from "@/pages/GlassLogin";
import  Register  from "@/pages/Register";
import   NotFound  from "@/pages/not-found";
import { CRMIntegrationStatus } from "@/components/dashboard/CRMIntegrationStatus";
import { DocumentManager } from "@/components/dashboard/DocumentManager";
import BuilderDashboard from "@/pages/BuilderDashboard";
import SimplifiedBuilderDashboard from "@/pages/SimplifiedBuilderDashboard";
import TelecallerDashboard from "@/pages/TelecallerDashboard";
import AdminDashboard from "@/pages/AdminDashboard";
import BrokerDashboard from "@/pages/BrokerDashboard";
import CADashboard from "@/pages/CADashboard";
import TelecallerPortal from "@/pages/TelecallerPortal";
import UserDashboard from "@/pages/UserDashboard";
import DocumentManagement from "@/pages/DocumentManagement";
import TelecallerManagement from "@/pages/TelecallerManagement";
import BankManagement from "@/pages/BankManagement";
import NotificationCenter from "@/pages/NotificationCenter";
import AssignmentManagement from "@/pages/AssignmentManagement";
import { RoleBasedRedirect } from "@/components/auth/RoleBasedRedirect";
import { NotificationManager } from "@/components/ui/animated-notification";

// Layout components
import { Layout, Sidebar, Content } from "@/components/ui/layout";
import { Sidebar as DashboardSidebar } from "@/components/dashboard/Sidebar";
import { ChatbotWidget } from "@/components/dashboard/ChatbotWidget";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const { isNewsletterOpen, closeNewsletter } = useNewsletterModal();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <GlassBackground />
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/login" />;
  }

  return (
    <>
      <GlassBackground />
      <GlassNavbar />
      <div className="pt-16 min-h-screen custom-scrollbar">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </div>
      <ChatbotWidget />
      <NewsletterModal isOpen={isNewsletterOpen} onClose={closeNewsletter} />
    </>
  );
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-cred-mint"></div>
      </div>
    );
  }

  if (user) {
    return <Redirect to="/dashboard" />;
  }

  return <>{children}</>;
}

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/login">
        <PublicRoute>
          <GlassLogin />
        </PublicRoute>
      </Route>

      <Route path="/register">
        <PublicRoute>
          <Register />
        </PublicRoute>
      </Route>

      {/* Protected routes */}
      <Route path="/dashboard">
        <ProtectedRoute>
          <RoleBasedRedirect />
        </ProtectedRoute>
      </Route>

      <Route path="/leads">
        <ProtectedRoute>
          <LeadManagementPage />
        </ProtectedRoute>
      </Route>

      <Route path="/tracking">
        <ProtectedRoute>
          <Tracking />
        </ProtectedRoute>
      </Route>

      <Route path="/timeline">
        <ProtectedRoute>
          <Tracking />
        </ProtectedRoute>
        </Route>

      <Route path="/analytics">
        <ProtectedRoute>
          <Analytics />
        </ProtectedRoute>
      </Route>

      <Route path="/documents">
        <ProtectedRoute>
          <DocumentManager />
        </ProtectedRoute>
      </Route>

      <Route path="/builder">
        <ProtectedRoute>
          <SimplifiedBuilderDashboard />
        </ProtectedRoute>
      </Route>

      <Route path="/builder-dashboard">
        <ProtectedRoute>
          <BuilderDashboard />
        </ProtectedRoute>
      </Route>

      <Route path="/telecaller">
        <ProtectedRoute>
          <TelecallerDashboard />
        </ProtectedRoute>
      </Route>

      <Route path="/admin">
        <ProtectedRoute>
          <AdminDashboard />
        </ProtectedRoute>
      </Route>

      <Route path="/broker">
        <ProtectedRoute>
          <BrokerDashboard />
        </ProtectedRoute>
      </Route>

      <Route path="/ca">
        <ProtectedRoute>
          <CADashboard />
        </ProtectedRoute>
      </Route>

      <Route path="/leads">
        <ProtectedRoute>
          <LeadManagementPage />
        </ProtectedRoute>
      </Route>

      <Route path="/users">
        <ProtectedRoute>
          <UserManagement />
        </ProtectedRoute>
      </Route>

      <Route path="/user">
        <ProtectedRoute>
          <UserDashboard />
        </ProtectedRoute>
      </Route>

      <Route path="/documents">
        <ProtectedRoute>
          <DocumentManagement />
        </ProtectedRoute>
      </Route>

      <Route path="/telecaller-management">
        <ProtectedRoute>
          <TelecallerManagement />
        </ProtectedRoute>
      </Route>

      <Route path="/banks">
        <ProtectedRoute>
          <BankManagement />
        </ProtectedRoute>
      </Route>

      <Route path="/notifications">
        <ProtectedRoute>
          <NotificationCenter />
        </ProtectedRoute>
      </Route>

      <Route path="/assignments">
        <ProtectedRoute>
          <AssignmentManagement />
        </ProtectedRoute>
      </Route>

      <Route path="/audit-logs">
        <ProtectedRoute>
          <AuditLogs />
        </ProtectedRoute>
      </Route>

      <Route path="/crm-integration">
        <ProtectedRoute>
          <CRMIntegrationStatus />
        </ProtectedRoute>
      </Route>

      <Route path="/settings">
        <ProtectedRoute>
          <Settings />
        </ProtectedRoute>
      </Route>

      {/* Redirect root to dashboard */}
      <Route path="/">
        <Redirect to="/dashboard" />
      </Route>

      {/* 404 fallback */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <NotificationManager />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;