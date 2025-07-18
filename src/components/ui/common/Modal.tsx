"use client";
import React, { useEffect, useRef, ReactNode } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  closeOnOverlayClick?: boolean;
  showCloseButton?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = "md",
  className = "",
  closeOnOverlayClick = true,
  showCloseButton = true,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  // Handle click outside
  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnOverlayClick && event.target === event.currentTarget) {
      onClose();
    }
  };

  // Size classes with improved responsiveness
  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-xl",
    xl: "max-w-6xl",
  };

  // Early return if modal is not open
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-modal="true">
      <div
        className="fixed inset-0 bg-black/50 dark:bg-black/70 transition-opacity duration-300 ease-out"
        onClick={handleOverlayClick}
        aria-hidden="true"
      />

      <div
        className={`
          fixed inset-0 overflow-y-auto
          flex items-center justify-center
          p-4 sm:p-0
        `}
      >
        <div
          ref={modalRef}
          className={`
            relative w-full transform rounded-lg 
            bg-white dark:bg-gray-800 
            text-left align-middle shadow-xl transition-all
            ${sizeClasses[size]}
            ${className}
            p-6 my-8 max-w-full
            max-h-[90vh] overflow-y-auto
          `}
          role="dialog"
          aria-labelledby="modal-headline"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3
              id="modal-headline"
              className="text-lg font-semibold text-gray-900 dark:text-white"
            >
              {title}
            </h3>

            {showCloseButton && (
              <button
                onClick={onClose}
                className="
                  text-gray-400 hover:text-gray-600 
                  dark:hover:text-gray-300 
                  rounded-md focus:outline-none focus:ring-2 
                  focus:ring-offset-2 focus:ring-blue-500
                  transition-all duration-200
                "
                aria-label="Close modal"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>

          {/* Content */}
          <div className="mb-4 text-gray-700 dark:text-gray-300">
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div
              className="
              flex flex-col sm:flex-row 
              sm:justify-end sm:space-x-2 
              space-y-2 sm:space-y-0 
              pt-4 border-t 
              border-gray-200 dark:border-gray-700
            "
            >
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;
