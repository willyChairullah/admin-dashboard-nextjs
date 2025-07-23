"use client";

import React from "react";
import { FaExclamationTriangle } from "react-icons/fa";
import Modal from "./Modal";
import Button from "./Button";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  isLoading?: boolean;
  children: React.ReactNode;
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Konfirmasi Tindakan",
  isLoading = false,
  children,
}: ConfirmationModalProps) {
  // Komponen footer untuk tombol aksi
  const modalFooter = (
    <>
      <Button variant="outline" onClick={onClose} disabled={isLoading}>
        Batal
      </Button>
      <Button variant="danger" onClick={onConfirm} disabled={isLoading}>
        {isLoading ? "Memproses..." : "Ya, Lanjutkan"}
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      footer={modalFooter}
    >
      <div className="flex items-start gap-4">
        <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
          <FaExclamationTriangle
            className="h-6 w-6 text-red-600"
            aria-hidden="true"
          />
        </div>
        <div className="mt-0 text-left">
          <div className="text-sm text-gray-600 dark:text-gray-300">
            {children}
          </div>
        </div>
      </div>
    </Modal>
  );
}
