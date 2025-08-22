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

    // First, sort productions by date from oldest to newest
    const sortedProductions = [...productions].sort((a, b) => {
      const dateA = new Date(a.productionDate);
      const dateB = new Date(b.productionDate);
      return dateA.getTime() - dateB.getTime();
    });

    sortedProductions.forEach((production) => {
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
            tanggalRaw: production.productionDate, // Keep raw date for sorting
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
          tanggalRaw: production.productionDate,
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

      // Create A4 PDF with better margins
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
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

      // Add company header with professional styling
      const pageWidth = doc.internal.pageSize.getWidth();
      
      // Company header background
      doc.setFillColor(41, 98, 255); // Professional blue
      doc.rect(0, 0, pageWidth, 35, 'F');
      
      // Company name
      doc.setTextColor(255, 255, 255); // White text
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text("CV HM JAYA BERKAH", pageWidth / 2, 15, { align: 'center' });
      
      // Company subtitle
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text("Laporan Produksi", pageWidth / 2, 25, { align: 'center' });
      
      // Reset text color for content
      doc.setTextColor(0, 0, 0);
      
      // Add report details with better spacing
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("LAPORAN PRODUKSI", pageWidth / 2, 50, { align: 'center' });
      
      // Add divider line
      doc.setLineWidth(0.5);
      doc.setDrawColor(200, 200, 200);
      doc.line(15, 55, pageWidth - 15, 55);
      
      // Report information
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Tanggal Cetak: ${formatDate(new Date())}`, 15, 65);
      doc.text(`Periode: ${periodText}`, 15, 72);
      
      // Add another divider
      doc.line(15, 80, pageWidth - 15, 80);

      // Prepare table data with row numbers
      const tableData = processedData.map((item, index) => [
        (index + 1).toString(), // Add row number starting from 1
        item.kodeProduksi,
        item.tanggal,
        item.kodeBarang,
        item.namaBarang,
        item.totalKrat.toLocaleString(),
        item.totalBotol.toLocaleString(),
        `Rp ${item.gajiPerBotol.toLocaleString()}`,
      ]);

      // Add professional table
      autoTable(doc, {
        head: [
          [
            "No",
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
        startY: 88,
        theme: "striped",
        styles: {
          fontSize: 9,
          cellPadding: 4,
          lineColor: [200, 200, 200],
          lineWidth: 0.1,
          textColor: [50, 50, 50],
          fontStyle: 'normal',
        },
        headStyles: {
          fillColor: [41, 98, 255], // Company blue
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 10,
          halign: 'center',
          valign: 'middle',
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252], // Light gray
        },
        columnStyles: {
          0: { cellWidth: 12, halign: 'center' }, // No
          1: { cellWidth: 25, halign: 'center' }, // Kode Produksi
          2: { cellWidth: 20, halign: 'center' }, // Tanggal
          3: { cellWidth: 18, halign: 'center' }, // Kode Barang
          4: { cellWidth: 35, halign: 'left' },   // Nama Barang
          5: { cellWidth: 18, halign: 'right' },  // Total Krat
          6: { cellWidth: 18, halign: 'right' },  // Total Botol
          7: { cellWidth: 25, halign: 'right' },  // Gaji per Botol
        },
        margin: { left: 15, right: 15 },
        tableWidth: 'auto',
        showHead: 'everyPage',
      });

      // Add professional summary section
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

      const finalY = (doc as any).lastAutoTable.finalY || 88;
      
      // Summary section with professional styling
      const summaryStartY = finalY + 15;
      
      // Summary header background
      doc.setFillColor(245, 245, 245);
      doc.rect(15, summaryStartY - 5, pageWidth - 30, 8, 'F');
      
      // Summary header
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(41, 98, 255);
      doc.text("RINGKASAN PRODUKSI", 20, summaryStartY);
      
      // Reset text color
      doc.setTextColor(0, 0, 0);
      
      // Summary data with better formatting
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      
      const summaryY = summaryStartY + 10;
      doc.text(`• Total Krat Diproduksi:`, 20, summaryY);
      doc.setFont("helvetica", "bold");
      doc.text(`${totalKrat.toLocaleString()} krat`, 70, summaryY);
      
      doc.setFont("helvetica", "normal");
      doc.text(`• Total Botol Diproduksi:`, 20, summaryY + 7);
      doc.setFont("helvetica", "bold");
      doc.text(`${totalBotol.toLocaleString()} botol`, 70, summaryY + 7);
      
      doc.setFont("helvetica", "normal");
      doc.text(`• Total Gaji Karyawan:`, 20, summaryY + 14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 150, 0); // Green for money
      doc.text(`Rp ${totalGajiKaryawan.toLocaleString()}`, 70, summaryY + 14);
      
      // Add footer
      const pageHeight = doc.internal.pageSize.getHeight();
      doc.setTextColor(100, 100, 100);
      doc.setFontSize(8);
      doc.setFont("helvetica", "italic");
      doc.text(
        `Dokumen ini digenerate secara otomatis oleh sistem CV HM JAYA BERKAH pada ${formatDate(new Date())}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );
      
      // Add page border
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.rect(10, 10, pageWidth - 20, pageHeight - 20);

      // Save the PDF with better filename
      const fileName = `Laporan-Produksi-CV-HM-JAYA-BERKAH-${
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
