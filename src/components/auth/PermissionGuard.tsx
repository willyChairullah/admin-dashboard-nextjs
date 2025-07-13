import React from "react";
import { usePermissions } from "@/hooks/use-permissions";
import type { PermissionString, ModuleName } from "@/types/permission";

interface PermissionGuardProps {
  children: React.ReactNode;
  permission?: PermissionString;
  permissions?: PermissionString[];
  module?: ModuleName;
  requireAll?: boolean;
  fallback?: React.ReactNode;
  showFallback?: boolean;
}

/**
 * Component that conditionally renders children based on user permissions
 * Used to protect UI elements at the component level
 */
export function PermissionGuard({
  children,
  permission,
  permissions,
  module,
  requireAll = false,
  fallback = null,
  showFallback = true,
}: PermissionGuardProps) {
  const { hasPermission, hasAnyPermission, hasModule } = usePermissions();

  let hasAccess = false;

  // Check single permission
  if (permission) {
    hasAccess = hasPermission(permission);
  }
  // Check multiple permissions
  else if (permissions && permissions.length > 0) {
    hasAccess = requireAll
      ? permissions.every(p => hasPermission(p))
      : hasAnyPermission(permissions);
  }
  // Check module access
  else if (module) {
    hasAccess = hasModule(module);
  }
  // If no permission specified, allow access
  else {
    hasAccess = true;
  }

  if (hasAccess) {
    return <>{children}</>;
  }

  return showFallback ? <>{fallback}</> : null;
}

interface PermissionButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  permission?: PermissionString;
  permissions?: PermissionString[];
  module?: ModuleName;
  requireAll?: boolean;
  children: React.ReactNode;
}

/**
 * Button component that disables itself based on permissions
 */
export function PermissionButton({
  permission,
  permissions,
  module,
  requireAll = false,
  children,
  disabled,
  className = "",
  ...props
}: PermissionButtonProps) {
  const { hasPermission, hasAnyPermission, hasModule } = usePermissions();

  let hasAccess = true;

  if (permission) {
    hasAccess = hasPermission(permission);
  } else if (permissions && permissions.length > 0) {
    hasAccess = requireAll
      ? permissions.every(p => hasPermission(p))
      : hasAnyPermission(permissions);
  } else if (module) {
    hasAccess = hasModule(module);
  }

  const isDisabled = disabled || !hasAccess;

  return (
    <button
      {...props}
      disabled={isDisabled}
      className={`${className} ${
        !hasAccess ? "opacity-50 cursor-not-allowed" : ""
      }`}
      title={!hasAccess ? "Insufficient permissions" : props.title}
    >
      {children}
    </button>
  );
}

interface PermissionLinkProps {
  permission?: PermissionString;
  permissions?: PermissionString[];
  module?: ModuleName;
  requireAll?: boolean;
  href: string;
  children: React.ReactNode;
  className?: string;
  fallback?: React.ReactNode;
}

/**
 * Link component that conditionally renders based on permissions
 */
export function PermissionLink({
  permission,
  permissions,
  module,
  requireAll = false,
  href,
  children,
  className = "",
  fallback = null,
}: PermissionLinkProps) {
  const { hasPermission, hasAnyPermission, hasModule } = usePermissions();

  let hasAccess = true;

  if (permission) {
    hasAccess = hasPermission(permission);
  } else if (permissions && permissions.length > 0) {
    hasAccess = requireAll
      ? permissions.every(p => hasPermission(p))
      : hasAnyPermission(permissions);
  } else if (module) {
    hasAccess = hasModule(module);
  }

  if (!hasAccess) {
    return fallback ? <>{fallback}</> : null;
  }

  return (
    <a href={href} className={className}>
      {children}
    </a>
  );
}

interface ModuleSectionProps {
  module: ModuleName;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Component that renders children only if user has access to the module
 */
export function ModuleSection({
  module,
  children,
  fallback = null,
}: ModuleSectionProps) {
  return (
    <PermissionGuard module={module} fallback={fallback}>
      {children}
    </PermissionGuard>
  );
}

interface ActionSectionProps {
  module: ModuleName;
  action: "View" | "Create" | "Edit" | "Delete";
  context?: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Component that renders children only if user can perform the specified action
 */
export function ActionSection({
  module,
  action,
  context = "Content",
  children,
  fallback = null,
}: ActionSectionProps) {
  const permission = `${module}.${context}.${action}` as PermissionString;

  return (
    <PermissionGuard permission={permission} fallback={fallback}>
      {children}
    </PermissionGuard>
  );
}

interface RoleGuardProps {
  roles: string | string[];
  children: React.ReactNode;
  requireAll?: boolean;
  fallback?: React.ReactNode;
}

/**
 * Component that conditionally renders children based on user roles
 */
export function RoleGuard({
  roles,
  children,
  requireAll = false,
  fallback = null,
}: RoleGuardProps) {
  const { user } = usePermissions();

  const userRoles = user?.roles?.map(role => role.role_name) || [];
  const roleArray = Array.isArray(roles) ? roles : [roles];

  const hasAccess = requireAll
    ? roleArray.every(role => userRoles.includes(role))
    : roleArray.some(role => userRoles.includes(role));

  if (hasAccess) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}

/**
 * Higher-order component for protecting entire pages
 */
export function withPermission<P extends object>(
  Component: React.ComponentType<P>,
  permission: PermissionString,
  fallback?: React.ComponentType
) {
  return function PermissionProtectedComponent(props: P) {
    const { hasPermission } = usePermissions();

    if (hasPermission(permission)) {
      return <Component {...props} />;
    }

    if (fallback) {
      const FallbackComponent = fallback;
      return <FallbackComponent />;
    }

    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            You don't have permission to access this page.
          </p>
        </div>
      </div>
    );
  };
}

/**
 * Higher-order component for protecting pages by module
 */
export function withModuleAccess<P extends object>(
  Component: React.ComponentType<P>,
  module: ModuleName,
  fallback?: React.ComponentType
) {
  return function ModuleProtectedComponent(props: P) {
    const { hasModule } = usePermissions();

    if (hasModule(module)) {
      return <Component {...props} />;
    }

    if (fallback) {
      const FallbackComponent = fallback;
      return <FallbackComponent />;
    }

    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Module Access Denied
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            You don't have access to the {module} module.
          </p>
        </div>
      </div>
    );
  };
}
