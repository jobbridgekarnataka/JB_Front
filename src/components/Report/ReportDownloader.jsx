// ReportDownloader.jsx
import React, { useRef } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { saveAs } from "file-saver";

// Instead of importing controllers one by one
import { Chart as ChartJS, registerables } from "chart.js";

// Register ALL chart.js components (safe for prod build)
ChartJS.register(...registerables);

import styles from './ReportDownloader.module.scss'
//ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);


const getValueByPath = (obj, path) => {
  // return path.split(".").reduce((acc, key) => acc?.[key], obj);
  const value = path.split(".").reduce((acc, key) => {
    if (Array.isArray(acc)) {
      // If we hit an array, map over it to get the values
      return acc.map(item => item?.[key]).filter(Boolean).join(", ");
    }
    return acc?.[key];
  }, obj);
  
  return value || "";
};

const getStatusSummary = (rows, columns) => {
  const statusCol = columns.find(c => c.header === "Status" || c.key === "status");
  const summary = {};

  rows.forEach((r) => {
    const status = statusCol ? getValueByPath(r, statusCol.key) : r.status;
    if (!status) return;
    summary[status] = (summary[status] || 0) + 1;
  });

  return summary;
};
export default function ReportDownloader({ data, title = "Report", columns ,memberData}) {
  const chartRef = useRef(null);

  // ================= PDF =================
  const downloadPDF = async() => {
    const doc = new jsPDF();

    // Header
    const drawHeader = () => {
    const logoLeft = "/FlagLogo.jpg"; // put your logo in /public folder
    const logoCenter = "/englishLogo.png"; // put your logo in /public folder
    const logoRight = "/tamilLogo.jpeg"; // put your logo in /public folder
    
    doc.addImage(logoLeft, "JPG", 15, 10, 25, 25);
    doc.addImage(logoCenter, "PNG", 40, 10, 73, 25);
    doc.addImage(logoRight, "JPEG", 113, 10, 74, 25);
    doc.setFontSize(10);
    doc.setTextColor(5, 64, 23);
    doc.line(15, 42, 195, 42);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");     // bold
    doc.text(
    "1st floor, #138, IFT Complex, Perambur High Road, Chennai, TamilNadu 600012",
    27,
    49
  );
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");   // default
  doc.text(
    "+91 9791522986  Email: solidaritytamilnadu@gmail.com  Website: https://www.solidaritytn.org/",
    27,
    56
  );
};
    // === First Header ===
    drawHeader();

    // Date
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");     // bold
  doc.text("Date: " + new Date().toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric"
        }), 160, 67);


  //To member

    // doc.text("To ",27,76);
    doc.setFontSize(11);
    let y = 76;
    doc.text(memberData?.name+", ",25,y);
    if(memberData?.memberType!==undefined){
      y+=5;
      doc.text(memberData?.memberType+", ",25,y);
    }
    y+=5;
    doc.text(memberData?.currentDistrict+", ",25,y);

    const formatDate = (dateStr) => {
        if (!dateStr) return "";
        const d = new Date(dateStr);
        if (isNaN(d)) return dateStr; // if not valid date, return as is
        return d.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric"
        });
      };

    // Table
    doc.setFont("helvetica", "normal");   // default
            autoTable(doc, {
            startY: 100,
            head: [columns.map(c => c.header)],
            body: data.map((row) => columns.map(c => {
                let value = getValueByPath(row, c.key) || "";
                // if this column is a date
                if (c.type === "date") {
                  value = formatDate(value);
                }
                return value;
              })),
            theme: "grid",
            headStyles: { fillColor: [5, 64, 23], textColor: 255 },
            alternateRowStyles: { fillColor: [240, 240, 240] },
            
      //  didDrawPage: () => {
      //   drawHeader(); // repeat on each page
      // },
      });
     


    // Get status summary for pie chart
    const summary = getStatusSummary(data, columns);
    let entries = Object.entries(summary).filter(([k, v]) => v && v > 0);
    let labels = entries.map(([k]) => k);
    let values = entries.map(([_, v]) => v);

    // Create a more reliable chart rendering function
    const generateChartImage = async () => {
      return new Promise((resolve) => {
        // Create a temporary container for the chart
        const container = document.createElement('div');
        container.style.position = 'absolute';
        container.style.left = '-9999px';
        container.style.top = '-9999px';
        container.style.width = '300px';
        container.style.height = '250px';
        document.body.appendChild(container);
        
        // Create canvas element
        const canvas = document.createElement('canvas');
        canvas.width = 300;
        canvas.height = 250;
        container.appendChild(canvas);
        
        // Create chart
        const ctx = canvas.getContext('2d');
        const chart = new ChartJS(ctx, {
          type: "pie",
          data: {
            labels: labels.length > 0 ? labels : ['No Data'],
            datasets: [{
              data: values.length > 0 ? values : [1],
              backgroundColor: [
                "#28a745", "#ffc107", "#dc3545", "#007bff", "#00cc00", "#ff66ff", 
                "#6f42c1", "#20c997", "#fd7e14", "#e83e8c"
              ].slice(0, Math.max(labels.length, 1)),
              borderWidth: 1,
            }],
          },
          options: {
            responsive: false,
            maintainAspectRatio: false,
            animation: {
              duration: 0 // Disable animation for faster rendering
            },
            plugins: {
              legend: {
                display: true,
                position: "top",
              },
            },
          },
        });
        
        // Wait for chart to render
        setTimeout(() => {
          const dataUrl = canvas.toDataURL("image/png");
          document.body.removeChild(container);
          chart.destroy();
          resolve(dataUrl);
        }, 100);
      });
    };

    // Generate chart image
    const chartImg = await generateChartImage();
    
    // Calculate position for chart
    let finalY = doc.lastAutoTable.finalY + 20;
    const pageHeight = doc.internal.pageSize.height;
    
    if (finalY + 100 > pageHeight) {
      doc.addPage();
      drawHeader();
      finalY = 100;
    }
    
    // Add chart to PDF
    doc.addImage(chartImg, "PNG", 20, finalY, 90, 70);
    
    // Add status summary table
    autoTable(doc, {
      startY: finalY,
      margin: { left: 120 },
      tableWidth: 'auto',
      styles: { fontSize: 11, minCellHeight: 18, cellPadding: 4 },
      head: [["Status", "Count"]],
      body: labels.map((label, i) => [label, values[i]]),
      theme: "grid",
      headStyles: { fillColor: [5, 64, 23], textColor: 255 },
    });
    
    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.text(
        `Page ${i} of ${pageCount}`,
        doc.internal.pageSize.getWidth() - 40,
        doc.internal.pageSize.getHeight() - 10
      );
      
    }

    doc.save(`${title}.pdf`);
  };

  // ================= CSV =================
 const downloadCSV = () => {
    const headers = columns.map(c => c.header);
    const rows = data.map(row => columns.map(c => {
      const value = getValueByPath(row, c.key) || "";
      // Handle values that might contain commas
      return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
    }));
    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `${title}.csv`);
  };

  

  return (
    <div className={styles.button_group}>
        <button className={styles.pdf} onClick={downloadPDF}>Download PDF</button>
        <button className={styles.csv} onClick={downloadCSV}>Download CSV</button>
        </div>
  );
}
