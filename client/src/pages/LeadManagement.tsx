import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  User,
  MapPin,
  Building2
} from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { EnhancedRoleBasedNavbar } from "@/components/layout/EnhancedRoleBasedNavbar";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
// import type { Lead } from "@shared/schema";

export default function LeadManagement() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Fetch leads
  const { data: leadsResponse, isLoading } = useQuery({
    queryKey: ["/api/leads", searchTerm, filterStatus],
    refetchInterval: 30000,
  });

  const leads = (leadsResponse as any)?.leads || [];

  // Create lead mutation
  const createLeadMutation = useMutation({
    mutationFn: async (leadData: any) => {
      return await apiRequest("/api/leads", { method: "POST", body: leadData });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      setIsCreateDialogOpen(false);
      toast({
        title: "Success",
        description: "Lead created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create lead",
        variant: "destructive",
      });
    },
  });

  // Delete lead mutation
  const deleteLeadMutation = useMutation({
    mutationFn: async (leadId: number) => {
      await apiRequest(`/api/leads/${leadId}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      toast({
        title: "Success",
        description: "Lead deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete lead",
        variant: "destructive",
      });
    },
  });

  const handleCreateLead = (formData: FormData) => {
    const leadData = {
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      loanType: formData.get("loanType"),
      loanAmount: parseInt(formData.get("loanAmount") as string),
      income: parseInt(formData.get("income") as string),
      property: formData.get("property"),
      status: "new"
    };
    createLeadMutation.mutate(leadData);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new": return "bg-blue-500/20 text-blue-100 border-blue-500/30";
      case "contacted": return "bg-yellow-500/20 text-yellow-100 border-yellow-500/30";
      case "documents_requested": return "bg-orange-500/20 text-orange-100 border-orange-500/30";
      case "documents_received": return "bg-purple-500/20 text-purple-100 border-purple-500/30";
      case "under_review": return "bg-cyan-500/20 text-cyan-100 border-cyan-500/30";
      case "approved": return "bg-emerald-500/20 text-emerald-100 border-emerald-500/30";
      case "rejected": return "bg-red-500/20 text-red-100 border-red-500/30";
      case "disbursed": return "bg-green-500/20 text-green-100 border-green-500/30";
      default: return "bg-gray-500/20 text-gray-100 border-gray-500/30";
    }
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/30 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000" />

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
            Lead Management
          </h1>
          <p className="text-base md:text-lg text-gray-300 max-w-2xl mx-auto px-4">
            Manage your leads, track progress, and convert prospects into customers
          </p>
        </motion.div>

        {/* Controls */}
        <motion.div variants={itemVariants}>
          <GlassCard gradient="neutral" blur="md" className="p-6">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search leads..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                >
                  <option value="">All Status</option>
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="documents_requested">Documents Requested</option>
                  <option value="under_review">Under Review</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="disbursed">Disbursed</option>
                </select>
              </div>

              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Lead
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-slate-800/95 border border-white/20 text-white">
                  <DialogHeader>
                    <DialogTitle>Create New Lead</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    handleCreateLead(new FormData(e.target as HTMLFormElement));
                  }} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Input name="firstName" placeholder="First Name" required className="bg-white/10 border-white/20" />
                      <Input name="lastName" placeholder="Last Name" required className="bg-white/10 border-white/20" />
                    </div>
                    <Input name="email" type="email" placeholder="Email" required className="bg-white/10 border-white/20" />
                    <Input name="phone" placeholder="Phone Number" required className="bg-white/10 border-white/20" />
                    <select name="loanType" required className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white">
                      <option value="">Select Loan Type</option>
                      <option value="home_loan">Home Loan</option>
                      <option value="loan_against_property">Loan Against Property</option>
                      <option value="business_loan">Business Loan</option>
                    </select>
                    <Input name="loanAmount" type="number" placeholder="Loan Amount" required className="bg-white/10 border-white/20" />
                    <Input name="income" type="number" placeholder="Monthly Income" required className="bg-white/10 border-white/20" />
                    <Input name="property" placeholder="Property Details" className="bg-white/10 border-white/20" />
                    <Button type="submit" disabled={createLeadMutation.isPending} className="w-full">
                      {createLeadMutation.isPending ? "Creating..." : "Create Lead"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </GlassCard>
        </motion.div>

        {/* Leads Table */}
        <motion.div variants={itemVariants}>
          <GlassCard gradient="neutral" blur="md" className="p-6">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/20">
                    <TableHead className="text-gray-300">Name</TableHead>
                    <TableHead className="text-gray-300">Contact</TableHead>
                    <TableHead className="text-gray-300">Loan Details</TableHead>
                    <TableHead className="text-gray-300">Status</TableHead>
                    <TableHead className="text-gray-300">Assigned To</TableHead>
                    <TableHead className="text-gray-300">Created</TableHead>
                    <TableHead className="text-gray-300 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-gray-400 py-8">
                        Loading leads...
                      </TableCell>
                    </TableRow>
                  ) : leads.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-gray-400 py-8">
                        No leads found
                      </TableCell>
                    </TableRow>
                  ) : (
                    leads.map((lead: Lead) => (
                      <TableRow key={lead.id} className="border-white/10 hover:bg-white/5">
                        <TableCell className="text-white">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-emerald-400 to-blue-500 rounded-full flex items-center justify-center text-sm font-semibold">
                              {lead.firstName.charAt(0)}{lead.lastName.charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium">{lead.firstName} {lead.lastName}</p>
                              <p className="text-sm text-gray-400">ID: {lead.id}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-300">
                          <div className="space-y-1">
                            <p className="flex items-center text-sm">
                              <Mail className="h-3 w-3 mr-2" />
                              {lead.email}
                            </p>
                            <p className="flex items-center text-sm">
                              <Phone className="h-3 w-3 mr-2" />
                              {lead.phone}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-300">
                          <div className="space-y-1">
                            <p className="font-medium">{lead.loanType?.replace('_', ' ')}</p>
                            <p className="text-sm">₹{lead.loanAmount?.toLocaleString()}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(lead.status)}>
                            {lead.status.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-300">
                          {lead.assignedToId ? `User ${lead.assignedToId}` : "Unassigned"}
                        </TableCell>
                        <TableCell className="text-gray-300">
                          {new Date(lead.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Button size="sm" variant="outline" className="text-xs">
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="outline" className="text-xs">
                              <Edit className="h-3 w-3" />
                            </Button>
                            {user?.role === "super_admin" || user?.role === "admin" ? (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs text-red-400 hover:text-red-300"
                                onClick={() => deleteLeadMutation.mutate(lead.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            ) : null}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </GlassCard>
        </motion.div>
      </motion.div>
    </div>
  );
}