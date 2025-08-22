// app/inventory/manajemen-stok/page.tsx
"use client"; // This component MUST be a Client Component

import { ManagementHeader, ManagementContent } from "@/components/ui";
import { useSharedData } from "@/contexts/StaticData";
import React, { useState, useMemo } from "react"; // Essential for JSX
import { formatDate } from "@/utils/formatDate";
import { Button } from "@/components/ui";
import { FileText, Download } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useRouter } from "next/navigation";

const columns = [
  {
    header: "Kode Produksi",
    accessor: "code",
    render: (value: string) => value || "-",
  },
  {
    header: "Tanggal",
    accessor: "productionDate",
    render: (value: Date) => formatDate(value),
  },
  {
    header: "Kode Barang",
    accessor: "items",
    cell: (info: { getValue: () => any[] }) => {
      const items = info.getValue();
      if (!items || items.length === 0) return "-";
      // Show first product code, or "Multiple" if more than one
      if (items.length === 1) {
        return items[0]?.product?.code || "-";
      }
      return `${items[0]?.product?.code || "-"} (+${items.length - 1} lainnya)`;
    },
  },
  {
    header: "Nama Barang",
    accessor: "items",
    cell: (info: { getValue: () => any[] }) => {
      const items = info.getValue();
      if (!items || items.length === 0) return "-";
      // Show first product name, or "Multiple" if more than one
      if (items.length === 1) {
        return items[0]?.product?.name || "-";
      }
      return `${items[0]?.product?.name || "-"} (+${items.length - 1} lainnya)`;
    },
  },
  {
    header: "Total Krat",
    accessor: "items",
    cell: (info: { getValue: () => any[] }) => {
      const items = info.getValue();
      if (!items || items.length === 0) return "0";

      let totalCrates = 0;
      items.forEach((item) => {
        const bottlesPerCrate = item?.product?.bottlesPerCrate || 24;
        const itemCrates = Math.floor((item.quantity || 0) / bottlesPerCrate);
        totalCrates += itemCrates;
      });

      return totalCrates.toLocaleString();
    },
  },
  {
    header: "Total Botol",
    accessor: "items",
    cell: (info: { getValue: () => any[] }) => {
      const items = info.getValue();
      if (!items || items.length === 0) return "0";
      const totalBottles = items.reduce(
        (sum, item) => sum + (item.quantity || 0),
        0
      );
      return totalBottles.toLocaleString();
    },
  },
];

const excludedAccessors = ["productionDate", "items"];

