import { authService } from "@/lib/auth";

export function useRoleAccess() {
  const user = authService.getUser();

  if (!user) {
    return {
      canManageUsers: false,
      canManageAllLeads: false,
      canViewAuditLogs: false,
      canManageCrmIntegrations: false,
      canAssignLeads: false,
      canDeleteLeads: false,
      canViewOwnLeads: false,
      canCreateLeads: false,
      canManageOwnLeads: false,
    };
  }

  return {
    canManageUsers: authService.hasPermission("manage_users"),
    canManageAllLeads: authService.hasPermission("manage_all_leads"),
    canViewAuditLogs: authService.hasPermission("view_audit_logs"),
    canManageCrmIntegrations: authService.hasPermission("manage_crm_integrations"),
    canAssignLeads: authService.hasPermission("assign_leads"),
    canDeleteLeads: authService.hasPermission("delete_leads"),
    canViewOwnLeads: authService.hasPermission("view_own_leads"),
    canCreateLeads: authService.hasPermission("create_leads"),
    canManageOwnLeads: authService.hasPermission("manage_own_leads"),
  };
}
