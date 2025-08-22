// app/inventory/manajemen-stok/page.tsx
"use client"; // This component MUST be a Client Component

import { ManagementHeader, ManagementContent } from "@/components/ui";
import { useSharedData } from "@/contexts/StaticData";
import React, { useState } from "react"; // Essential for JSX
import { formatDate } from "@/utils/formatDate";
import { Button } from "@/components/ui";
import { FileText, Download } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const columns = [
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
      items.forEach(item => {
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
      const totalBottles = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
      return totalBottles.toLocaleString();
    },
  },
];

const excludedAccessors = ["productionDate", "items"];

export default function ManajemenStokPage() {
  const data = useSharedData();
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Function to process data for PDF export
  const processDataForPDF = (productions: any[]) => {
    const processedData: any[] = [];
    
    productions.forEach(production => {
      const productionDate = formatDate(new Date(production.productionDate));
      
      if (production.items && production.items.length > 0) {
        production.items.forEach((item: any) => {
          const bottlesPerCrate = item?.product?.bottlesPerCrate || 24;
          const totalCrates = Math.floor((item.quantity || 0) / bottlesPerCrate);
          
          processedData.push({
            tanggal: productionDate,
            kodeBarang: item?.product?.code || "-",
            namaBarang: item?.product?.name || "-",
            totalKrat: totalCrates,
            totalBotol: item.quantity || 0
          });
        });
      } else {
        // If no items, add a row with empty data
        processedData.push({
          tanggal: productionDate,
          kodeBarang: "-",
          namaBarang: "-",
          totalKrat: 0,
          totalBotol: 0
        });
      }
    });
    
    return processedData;
  };

  // Function to generate PDF
  const generatePDF = async () => {
    try {
      setIsGeneratingPDF(true);
      
      const doc = new jsPDF();
      const processedData = processDataForPDF(data.data || []);
      
      // Add title
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("Laporan Produksi", 14, 20);
      
      // Add generation date
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Digenerate pada: ${formatDate(new Date())}`, 14, 30);
      
      // Prepare table data
      const tableData = processedData.map(item => [
        item.tanggal,
        item.kodeBarang,
        item.namaBarang,
        item.totalKrat.toLocaleString(),
        item.totalBotol.toLocaleString()
      ]);
      
      // Add table
      autoTable(doc, {
        head: [['Tanggal', 'Kode Barang', 'Nama Barang', 'Total Krat', 'Total Botol']],
        body: tableData,
        startY: 40,
        theme: 'grid',
        styles: {
          fontSize: 8,
          cellPadding: 3,
        },
        headStyles: {
          fillColor: [63, 131, 248], // Blue color
          textColor: 255,
          fontStyle: 'bold',
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252], // Light gray
        },
        margin: { left: 14, right: 14 },
      });
      
      // Add summary
      const totalKrat = processedData.reduce((sum, item) => sum + item.totalKrat, 0);
      const totalBotol = processedData.reduce((sum, item) => sum + item.totalBotol, 0);
      
      const finalY = (doc as any).lastAutoTable.finalY || 40;
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("Total Keseluruhan:", 14, finalY + 15);
      doc.setFont("helvetica", "normal");
      doc.text(`Total Krat: ${totalKrat.toLocaleString()}`, 14, finalY + 25);
      doc.text(`Total Botol: ${totalBotol.toLocaleString()}`, 14, finalY + 35);
      
      // Save the PDF
      const fileName = `laporan-produksi-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Terjadi kesalahan saat membuat PDF');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-950 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Daftar Produksi
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Kelola data produksi barang
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={generatePDF}
            disabled={isGeneratingPDF || !data.data || data.data.length === 0}
            className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
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
        linkPath={`/${data.module}/${data.subModule}`}
      />
    </div>
  );
}