export default function ManajemenStokPage() {
  const data = useSharedData();
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [filteredDataForPDF, setFilteredDataForPDF] = useState<any[]>([]);
  const { user } = useCurrentUser();
  const router = useRouter();

  // Check if user has permission to add new production
  const allowedRoles = ["OWNER", "WAREHOUSE", "ADMIN"];
  const canAddProduction = user && allowedRoles.includes(user.role || "");

  // Function to process data for PDF export
  const processDataForPDF = (productions: any[]) => {
    const processedData: any[] = [];

    productions.forEach((production) => {
      const productionDate = formatDate(new Date(production.productionDate));
      const productionCode = production.code || "-";

      if (production.items && production.items.length > 0) {
        production.items.forEach((item: any) => {
          const bottlesPerCrate = item?.product?.bottlesPerCrate || 24;
          const totalCrates = Math.floor(
            (item.quantity || 0) / bottlesPerCrate
          );
          const salaryPerBottle = item.salaryPerBottle || 0;
          const totalSalary = (item.quantity || 0) * salaryPerBottle;

          processedData.push({
            kodeProduksi: productionCode,
            tanggal: productionDate,
            kodeBarang: item?.product?.code || "-",
            namaBarang: item?.product?.name || "-",
            totalKrat: totalCrates,
            totalBotol: item.quantity || 0,
            gajiPerBotol: salaryPerBottle,
            totalGaji: totalSalary,
          });
        });
      } else {
        // If no items, add a row with empty data
        processedData.push({
          kodeProduksi: productionCode,
          tanggal: productionDate,
          kodeBarang: "-",
          namaBarang: "-",
          totalKrat: 0,
          totalBotol: 0,
          gajiPerBotol: 0,
          totalGaji: 0,
        });
      }
    });

    return processedData;
  };

  // Function to generate PDF with current filtered data
  const generatePDF = async () => {
    try {
      setIsGeneratingPDF(true);

      const doc = new jsPDF();
      // Use filtered data from ManagementContent
      const dataToProcess =
        filteredDataForPDF.length > 0 ? filteredDataForPDF : data.data || [];
      const processedData = processDataForPDF(dataToProcess);

      // Get date range from filtered data
      let periodText = "Semua Data";
      if (dataToProcess.length > 0) {
        const dates = dataToProcess
          .map((item) => new Date(item.productionDate))
          .sort((a, b) => a.getTime() - b.getTime());
        const startDate = dates[0];
        const endDate = dates[dates.length - 1];

        if (dates.length === 1) {
          periodText = formatDate(startDate);
        } else {
          periodText = `${formatDate(startDate)} - ${formatDate(endDate)}`;
        }
      }

      // Add title
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("Laporan Produksi", 14, 20);

      // Add generation date
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Digenerate pada: ${formatDate(new Date())}`, 14, 30);
      doc.text(`Periode: ${periodText}`, 14, 40);

      // Prepare table data
      const tableData = processedData.map((item) => [
        item.kodeProduksi,
        item.tanggal,
        item.kodeBarang,
        item.namaBarang,
        item.totalKrat.toLocaleString(),
        item.totalBotol.toLocaleString(),
        `Rp ${item.gajiPerBotol.toLocaleString()}`,
      ]);

      // Add table
      autoTable(doc, {
        head: [
          [
            "Kode Produksi",
            "Tanggal",
            "Kode Barang",
            "Nama Barang",
            "Total Krat",
            "Total Botol",
            "Gaji per Botol",
          ],
        ],
        body: tableData,
        startY: 50,
        theme: "grid",
        styles: {
          fontSize: 8,
          cellPadding: 3,
        },
        headStyles: {
          fillColor: [63, 131, 248], // Blue color
          textColor: 255,
          fontStyle: "bold",
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252], // Light gray
        },
        margin: { left: 14, right: 14 },
      });

      // Add summary
      const totalKrat = processedData.reduce(
        (sum, item) => sum + item.totalKrat,
        0
      );
      const totalBotol = processedData.reduce(
        (sum, item) => sum + item.totalBotol,
        0
      );
      const totalGajiKaryawan = processedData.reduce(
        (sum, item) => sum + item.totalGaji,
        0
      );

      const finalY = (doc as any).lastAutoTable.finalY || 40;

      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("Total Keseluruhan:", 14, finalY + 15);
      doc.setFont("helvetica", "normal");
      doc.text(`Total Krat: ${totalKrat.toLocaleString()}`, 14, finalY + 25);
      doc.text(`Total Botol: ${totalBotol.toLocaleString()}`, 14, finalY + 35);
      doc.text(
        `Total Gaji Karyawan: Rp ${totalGajiKaryawan.toLocaleString()}`,
        14,
        finalY + 45
      );

      // Save the PDF
      const fileName = `laporan-produksi-${
        new Date().toISOString().split("T")[0]
      }.pdf`;
      doc.save(fileName);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Terjadi kesalahan saat membuat PDF");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-950 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between px-4 py-3 md:px-6 md:py-3 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-xl md:text-3xl font-semibold text-gray-900 dark:text-white">
          Daftar Produksi
        </h3>
        <div className="flex space-x-2">
          <Button
            size="medium"
            variant="primary"
            className="text-xs md:text-sm bg-blue-500"
            onClick={() => router.push("/inventory/produksi")}
          >
            Daftar
          </Button>
          {canAddProduction && (
            <Button
              size="medium"
              variant="secondary"
              className="text-xs md:text-sm"
              onClick={() => router.push("/inventory/produksi/create")}
            >
              Tambah Produksi
            </Button>
          )}
          <Button
            onClick={generatePDF}
            disabled={isGeneratingPDF || filteredDataForPDF.length === 0}
            className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2 text-xs md:text-sm"
            title={`Cetak PDF (${filteredDataForPDF.length} data sesuai filter)`}
          >
            {isGeneratingPDF ? (
              <>
                <Download className="h-4 w-4 animate-spin" />
                Membuat PDF...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4" />
                Cetak PDF
              </>
            )}
          </Button>
        </div>
      </div>

      <ManagementContent
        sampleData={data.data || []}
        columns={columns}
        excludedAccessors={excludedAccessors}
        dateAccessor="productionDate"
        emptyMessage="Belum ada data production logs"
        linkPath="/inventory/produksi"
        onFilteredDataChange={setFilteredDataForPDF}
      />
    </div>
  );
}
