import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { Building2, MapPin, DollarSign, Users, Calendar, Target, UserPlus, Plus, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { GlassCard } from "@/components/ui/glass-card";

const createProjectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  title: z.string().min(1, "Project title is required"),
  type: z.string().min(1, "Project type is required"),
  location: z.string().min(1, "Location is required"),
  builder: z.string().min(1, "Builder name is required"),
  totalUnits: z.number().min(1, "Total units must be at least 1"),
  expectedRevenue: z.number().min(1, "Expected revenue must be greater than 0"),
  description: z.string().optional(),
  completionDate: z.string().optional(),
});

const createLeadSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  loanType: z.string().min(1, "Loan type is required"),
  loanAmount: z.number().min(1, "Loan amount must be greater than 0"),
  monthlyIncome: z.number().optional(),
  currentAddress: z.string().optional(),
});

type CreateProjectFormData = z.infer<typeof createProjectSchema>;
type CreateLeadFormData = z.infer<typeof createLeadSchema>;

interface EnhancedCreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EnhancedCreateProjectDialog({ open, onOpenChange }: EnhancedCreateProjectDialogProps) {
  const [activeTab, setActiveTab] = useState("project");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const projectForm = useForm<CreateProjectFormData>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: "",
      title: "",
      type: "",
      location: "",
      builder: "",
      totalUnits: 0,
      expectedRevenue: 0,
      description: "",
      completionDate: "",
    },
  });

  const leadForm = useForm<CreateLeadFormData>({
    resolver: zodResolver(createLeadSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      loanType: "",
      loanAmount: 0,
      monthlyIncome: 0,
      currentAddress: "",
    },
  });

  const createProjectMutation = useMutation({
    mutationFn: async (data: CreateProjectFormData) => {
      return await apiRequest("/api/projects", { method: "POST", body: data });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({
        title: "Success",
        description: "Project created successfully!",
      });
      projectForm.reset();
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create project",
        variant: "destructive",
      });
    },
  });

  const createLeadMutation = useMutation({
    mutationFn: async (data: CreateLeadFormData) => {
      return await apiRequest("/api/leads", { method: "POST", body: data });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      toast({
        title: "Success",
        description: "Lead created successfully!",
      });
      leadForm.reset();
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create lead",
        variant: "destructive",
      });
    },
  });

  const onProjectSubmit = (data: CreateProjectFormData) => {
    createProjectMutation.mutate(data);
  };

  const onLeadSubmit = (data: CreateLeadFormData) => {
    createLeadMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-transparent border-none p-0">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <GlassCard gradient="neutral" blur="xl" className="p-8">
                <DialogHeader className="space-y-4 mb-6">
                  <DialogTitle className="text-3xl font-bold text-center bg-gradient-to-r from-white via-emerald-100 to-white bg-clip-text text-transparent">
                    Create New Project & Lead
                  </DialogTitle>
                  <DialogDescription className="text-center text-gray-300">
                    Add a new project to your portfolio or create a new lead for your telecallers
                  </DialogDescription>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-white/10 border border-white/20">
                    <TabsTrigger 
                      value="project" 
                      className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-100"
                    >
                      <Building2 className="h-4 w-4 mr-2" />
                      Create Project
                    </TabsTrigger>
                    <TabsTrigger 
                      value="lead"
                      className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-100"
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add User Lead
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="project" className="space-y-6 mt-6">
                    <Form {...projectForm}>
                      <form onSubmit={projectForm.handleSubmit(onProjectSubmit)} className="space-y-6">
                        <motion.div
                          initial={{ x: -20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: 0.1 }}
                          className="grid grid-cols-1 md:grid-cols-2 gap-4"
                        >
                          <FormField
                            control={projectForm.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white flex items-center">
                                  <Building2 className="h-4 w-4 mr-2" />
                                  Project Name
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="e.g., Luxury Heights"
                                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={projectForm.control}
                            name="title"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white flex items-center">
                                  <Target className="h-4 w-4 mr-2" />
                                  Project Title
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="e.g., Premium Living Complex"
                                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={projectForm.control}
                            name="type"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white">Project Type</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                                      <SelectValue placeholder="Select project type" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="residential">Residential</SelectItem>
                                    <SelectItem value="commercial">Commercial</SelectItem>
                                    <SelectItem value="mixed">Mixed Use</SelectItem>
                                    <SelectItem value="luxury">Luxury</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={projectForm.control}
                            name="location"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white flex items-center">
                                  <MapPin className="h-4 w-4 mr-2" />
                                  Location
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="e.g., Gurgaon, Delhi NCR"
                                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={projectForm.control}
                            name="builder"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white flex items-center">
                                  <Users className="h-4 w-4 mr-2" />
                                  Builder Name
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="e.g., Elite Builders Pvt Ltd"
                                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={projectForm.control}
                            name="totalUnits"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white">Total Units</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    placeholder="150"
                                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                                    {...field}
                                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={projectForm.control}
                            name="expectedRevenue"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white flex items-center">
                                  <DollarSign className="h-4 w-4 mr-2" />
                                  Expected Revenue (₹)
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    placeholder="50000000"
                                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                                    {...field}
                                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={projectForm.control}
                            name="completionDate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white flex items-center">
                                  <Calendar className="h-4 w-4 mr-2" />
                                  Completion Date
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    type="date"
                                    className="bg-white/10 border-white/20 text-white"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </motion.div>

                        <motion.div
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.2 }}
                        >
                          <FormField
                            control={projectForm.control}
                            name="description"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white">Description (Optional)</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="Brief description of the project features and amenities..."
                                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                                    rows={3}
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </motion.div>

                        <DialogFooter>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="border-white/20 text-white hover:bg-white/10"
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            disabled={createProjectMutation.isPending}
                            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
                          >
                            {createProjectMutation.isPending ? "Creating..." : "Create Project"}
                          </Button>
                        </DialogFooter>
                      </form>
                    </Form>
                  </TabsContent>

                  <TabsContent value="lead" className="space-y-6 mt-6">
                    <Form {...leadForm}>
                      <form onSubmit={leadForm.handleSubmit(onLeadSubmit)} className="space-y-6">
                        <motion.div
                          initial={{ x: 20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: 0.1 }}
                          className="grid grid-cols-1 md:grid-cols-2 gap-4"
                        >
                          <FormField
                            control={leadForm.control}
                            name="firstName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white flex items-center">
                                  <Users className="h-4 w-4 mr-2" />
                                  First Name
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="e.g., John"
                                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={leadForm.control}
                            name="lastName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white">Last Name</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="e.g., Doe"
                                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={leadForm.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white flex items-center">
                                  <Mail className="h-4 w-4 mr-2" />
                                  Email Address
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    type="email"
                                    placeholder="john.doe@example.com"
                                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={leadForm.control}
                            name="phone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white flex items-center">
                                  <Phone className="h-4 w-4 mr-2" />
                                  Phone Number
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="9876543210"
                                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={leadForm.control}
                            name="loanType"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white">Loan Type</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                                      <SelectValue placeholder="Select loan type" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="home_loan">Home Loan</SelectItem>
                                    <SelectItem value="loan_against_property">Loan Against Property</SelectItem>
                                    <SelectItem value="business_loan">Business Loan</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={leadForm.control}
                            name="loanAmount"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white flex items-center">
                                  <DollarSign className="h-4 w-4 mr-2" />
                                  Loan Amount (₹)
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    placeholder="2500000"
                                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                                    {...field}
                                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={leadForm.control}
                            name="monthlyIncome"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white">Monthly Income (₹)</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    placeholder="75000"
                                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                                    {...field}
                                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </motion.div>

                        <motion.div
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.2 }}
                        >
                          <FormField
                            control={leadForm.control}
                            name="currentAddress"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white">Current Address (Optional)</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="Current residential address..."
                                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                                    rows={2}
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </motion.div>

                        <DialogFooter>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="border-white/20 text-white hover:bg-white/10"
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            disabled={createLeadMutation.isPending}
                            className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                          >
                            {createLeadMutation.isPending ? "Creating..." : "Create Lead"}
                          </Button>
                        </DialogFooter>
                      </form>
                    </Form>
                  </TabsContent>
                </Tabs>
              </GlassCard>
            </motion.div>
          </DialogContent>
        )}
      </AnimatePresence>
    </Dialog>
  );
}