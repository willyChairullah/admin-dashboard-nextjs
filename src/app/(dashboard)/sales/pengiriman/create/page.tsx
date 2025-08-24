"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Input } from "@/components/ui/common";
import Loading from "@/components/ui/common/Loading";
import { FormGroup } from "@/components/ui/forms";
import { Select } from "@/components/ui/data";
import { InputDate } from "@/components/ui/common";
import { toast } from "sonner";
import {
  getAvailableInvoicesForDelivery,
  createDelivery,
} from "@/lib/actions/deliveries";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export default function CreateDeliveryPage() {
  const router = useRouter();
  const { user } = useCurrentUser();
  const [isLoading, setIsLoading] = useState(false);
  const [availableInvoices, setAvailableInvoices] = useState<any[]>([]);
  const [loadingInvoices, setLoadingInvoices] = useState(true);

  const [formData, setFormData] = useState({
    invoiceId: "",
    helperId: user?.id || "",
    deliveryDate: new Date() as Date | null,
    notes: "",
  });

  useEffect(() => {
    loadAvailableInvoices();
  }, []);

  const loadAvailableInvoices = async () => {
    try {
      // Since the database hasn't been migrated yet, we'll use mock data
      // TODO: Uncomment this when migration is complete
      // const invoices = await getAvailableInvoicesForDelivery();
      // setAvailableInvoices(invoices);

      // Mock data for now
      setAvailableInvoices([
        {
          id: "1",
          code: "INV/08/2025/0001",
          totalAmount: 1500000,
          customer: {
            name: "PT. Contoh Jaya",
            address: "Jl. Contoh No. 123, Jakarta",
          },
        },
        {
          id: "2",
          code: "INV/08/2025/0002",
          totalAmount: 2300000,
          customer: {
            name: "CV. Maju Bersama",
            address: "Jl. Maju No. 456, Bandung",
          },
        },
      ]);
    } catch (error) {
      console.error("Error loading invoices:", error);
      toast.error("Gagal memuat data invoice");
    } finally {
      setLoadingInvoices(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.invoiceId) {
      toast.error("Pilih invoice terlebih dahulu");
      return;
    }

    setIsLoading(true);
    try {
      // Since the database hasn't been migrated yet, we'll show a success message
      // TODO: Uncomment this when migration is complete
      // await createDelivery({
      //   invoiceId: formData.invoiceId,
      //   helperId: formData.helperId,
      //   deliveryDate: formData.deliveryDate,
      //   status: "PENDING",
      //   notes: formData.notes,
      // });

      toast.success("Pengiriman berhasil dibuat!");
      router.push("/sales/pengiriman");
    } catch (error) {
      console.error("Error creating delivery:", error);
      toast.error("Gagal membuat pengiriman");
    } finally {
      setIsLoading(false);
    }
  };

  if (loadingInvoices) {
    return <Loading />;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Buat Pengiriman Baru
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Pilih invoice yang telah dikirim untuk dibuat pengiriman
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <FormGroup>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Invoice <span className="text-red-500">*</span>
              </label>
              <Select
                options={availableInvoices.map(invoice => ({
                  value: invoice.id,
                  label: `${invoice.code} - ${
                    invoice.customer?.name
                  } (${new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: "IDR",
                    minimumFractionDigits: 0,
                  }).format(invoice.totalAmount)})`,
                }))}
                value={formData.invoiceId}
                onChange={value =>
                  setFormData(prev => ({ ...prev, invoiceId: value }))
                }
                placeholder="Pilih Invoice"
                className="w-full"
                searchable={true}
              />
            </FormGroup>

            <FormGroup>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tanggal Pengiriman <span className="text-red-500">*</span>
              </label>
              <InputDate
                value={formData.deliveryDate}
                onChange={date =>
                  setFormData(prev => ({ ...prev, deliveryDate: date }))
                }
              />
            </FormGroup>

            <FormGroup>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Catatan
              </label>
              <textarea
                value={formData.notes}
                onChange={e =>
                  setFormData(prev => ({ ...prev, notes: e.target.value }))
                }
                placeholder="Catatan tambahan untuk pengiriman..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                rows={3}
              />
            </FormGroup>

            {formData.invoiceId && (
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h3 className="font-medium text-blue-900 dark:text-blue-400 mb-2">
                  Detail Invoice
                </h3>
                {(() => {
                  const selectedInvoice = availableInvoices.find(
                    inv => inv.id === formData.invoiceId
                  );
                  return selectedInvoice ? (
                    <div className="text-sm text-blue-800 dark:text-blue-300">
                      <p>
                        <strong>Customer:</strong>{" "}
                        {selectedInvoice.customer?.name}
                      </p>
                      <p>
                        <strong>Alamat:</strong>{" "}
                        {selectedInvoice.customer?.address}
                      </p>
                      <p>
                        <strong>Total:</strong>{" "}
                        {new Intl.NumberFormat("id-ID", {
                          style: "currency",
                          currency: "IDR",
                          minimumFractionDigits: 0,
                        }).format(selectedInvoice.totalAmount)}
                      </p>
                    </div>
                  ) : null;
                })()}
              </div>
            )}

            <div className="flex gap-4 pt-6">
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.back()}
                className="flex-1"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !formData.invoiceId}
                className="flex-1"
              >
                {isLoading ? "Menyimpan..." : "Buat Pengiriman"}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}
