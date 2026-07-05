import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const CURRENCY = 'Rs.';

export const exportCustomerToPDF = (customer, filename) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header Background - Blue
  doc.setFillColor(30, 64, 175);
  doc.rect(0, 0, pageWidth, 45, 'F');
  
  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('Customer Statement', 14, 20);
  
  // Subtitle
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('Income Tracker', 14, 30);
  
  // Date
  doc.setFontSize(9);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 38);
  
  // Customer Info Box
  doc.setFillColor(248, 249, 250);
  doc.roundedRect(14, 52, pageWidth - 28, 28, 3, 3, 'F');
  
  doc.setTextColor(31, 41, 55);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Customer Details', 20, 62);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(107, 114, 128);
  doc.text(`Name: ${customer.name}`, 20, 69);
  doc.text(`Phone: ${customer.phone || 'N/A'}`, 20, 75);
  if (customer.details) {
    doc.text(`Details: ${customer.details.substring(0, 50)}`, 80, 75);
  }
  
  // Stats Cards
  const cardY = 88;
  const cardWidth = (pageWidth - 35) / 3;
  
  // Credit Card
  doc.setFillColor(236, 253, 245);
  doc.roundedRect(14, cardY, cardWidth, 26, 3, 3, 'F');
  doc.setTextColor(16, 185, 129);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('CREDIT', 18, cardY + 8);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`${CURRENCY} ${customer.totalReceived?.toFixed(2) || '0.00'}`, 18, cardY + 19);
  
  // Debit Card
  doc.setFillColor(239, 246, 255);
  doc.roundedRect(14 + cardWidth + 7, cardY, cardWidth, 26, 3, 3, 'F');
  doc.setTextColor(59, 130, 246);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('DEBIT', 18 + cardWidth + 7, cardY + 8);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`${CURRENCY} ${customer.totalSent?.toFixed(2) || '0.00'}`, 18 + cardWidth + 7, cardY + 19);
  
  // Due Card
  const dueColor = (customer.netBalance || 0) >= 0 ? [16, 185, 129] : [239, 68, 68];
  const dueBg = (customer.netBalance || 0) >= 0 ? [240, 253, 244] : [254, 242, 242];
  doc.setFillColor(dueBg[0], dueBg[1], dueBg[2]);
  doc.roundedRect(14 + (cardWidth + 7) * 2, cardY, cardWidth, 26, 3, 3, 'F');
  doc.setTextColor(dueColor[0], dueColor[1], dueColor[2]);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('DUE', 18 + (cardWidth + 7) * 2, cardY + 8);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  const duePrefix = (customer.netBalance || 0) >= 0 ? '+' : '-';
  doc.text(`${duePrefix}${CURRENCY} ${Math.abs(customer.netBalance || 0).toFixed(2)}`, 18 + (cardWidth + 7) * 2, cardY + 19);
  
  // Transactions Section
  doc.setTextColor(31, 41, 55);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('Transaction History', 14, 128);
  
  // Line under title
  doc.setDrawColor(229, 231, 235);
  doc.setLineWidth(0.5);
  doc.line(14, 131, pageWidth - 14, 131);
  
  // Transactions Table
  const tableData = customer.transactions?.map(t => [
    new Date(t.date).toLocaleDateString(),
    new Date(t.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    t.type === 'credit' ? 'Received' : 'Sent',
    t.description || '-',
    `${CURRENCY} ${t.amount.toFixed(2)}`
  ]) || [];
  
  autoTable(doc, {
    startY: 135,
    head: [['Date', 'Time', 'Type', 'Description', 'Amount']],
    body: tableData,
    theme: 'plain',
    headStyles: { 
      fillColor: [249, 250, 251],
      textColor: [107, 114, 128],
      fontSize: 9,
      fontStyle: 'bold'
    },
    styles: { 
      fontSize: 9,
      cellPadding: 6,
      lineColor: [243, 244, 246],
      lineWidth: 0.5,
      overflow: 'linebreak',
      cellWidth: 'wrap'
    },
    columnStyles: {
      0: { cellWidth: 25 },
      1: { cellWidth: 22 },
      2: { cellWidth: 25 },
      3: { cellWidth: 'auto' },
      4: { cellWidth: 32, halign: 'right', fontStyle: 'bold' }
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251]
    },
    margin: { left: 14, right: 14 }
  });
  
  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(156, 163, 175);
    doc.setFont('helvetica', 'normal');
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - 35, doc.internal.pageSize.getHeight() - 10);
    doc.text('Income Tracker', 14, doc.internal.pageSize.getHeight() - 10);
  }
  
  doc.save(filename);
};

