// Admin Configuration
// This file contains configuration for admin access and permissions

export const AdminConfig = {
  // List of admin email addresses
  // Add or remove emails as needed for admin access
  adminEmails: [
    'admin@example.com',
    'roshininaguru12@gmail.com',
    'admin@reviewnext.com', 
    'super@admin.com'
  ],

  // Admin dashboard settings
  dashboard: {
    // Default route when admin accesses /admin
    defaultRoute: '/admin/analytics',
    
    // Available admin routes
    routes: {
      analytics: '/admin/analytics',
      users: '/admin/users', 
      reviews: '/admin/reviews',
      products: '/admin/products',
      settings: '/admin/settings'
    }
  },

  // Admin permissions (for future expansion)
  permissions: {
    canManageUsers: true,
    canManageReviews: true, 
    canManageProducts: true,
    canViewAnalytics: true,
    canAccessSettings: true,
    canExportData: true
  },

  // Security settings
  security: {
    // Redirect non-admin users to this route
    unauthorizedRedirect: '/dashboard',
    
    // Session timeout for admin actions (in minutes)
    sessionTimeout: 60,
    
    // Require re-authentication for sensitive actions
    requireReauth: false
  }
};

// Helper function to check if email is admin
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return AdminConfig.adminEmails.includes(email.toLowerCase());
}

// Helper function to get admin navigation items
export function getAdminNavItems() {
  return [
    { 
      label: 'Analytics', 
      route: AdminConfig.dashboard.routes.analytics, 
      icon: 'analytics',
      description: 'View platform analytics and statistics'
    },
    { 
      label: 'Users', 
      route: AdminConfig.dashboard.routes.users, 
      icon: 'people',
      description: 'Manage user accounts and permissions'
    },
    { 
      label: 'Reviews', 
      route: AdminConfig.dashboard.routes.reviews, 
      icon: 'rate_review',
      description: 'Moderate and manage user reviews'
    },
    { 
      label: 'Products', 
      route: AdminConfig.dashboard.routes.products, 
      icon: 'inventory',
      description: 'Manage product catalog across categories'
    },
    { 
      label: 'Settings', 
      route: AdminConfig.dashboard.routes.settings, 
      icon: 'settings',
      description: 'System settings and data export'
    }
  ];
}
