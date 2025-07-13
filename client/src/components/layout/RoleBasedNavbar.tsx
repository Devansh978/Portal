import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "wouter";
import { 
  Building2, 
  Users, 
  FileText, 
  BarChart3, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Home,
  Phone,
  Briefcase,
  Calculator,
  Shield,
  Bell,
  Search,
  User
} from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface RoleBasedNavbarProps {
  user: User | null;
  onLogout: () => void;
}

export function RoleBasedNavbar({ user, onLogout }: RoleBasedNavbarProps) {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications] = useState(3); // Mock notifications

  const roleBasedNavigation = {
    super_admin: [
      { href: "/dashboard", icon: Home, label: "Dashboard" },
      { href: "/users", icon: Users, label: "Users" },
      { href: "/projects", icon: Building2, label: "Projects" },
      { href: "/leads", icon: FileText, label: "Leads" },
      { href: "/analytics", icon: BarChart3, label: "Analytics" },
      { href: "/settings", icon: Settings, label: "Settings" },
    ],
    admin: [
      { href: "/dashboard", icon: Home, label: "Dashboard" },
      { href: "/users", icon: Users, label: "Users" },
      { href: "/projects", icon: Building2, label: "Projects" },
      { href: "/leads", icon: FileText, label: "Leads" },
      { href: "/analytics", icon: BarChart3, label: "Analytics" },
      { href: "/settings", icon: Settings, label: "Settings" },
    ],
    builder: [
      { href: "/builder-dashboard", icon: Building2, label: "Dashboard" },
      { href: "/projects", icon: Building2, label: "Projects" },
      { href: "/team", icon: Users, label: "Team" },
      { href: "/leads", icon: FileText, label: "Leads" },
      { href: "/timeline", icon: BarChart3, label: "Timeline" },
    ],
    telecaller: [
      { href: "/telecaller-portal", icon: Phone, label: "Dashboard" },
      { href: "/my-leads", icon: FileText, label: "My Leads" },
      { href: "/call-logs", icon: Phone, label: "Call Logs" },
      { href: "/performance", icon: BarChart3, label: "Performance" },
    ],
    broker: [
      { href: "/broker-dashboard", icon: Briefcase, label: "Dashboard" },
      { href: "/my-leads", icon: FileText, label: "My Leads" },
      { href: "/clients", icon: Users, label: "Clients" },
      { href: "/commission", icon: BarChart3, label: "Commission" },
    ],
    ca: [
      { href: "/ca-dashboard", icon: Calculator, label: "Dashboard" },
      { href: "/documents", icon: FileText, label: "Documents" },
      { href: "/compliance", icon: Shield, label: "Compliance" },
      { href: "/reports", icon: BarChart3, label: "Reports" },
    ],
    user: [
      { href: "/user-dashboard", icon: Home, label: "Dashboard" },
      { href: "/my-files", icon: FileText, label: "My Files" },
      { href: "/timeline", icon: BarChart3, label: "Timeline" },
    ],
  };

  const navigation = user ? roleBasedNavigation[user.role as keyof typeof roleBasedNavigation] || [] : [];

  const getRoleColor = (role: string) => {
    switch (role) {
      case "super_admin":
        return "from-red-500/20 to-pink-500/20 border-red-500/30 text-red-300";
      case "admin":
        return "from-purple-500/20 to-indigo-500/20 border-purple-500/30 text-purple-300";
      case "builder":
        return "from-emerald-500/20 to-green-500/20 border-emerald-500/30 text-emerald-300";
      case "telecaller":
        return "from-blue-500/20 to-cyan-500/20 border-blue-500/30 text-blue-300";
      case "broker":
        return "from-orange-500/20 to-amber-500/20 border-orange-500/30 text-orange-300";
      case "ca":
        return "from-teal-500/20 to-cyan-500/20 border-teal-500/30 text-teal-300";
      case "user":
        return "from-gray-500/20 to-slate-500/20 border-gray-500/30 text-gray-300";
      default:
        return "from-gray-500/20 to-slate-500/20 border-gray-500/30 text-gray-300";
    }
  };

  const formatRole = (role: string) => {
    return role.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const navVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.4 },
    },
  };

  return (
    <>
      {/* Desktop Navigation */}
      <motion.nav
        variants={navVariants}
        initial="hidden"
        animate="visible"
        className="hidden lg:block fixed top-6 left-6 right-6 z-50"
      >
        <GlassCard gradient="neutral" blur="xl" className="px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo and Brand */}
            <motion.div variants={itemVariants} className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-lg flex items-center justify-center">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">LoanPro</h1>
                <p className="text-xs text-gray-400">Loan Management System</p>
              </div>
            </motion.div>

            {/* Navigation Links */}
            <motion.div variants={itemVariants} className="flex items-center space-x-1">
              {navigation.map((item) => {
                const isActive = location === item.href;
                return (
                  <Link key={item.href} href={item.href}>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        variant={isActive ? "default" : "ghost"}
                        size="sm"
                        className={`relative flex items-center space-x-2 ${
                          isActive
                            ? "bg-white/20 text-white border-white/30"
                            : "text-gray-300 hover:text-white hover:bg-white/10"
                        }`}
                      >
                        <item.icon className="h-4 w-4" />
                        <span className="hidden xl:inline">{item.label}</span>
                        {isActive && (
                          <motion.div
                            layoutId="activeIndicator"
                            className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 rounded-md border border-emerald-500/30"
                          />
                        )}
                      </Button>
                    </motion.div>
                  </Link>
                );
              })}
            </motion.div>

            {/* User Profile and Actions */}
            <motion.div variants={itemVariants} className="flex items-center space-x-4">
              {/* Search */}
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-300 hover:text-white hover:bg-white/10"
              >
                <Search className="h-4 w-4" />
              </Button>

              {/* Notifications */}
              <Button
                variant="ghost"
                size="sm"
                className="relative text-gray-300 hover:text-white hover:bg-white/10"
              >
                <Bell className="h-4 w-4" />
                {notifications > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 bg-red-500 text-white text-xs">
                    {notifications}
                  </Badge>
                )}
              </Button>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-auto pl-2 pr-3">
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="" alt={user?.firstName} />
                        <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-blue-500 text-white text-sm">
                          {user?.firstName?.[0]}{user?.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="hidden md:block text-left">
                        <p className="text-sm font-medium text-white">
                          {user?.firstName} {user?.lastName}
                        </p>
                        <Badge className={`text-xs ${getRoleColor(user?.role || "")}`}>
                          {formatRole(user?.role || "")}
                        </Badge>
                      </div>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-black/90 border-white/20" align="end">
                  <DropdownMenuLabel className="text-white">
                    My Account
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="border-white/20" />
                  <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-white/10">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-white/10">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="border-white/20" />
                  <DropdownMenuItem 
                    onClick={onLogout}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </motion.div>
          </div>
        </GlassCard>
      </motion.nav>

      {/* Mobile Navigation */}
      <div className="lg:hidden">
        {/* Mobile Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-0 left-0 right-0 z-50 p-4"
        >
          <GlassCard gradient="neutral" blur="xl" className="px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-lg flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-lg font-bold text-white">LoanPro</h1>
              </div>

              <div className="flex items-center space-x-2">
                {/* Notifications */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="relative text-gray-300 hover:text-white hover:bg-white/10"
                >
                  <Bell className="h-4 w-4" />
                  {notifications > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 bg-red-500 text-white text-xs">
                      {notifications}
                    </Badge>
                  )}
                </Button>

                {/* Menu Toggle */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(!isOpen)}
                  className="text-gray-300 hover:text-white hover:bg-white/10"
                >
                  {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
              </div>
            </div>
          </GlassCard>
        </motion.header>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 flex items-start justify-center pt-20 p-4"
              onClick={() => setIsOpen(false)}
            >
              <div onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                <GlassCard
                  gradient="neutral"
                  blur="xl"
                  className="w-full max-w-sm p-6"
                >
                {/* User Profile */}
                <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-white/10">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src="" alt={user?.firstName} />
                    <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-blue-500 text-white">
                      {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-white">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <Badge className={`text-xs ${getRoleColor(user?.role || "")}`}>
                      {formatRole(user?.role || "")}
                    </Badge>
                  </div>
                </div>

                {/* Navigation Links */}
                <div className="space-y-2 mb-6">
                  {navigation.map((item) => {
                    const isActive = location === item.href;
                    return (
                      <Link key={item.href} href={item.href}>
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setIsOpen(false)}
                        >
                          <Button
                            variant={isActive ? "default" : "ghost"}
                            className={`w-full justify-start ${
                              isActive
                                ? "bg-white/20 text-white border-white/30"
                                : "text-gray-300 hover:text-white hover:bg-white/10"
                            }`}
                          >
                            <item.icon className="mr-3 h-4 w-4" />
                            {item.label}
                          </Button>
                        </motion.div>
                      </Link>
                    );
                  })}
                </div>

                {/* Actions */}
                <div className="space-y-2 pt-4 border-t border-white/10">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-gray-300 hover:text-white hover:bg-white/10"
                  >
                    <User className="mr-3 h-4 w-4" />
                    Profile
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-gray-300 hover:text-white hover:bg-white/10"
                  >
                    <Settings className="mr-3 h-4 w-4" />
                    Settings
                  </Button>
                  <Button
                    onClick={onLogout}
                    variant="ghost"
                    className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  >
                    <LogOut className="mr-3 h-4 w-4" />
                    Log out
                  </Button>
                </div>
                </GlassCard>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}