export const exportAllCustomersToPDF = (customers, summary, filename) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header Background - Blue
  doc.setFillColor(30, 64, 175);
  doc.rect(0, 0, pageWidth, 45, 'F');
  
  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('All Customers Report', 14, 20);
  
  // Subtitle
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('Income Tracker', 14, 30);
  
  // Date
  doc.setFontSize(9);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 38);
  
  // Summary Stats Cards
  const cardY = 52;
  const cardWidth = (pageWidth - 35) / 3;
  
  // Credit Card
  doc.setFillColor(236, 253, 245);
  doc.roundedRect(14, cardY, cardWidth, 26, 3, 3, 'F');
  doc.setTextColor(16, 185, 129);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('TOTAL CREDIT', 18, cardY + 8);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`${CURRENCY} ${summary?.totalReceived?.toFixed(2) || '0.00'}`, 18, cardY + 19);
  
  // Debit Card
  doc.setFillColor(239, 246, 255);
  doc.roundedRect(14 + cardWidth + 7, cardY, cardWidth, 26, 3, 3, 'F');
  doc.setTextColor(59, 130, 246);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('TOTAL DEBIT', 18 + cardWidth + 7, cardY + 8);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`${CURRENCY} ${summary?.totalSent?.toFixed(2) || '0.00'}`, 18 + cardWidth + 7, cardY + 19);
  
  // Due Card
  const dueColor = (summary?.netBalance || 0) >= 0 ? [16, 185, 129] : [239, 68, 68];
  const dueBg = (summary?.netBalance || 0) >= 0 ? [240, 253, 244] : [254, 242, 242];
  doc.setFillColor(dueBg[0], dueBg[1], dueBg[2]);
  doc.roundedRect(14 + (cardWidth + 7) * 2, cardY, cardWidth, 26, 3, 3, 'F');
  doc.setTextColor(dueColor[0], dueColor[1], dueColor[2]);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('NET DUE', 18 + (cardWidth + 7) * 2, cardY + 8);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  const duePrefix = (summary?.netBalance || 0) >= 0 ? '+' : '-';
  doc.text(`${duePrefix}${CURRENCY} ${Math.abs(summary?.netBalance || 0).toFixed(2)}`, 18 + (cardWidth + 7) * 2, cardY + 19);
  
  // Customers Section
  doc.setTextColor(31, 41, 55);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('Customers List', 14, 92);
  
  // Line under title
  doc.setDrawColor(229, 231, 235);
  doc.setLineWidth(0.5);
  doc.line(14, 95, pageWidth - 14, 95);
  
  // Customers Table
  const tableData = customers.map(c => [
    c.name,
    c.phone || '-',
    `${CURRENCY} ${c.totalReceived?.toFixed(2) || '0.00'}`,
    `${CURRENCY} ${c.totalSent?.toFixed(2) || '0.00'}`,
    `${CURRENCY} ${Math.abs(c.netBalance || 0).toFixed(2)}`,
    c.transactionCount.toString()
  ]);
  
  autoTable(doc, {
    startY: 99,
    head: [['Name', 'Phone', 'Credit', 'Debit', 'Due', 'Txns']],
    body: tableData,
    theme: 'plain',
    headStyles: { 
      fillColor: [249, 250, 251],
      textColor: [107, 114, 128],
      fontSize: 9,
      fontStyle: 'bold'
    },
    styles: { 
      fontSize: 9,
      cellPadding: 6,
      lineColor: [243, 244, 246],
      lineWidth: 0.5,
      overflow: 'linebreak',
      cellWidth: 'wrap'
    },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { cellWidth: 30 },
      2: { cellWidth: 32, halign: 'right' },
      3: { cellWidth: 32, halign: 'right' },
      4: { cellWidth: 32, halign: 'right', fontStyle: 'bold' },
      5: { cellWidth: 18, halign: 'center' }
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251]
    },
    margin: { left: 14, right: 14 }
  });
  
  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(156, 163, 175);
    doc.setFont('helvetica', 'normal');
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - 35, doc.internal.pageSize.getHeight() - 10);
    doc.text('Income Tracker', 14, doc.internal.pageSize.getHeight() - 10);
  }
  
  doc.save(filename);
};