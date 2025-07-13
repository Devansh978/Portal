import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Building2, Users, Target, BarChart3, Plus, Search, Eye, Download, Trash2 } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { EnhancedRoleBasedNavbar } from "@/components/layout/EnhancedRoleBasedNavbar";
import * as RoleBasedNavbar from "@/components/layout/RoleBasedNavbar";
import { EnhancedCreateProjectDialog } from "@/components/dashboard/EnhancedCreateProjectDialog";
import { EnhancedAssignLeadDialog } from "@/components/dashboard/EnhancedAssignLeadDialog";
import {CreateTeam} from "@/components/dashboard/CreateTeam";
import { useAuth } from "@/hooks/useAuth";

// Simplified types for dashboard
interface DashboardProject {
  id: number;
  name: string;
  title: string;
  type: string;
  location: string;
  builder: string
  totalUnits: number;
  expectedRevenue: number;
  completionDate: string;
  status: string;
}

interface DashboardTelecaller {
  id: number;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  role: string;
  status: string;
  totalCalls: number;
}

interface DashboardLead {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  loanType: string;
  loanAmount: number;
  status: string;
}

export default function SimplifiedBuilderDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [showAssignLead, setShowAssignLead] = useState(false);
  // const [showCreateProject, setShowCreateProject] = useState(false);
  const [selectedLeads, setSelectedLeads] = useState<any[]>([]);
  const { toast } = useToast();
  const { user, logout } = useAuth();

  // Mock data for now - replace with real API calls when auth is fixed
  const mockProjects: DashboardProject[] = [
    { id: 1, name: "Luxury Heights", title: "Luxury Heights", location: "Gurgaon", status: "construction", totalUnits: 150, expectedRevenue: 50000000 },
    { id: 2, name: "Green Valley",  title: "Luxury Heights", location: "Noida", status: "planning", totalUnits: 80, expectedRevenue: 25000000 },
    { id: 3, name: "Sunset Residency", title: "Luxury Heights", location: "Mumbai", status: "ready", totalUnits: 200, expectedRevenue: 75000000 },
  ];

  const mockTelecallers: DashboardTelecaller[] = [
    { id: 1, user: { firstName: "John", lastName: "Doe", email: "john@example.com" }, role: "telecaller", status: "active", totalCalls: 45 },
    { id: 2, user: { firstName: "Jane", lastName: "Smith", email: "jane@example.com" }, role: "telecaller", status: "active", totalCalls: 38 },
    { id: 3, user: { firstName: "Mike", lastName: "Johnson", email: "mike@example.com" }, role: "telecaller", status: "busy", totalCalls: 52 },
  ];

  const mockLeads: DashboardLead[] = [
    { id: 1, firstName: "Alice", lastName: "Brown", email: "alice@example.com", loanType: "home_loan", loanAmount: 2500000, status: "new" },
    { id: 2, firstName: "Bob", lastName: "Wilson", email: "bob@example.com", loanType: "business_loan", loanAmount: 5000000, status: "contacted" },
    { id: 3, firstName: "Carol", lastName: "Davis", email: "carol@example.com", loanType: "loan_against_property", loanAmount: 3500000, status: "new" },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  const stats = [
    {
      title: "Active Projects",
      value: mockProjects.filter(p => p.status === "construction").length,
      icon: Building2,
      change: "+12%",
      gradient: "from-emerald-500/20 to-teal-500/20",
    },
    {
      title: "Total Telecallers",
      value: mockTelecallers.length,
      icon: Users,
      change: "+8%",
      gradient: "from-blue-500/20 to-indigo-500/20",
    },
    {
      title: "Unassigned Leads",
      value: mockLeads.filter(l => l.status === "new").length,
      icon: Target,
      change: "-5%",
      gradient: "from-orange-500/20 to-red-500/20",
    },
    {
      title: "Completed Projects",
      value: mockProjects.filter(p => p.status === "ready").length,
      icon: BarChart3,
      change: "+25%",
      gradient: "from-purple-500/20 to-pink-500/20",
    },
  ];

  const quickActions = [
    {
      title: "Create New Project",
      description: "Add a new construction project",
      icon: Building2,
      action: () => setShowCreateProject(true),
      gradient: "from-emerald-400/20 to-green-400/20",
    },
    {
      title: "Add Team Member",
      description: "Invite telecallers or brokers",
      icon: Users,
      action: () => setShowCreateTeam(true),
      gradient: "from-blue-400/20 to-cyan-400/20",
    },
    {
      title: "Assign Leads",
      description: "Distribute leads to telecallers",
      icon: Target,
      action: () => setShowAssignLead(true),
      gradient: "from-orange-400/20 to-amber-400/20",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/30 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
      
      <EnhancedRoleBasedNavbar user={user} onLogout={logout} />
      
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 p-4 md:p-6 space-y-6 md:space-y-8 pt-20 md:pt-24"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center space-y-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-white via-emerald-100 to-white bg-clip-text text-transparent">
            Builder Dashboard
          </h1>
          <p className="text-base md:text-lg text-gray-300 max-w-2xl mx-auto px-4">
            Manage your construction projects, team members, and lead assignments
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <GlassCard gradient="neutral" blur="md" hover className="p-6 h-full">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.gradient}`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {stat.change}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <p className="text-3xl font-bold text-white">{stat.value}</p>
                  <p className="text-sm text-gray-300">{stat.title}</p>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={itemVariants} className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quickActions.map((action, index) => (
              <motion.div
                key={action.title}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 + 0.5, duration: 0.5 }}
              >
                <div 
                  className="cursor-pointer group h-full"
                  onClick={action.action}
                >
                  <GlassCard 
                    gradient="neutral" 
                    blur="md" 
                    hover 
                    className="p-6 h-full"
                  >
                    <div className={`p-4 rounded-xl bg-gradient-to-r ${action.gradient} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <action.icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">{action.title}</h3>
                    <p className="text-gray-300 text-sm">{action.description}</p>
                  </GlassCard>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Navigation Tabs */}
        <motion.div variants={itemVariants}>
          <GlassCard gradient="neutral" blur="sm" className="p-2">
            <div className="flex flex-wrap gap-1 sm:space-x-1 sm:flex-nowrap">
              {["overview", "projects", "team", "leads", "timeline"].map((tab) => (
                <Button
                  key={tab}
                  variant={activeTab === tab ? "default" : "ghost"}
                  onClick={() => setActiveTab(tab)}
                  className={`capitalize flex-1 min-w-0 text-xs sm:text-sm ${
                    activeTab === tab 
                      ? "bg-emerald-500/20 text-emerald-100 border-emerald-500/30" 
                      : "text-gray-300 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {tab}
                </Button>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        {/* Tab Content */}
        <motion.div variants={itemVariants}>
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
              {/* Recent Projects */}
              <GlassCard gradient="neutral" blur="md" className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-white">Recent Projects</h3>
                  <Button size="sm" onClick={() => setActiveTab("projects")}>
                    View All
                  </Button>
                </div>
                <div className="space-y-3">
                  {mockProjects.slice(0, 3).map((project) => (
                    <div key={project.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div>
                        <p className="font-medium text-white">{project.name}</p>
                        <p className="text-sm text-gray-300">{project.location}</p>
                      </div>
                      <Badge variant={project.status === "construction" ? "default" : "secondary"}>
                        {project.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </GlassCard>

              {/* Team Overview */}
              <GlassCard gradient="neutral" blur="md" className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-white">Team Members</h3>
                  <Button size="sm" onClick={() => setActiveTab("team")}>
                    Manage Team
                  </Button>
                </div>
                <div className="space-y-3">
                  {mockTelecallers.slice(0, 3).map((telecaller) => (
                    <div key={telecaller.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-emerald-400 to-blue-400 rounded-full flex items-center justify-center">
                          <span className="text-xs font-semibold text-white">
                            {telecaller.user.firstName[0]}{telecaller.user.lastName[0]}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-white">
                            {telecaller.user.firstName} {telecaller.user.lastName}
                          </p>
                          <p className="text-sm text-gray-300">{telecaller.role}</p>
                        </div>
                      </div>
                      <Badge variant={telecaller.status === "active" ? "default" : "secondary"}>
                        {telecaller.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </div>
          )}

          {activeTab === "projects" && (
            <GlassCard gradient="neutral" blur="md" className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">All Projects</h3>
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search projects..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-white/10 border-white/20 text-white"
                    />
                  </div>

                  <Button onClick={() => setShowCreateProject(true)}>
                  

      
                    <Plus className="h-4 w-4 mr-2" />
                    New Project
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mockProjects
                  .filter(project => 
                    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    project.location.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((project) => (
                    <motion.div
                      key={project.id}
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      whileHover={{ scale: 1.02 }}
                      className="bg-white/5 rounded-xl p-4 border border-white/10"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <Badge variant={project.status === "construction" ? "default" : "secondary"}>
                          {project.status}
                        </Badge>
                        <span className="text-xs text-gray-400">#{project.id}</span>
                      </div>
                      <h4 className="font-semibold text-white mb-2">{project.name}</h4>
                      <h4 className="font-semibold text-white mb-2">{project.title}</h4>
                      <p className="text-sm text-gray-300 mb-3">{project.location}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">Units: {project.totalUnits}</span>
                        <span className="text-xs text-emerald-400">₹{project.expectedRevenue.toLocaleString()}</span>
                      </div>
                    </motion.div>
                  ))}
              </div>
            </GlassCard>
          )}

          {activeTab === "team" && (
            <GlassCard gradient="neutral" blur="md" className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Team Management</h3>
                <Button onClick={() => setShowCreateTeam(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Member
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mockTelecallers.map((telecaller) => (
                  <motion.div
                    key={telecaller.id}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    whileHover={{ scale: 1.02 }}
                    className="bg-white/5 rounded-xl p-4 border border-white/10"
                  >
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-emerald-400 to-blue-400 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-white">
                          {telecaller.user.firstName[0]}{telecaller.user.lastName[0]}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-white">
                          {telecaller.user.firstName} {telecaller.user.lastName}
                        </p>
                        <p className="text-xs text-gray-400">{telecaller.user.email}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">Role</span>
                        <Badge variant="outline">{telecaller.role}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">Status</span>
                        <Badge variant={telecaller.status === "active" ? "default" : "secondary"}>
                          {telecaller.status}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">Calls</span>
                        <span className="text-xs text-emerald-400">{telecaller.totalCalls}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </GlassCard>
          )}

          {activeTab === "leads" && (
            <GlassCard gradient="neutral" blur="md" className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Lead Assignment</h3>
                <Button onClick={() => {
                  setSelectedLeads(mockLeads.filter(lead => lead.status === "new"));
                  setShowAssignLead(true);
                }}>
                  <Target className="h-4 w-4 mr-2" />
                  Assign Leads
                </Button>
              </div>
              <div className="space-y-3">
                {mockLeads.slice(0, 10).map((lead) => (
                  <motion.div
                    key={lead.id}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="flex items-center justify-between p-4 bg-white/5 rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-red-400 rounded-full flex items-center justify-center">
                        <span className="text-xs font-semibold text-white">
                          {lead.firstName[0]}{lead.lastName[0]}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-white">{lead.firstName} {lead.lastName}</p>
                        <p className="text-sm text-gray-300">{lead.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline">{lead.loanType}</Badge>
                      <Badge variant="secondary">₹{lead.loanAmount.toLocaleString()}</Badge>
                      <Button size="sm" variant="outline">
                        Assign
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </GlassCard>
          )}

          {activeTab === "timeline" && (
            <GlassCard gradient="neutral" blur="md" className="p-6">
              <h3 className="text-xl font-semibold text-white mb-6">Project Timeline</h3>
              <div className="text-center py-12">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">Timeline view will be available once projects are created</p>
                <p className="text-sm text-gray-500">Track project milestones and lead activities</p>
              </div>
            </GlassCard>
          )}
        </motion.div>
      </motion.div>

      {/* Dialogs */}
      <EnhancedCreateProjectDialog 
        open={showCreateProject} 
        onOpenChange={setShowCreateProject} 
      />
      <CreateTeam 
        open={showCreateTeam} 
        onOpenChange={setShowCreateTeam} 
      />
      <EnhancedAssignLeadDialog 
        open={showAssignLead} 
        onOpenChange={setShowAssignLead}
        selectedLeads={selectedLeads}
      />
    </div>
  );
}