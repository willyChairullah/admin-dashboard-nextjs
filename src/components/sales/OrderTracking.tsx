import { FC } from "react";
import {
  Package,
  Clock,
  CheckCircle,
  XCircle,
  ShoppingCart,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";

interface OrderTrackingProps {
  status: string;
  orderDate: Date;
  confirmedAt?: Date | null;
  requiresConfirmation?: boolean;
  compact?: boolean;
}

const OrderTracking: FC<OrderTrackingProps> = ({
  status,
  orderDate,
  confirmedAt,
  requiresConfirmation = false,
  compact = false,
}) => {
  const getSteps = () => {
    const baseSteps = [
      {
        id: "NEW",
        name: "Order Dibuat",
        icon: Package,
        description: "Order telah dibuat dan dicatat dalam sistem",
        date: orderDate,
      },
      {
        id: "PENDING_CONFIRMATION",
        name: "Menunggu Konfirmasi",
        icon: Clock,
        description: requiresConfirmation
          ? "Order menunggu konfirmasi dari admin"
          : "Order dikonfirmasi otomatis",
        date: requiresConfirmation ? null : orderDate,
      },
      {
        id: "IN_PROCESS",
        name: "Dalam Proses",
        icon: ShoppingCart,
        description: "Order sedang diproses dan disiapkan",
        date: null,
      },
      {
        id: "COMPLETED",
        name: "Selesai",
        icon: CheckCircle,
        description: "Order telah selesai dan dikirim",
        date: null,
      },
    ];

    // Add confirmed date if available
    if (confirmedAt && requiresConfirmation) {
      baseSteps[1].date = confirmedAt;
    }

    return baseSteps;
  };

  const steps = getSteps();
  const currentStepIndex = steps.findIndex((step) => step.id === status);
  const isCanceled = status === "CANCELED";

  const getStepStatus = (index: number) => {
    if (isCanceled) {
      return index === 0 ? "completed" : "canceled";
    }

    if (index < currentStepIndex) return "completed";
    if (index === currentStepIndex) return "current";
    return "upcoming";
  };

  const getStepStyles = (stepStatus: string) => {
    switch (stepStatus) {
      case "completed":
        return {
          container: "text-green-600 dark:text-green-400",
          icon: "bg-green-600 text-white",
          line: "bg-green-600",
        };
      case "current":
        return {
          container: "text-blue-600 dark:text-blue-400",
          icon: "bg-blue-600 text-white",
          line: "bg-gray-300 dark:bg-gray-600",
        };
      case "canceled":
        return {
          container: "text-red-600 dark:text-red-400",
          icon: "bg-red-600 text-white",
          line: "bg-red-300",
        };
      default:
        return {
          container: "text-gray-400 dark:text-gray-500",
          icon: "bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400",
          line: "bg-gray-300 dark:bg-gray-600",
        };
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return null;
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (compact) {
    return (
      <div className="flex items-center space-x-2">
        <div className="flex items-center">
          {steps.slice(0, currentStepIndex + 1).map((step, index) => {
            const stepStatus = getStepStatus(index);
            const styles = getStepStyles(stepStatus);
            const IconComponent = step.icon;

            return (
              <div key={step.id} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-6 h-6 rounded-full ${styles.icon}`}
                >
                  <IconComponent className="w-3 h-3" />
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-8 h-0.5 mx-1 ${styles.line}`} />
                )}
              </div>
            );
          })}
        </div>
        {isCanceled && (
          <div className="flex items-center text-red-600 dark:text-red-400">
            <XCircle className="w-4 h-4 mr-1" />
            <span className="text-sm font-medium">Dibatal</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
        Status Tracking Order
      </h3>

      {isCanceled && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900 rounded-lg">
          <div className="flex items-center text-red-800 dark:text-red-300">
            <AlertTriangle className="w-5 h-5 mr-2" />
            <span className="font-medium">Order ini telah dibatalkan</span>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {steps.map((step, index) => {
          const stepStatus = getStepStatus(index);
          const styles = getStepStyles(stepStatus);
          const IconComponent = step.icon;
          const isLast = index === steps.length - 1;

          return (
            <div key={step.id} className="relative">
              <div className="flex items-start">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full ${styles.icon}`}
                  >
                    <IconComponent className="w-5 h-5" />
                  </div>
                  {!isLast && (
                    <div className={`w-0.5 h-16 mt-2 ${styles.line}`} />
                  )}
                </div>
                <div className={`ml-4 min-h-10 ${styles.container}`}>
                  <h4 className="text-sm font-semibold">{step.name}</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {step.description}
                  </p>
                  {step.date && (
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      {formatDate(step.date)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderTracking;
