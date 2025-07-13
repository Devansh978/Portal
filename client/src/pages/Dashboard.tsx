import { useQuery } from "@tanstack/react-query";
import { useState, useEffect, useRef } from "react";
import { Header } from "@/components/dashboard/Header";
import { GlassMetricsGrid } from "@/components/dashboard/GlassMetricsGrid";
import { RealTimeIndicator } from "@/components/ui/real-time-indicator";
import { GlassRecentLeadsTable } from "@/components/dashboard/GlassRecentLeadsTable";
import { TimelineActivity } from "@/components/dashboard/TimelineActivity";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { CRMIntegrationStatus } from "@/components/dashboard/CRMIntegrationStatus";
import { LeadManagementModal } from "@/components/leads/LeadManagementModal";
import { ChatbotWidget } from "@/components/dashboard/ChatbotWidget";
import { Main } from "@/components/ui/layout";
import { Card, CardContent } from "@/components/ui/card";
import { DashboardMetrics, Lead, CreateLeadForm } from "@/lib/types";
import { authenticatedFetch } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [isCreatingLead, setIsCreatingLead] = useState(false);
  const [previousMetrics, setPreviousMetrics] = useState<DashboardMetrics | undefined>();
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const { toast } = useToast();

  // Fetch dashboard metrics with real-time polling
  const { data: metrics, isLoading: metricsLoading, isFetching: metricsRefreshing } = useQuery<DashboardMetrics>({
    queryKey: ["/api/dashboard/metrics"],
    queryFn: async () => {
      const response = await authenticatedFetch("/api/dashboard/metrics");
      setLastUpdate(new Date());
      return response.json();
    },
    refetchInterval: 30000, // Refresh every 30 seconds
    refetchOnWindowFocus: true,
  });

  // Track previous metrics for animation
  useEffect(() => {
    if (metrics && JSON.stringify(metrics) !== JSON.stringify(previousMetrics)) {
      setPreviousMetrics(previousMetrics || metrics);
    }
  }, [metrics]);

  // Fetch recent leads with real-time polling
  const { data: leadsData, isLoading: leadsLoading, refetch: refetchLeads } = useQuery<{
    leads: Lead[];
    total: number;
  }>({
    queryKey: ["/api/leads", { page: 1, limit: 5 }],
    queryFn: async () => {
      const response = await authenticatedFetch("/api/leads?page=1&limit=5");
      return response.json();
    },
    refetchInterval: 30000, // Refresh every 30 seconds
    refetchOnWindowFocus: true,
  });

  const handleCreateLead = async (data: CreateLeadForm) => {
    setIsCreatingLead(true);
    try {
      const response = await authenticatedFetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast({
          title: "Lead created successfully",
          description: `Lead for ${data.firstName} ${data.lastName} has been created.`,
        });
        setIsLeadModalOpen(false);
        refetchLeads();
      } else {
        throw new Error("Failed to create lead");
      }
    } catch (error) {
      toast({
        title: "Error creating lead",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsCreatingLead(false);
    }
  };

  const handleViewLead = (leadId: number) => {
    // Navigate to lead details - would be implemented with proper routing
    console.log("View lead:", leadId);
  };

  const handleEditLead = (leadId: number) => {
    // Open edit modal - would be implemented with lead data loading
    console.log("Edit lead:", leadId);
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <Header
          title="Dashboard Overview"
          subtitle="Welcome back! Here's what's happening with your leads today."
        />
        <RealTimeIndicator
          isConnected={!metricsLoading}
          lastUpdate={lastUpdate}
          isRefreshing={metricsRefreshing}
        />
      </div>

      <Main>
        {/* Key Metrics */}
        <GlassMetricsGrid 
          metrics={metrics} 
          isLoading={metricsLoading} 
          previousMetrics={previousMetrics}
        />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Leads Table */}
          <GlassRecentLeadsTable
            leads={leadsData?.leads}
            isLoading={leadsLoading}
            onAddLead={() => setIsLeadModalOpen(true)}
            onViewLead={handleViewLead}
            onEditLead={handleEditLead}
          />

          {/* Right Sidebar Content */}
          <div className="space-y-6">
            <TimelineActivity />
            <QuickActions
              onAddLead={() => setIsLeadModalOpen(true)}
              onAssignLeads={() => console.log("Assign leads")}
              onExportReports={() => console.log("Export reports")}
              onWorkflowSettings={() => console.log("Workflow settings")}
            />
            <CRMIntegrationStatus />
          </div>
        </div>

        {/* Analytics Charts */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-cred-dark mb-4">
                Lead Conversion Funnel
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">New Leads</span>
                  <span className="text-sm font-medium">{metrics?.newLeads || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Under Review</span>
                  <span className="text-sm font-medium">{metrics?.pendingApprovals || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Approved</span>
                  <span className="text-sm font-medium text-cred-mint">{metrics?.conversions || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-cred-dark mb-4">
                System Overview
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Leads</span>
                  <span className="text-sm font-medium">{leadsData?.total || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Active Users</span>
                  <span className="text-sm font-medium">12</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">System Status</span>
                  <span className="text-sm font-medium text-green-600">Operational</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </Main>

      {/* Lead Management Modal */}
      <LeadManagementModal
        isOpen={isLeadModalOpen}
        onClose={() => setIsLeadModalOpen(false)}
        onSubmit={handleCreateLead}
        isLoading={isCreatingLead}
        mode="create"
      />

      {/* Customer Support Chatbot */}
      <ChatbotWidget />
    </>
  );
}
