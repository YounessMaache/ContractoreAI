import jsPDF from 'jspdf'
import 'jspdf-autotable'

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF
    lastAutoTable: { finalY: number }
  }
}

export async function generateInvoicePDF(document: any, profile: any) {
  const doc = new jsPDF()
  
  // Add logo if available
  if (profile.company_logo) {
    try {
      doc.addImage(profile.company_logo, 'PNG', 15, 10, 30, 30)
    } catch (e) {
      console.log('Could not add logo')
    }
  }
  
  // Header
  doc.setFontSize(24)
  doc.setTextColor(37, 99, 235)
  doc.text('INVOICE', 150, 20)
  
  // Company info
  doc.setFontSize(10)
  doc.setTextColor(0, 0, 0)
  if (profile.company_name) doc.text(profile.company_name, 15, 45)
  if (profile.address) doc.text(profile.address, 15, 50)
  if (profile.phone) doc.text(profile.phone, 15, 55)
  if (profile.business_email) doc.text(profile.business_email, 15, 60)
  
  // Invoice details
  doc.setFontSize(10)
  doc.text(`Invoice #: ${document.document_number}`, 150, 30, { align: 'right' })
  doc.text(`Date: ${formatDate(document.data.invoiceDate || document.created_at)}`, 150, 35, { align: 'right' })
  if (document.due_date) {
    doc.text(`Due: ${formatDate(document.due_date)}`, 150, 40, { align: 'right' })
  }
  
  // Client info
  doc.setFontSize(11)
  doc.setFont(undefined, 'bold')
  doc.text('Bill To:', 15, 75)
  doc.setFont(undefined, 'normal')
  doc.setFontSize(10)
  if (document.client_name) doc.text(document.client_name, 15, 80)
  if (document.client_address) doc.text(document.client_address, 15, 85)
  if (document.client_email) doc.text(document.client_email, 15, 90)
  if (document.client_phone) doc.text(document.client_phone, 15, 95)
  
  // Line items table
  const tableData = document.data.lineItems.map((item: any) => [
    item.description,
    item.quantity.toString(),
    `$${item.rate.toFixed(2)}`,
    `$${item.amount.toFixed(2)}`
  ])
  
  doc.autoTable({
    startY: 105,
    head: [['Description', 'Qty', 'Rate', 'Amount']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [37, 99, 235] },
  })
  
  // Totals
  const finalY = doc.lastAutoTable.finalY + 10
  doc.setFontSize(10)
  doc.text(`Subtotal:`, 150, finalY, { align: 'right' })
  doc.text(`$${document.data.subtotal.toFixed(2)}`, 195, finalY, { align: 'right' })
  
  if (document.data.taxAmount > 0) {
    doc.text(`Tax (${document.data.taxRate}%):`, 150, finalY + 5, { align: 'right' })
    doc.text(`$${document.data.taxAmount.toFixed(2)}`, 195, finalY + 5, { align: 'right' })
  }
  
  if (document.data.discount > 0) {
    doc.text(`Discount:`, 150, finalY + 10, { align: 'right' })
    doc.text(`-$${document.data.discount.toFixed(2)}`, 195, finalY + 10, { align: 'right' })
  }
  
  doc.setFontSize(12)
  doc.setFont(undefined, 'bold')
  const totalY = finalY + (document.data.taxAmount > 0 ? 15 : 10)
  doc.text(`Total:`, 150, totalY, { align: 'right' })
  doc.text(`$${document.data.total.toFixed(2)}`, 195, totalY, { align: 'right' })
  
  // Payment terms
  if (document.data.paymentTerms) {
    doc.setFont(undefined, 'normal')
    doc.setFontSize(9)
    doc.text(`Payment Terms: ${document.data.paymentTerms}`, 15, totalY + 10)
  }
  
  // Notes
  if (document.notes) {
    doc.setFontSize(9)
    doc.text('Notes:', 15, totalY + 20)
    doc.text(document.notes, 15, totalY + 25, { maxWidth: 180 })
  }
  
  // Add watermark for free users
  if (profile.subscription_status === 'free') {
    doc.setTextColor(220, 220, 220)
    doc.setFontSize(50)
    doc.text('TRIAL VERSION', 105, 150, { align: 'center', angle: 45 })
  }
  
  // Footer
  doc.setTextColor(100, 100, 100)
  doc.setFontSize(8)
  doc.text('Thank you for your business!', 105, 280, { align: 'center' })
  
  return doc
}

export async function generateReceiptPDF(document: any, profile: any) {
  const doc = new jsPDF()
  
  doc.setFontSize(24)
  doc.setTextColor(37, 99, 235)
  doc.text('RECEIPT', 105, 20, { align: 'center' })
  
  // Company info
  doc.setFontSize(10)
  doc.setTextColor(0, 0, 0)
  if (profile.company_name) doc.text(profile.company_name, 105, 35, { align: 'center' })
  if (profile.address) doc.text(profile.address, 105, 40, { align: 'center' })
  
  // Receipt details
  doc.setFontSize(11)
  doc.text(`Receipt #: ${document.document_number}`, 15, 60)
  doc.text(`Date: ${formatDate(document.data.receiptDate)}`, 15, 65)
  doc.text(`Received From: ${document.client_name}`, 15, 75)
  doc.text(`Payment Method: ${document.data.paymentMethod}`, 15, 80)
  
  // Amount box
  doc.setDrawColor(37, 99, 235)
  doc.setLineWidth(0.5)
  doc.rect(15, 90, 180, 30)
  doc.setFontSize(14)
  doc.setFont(undefined, 'bold')
  doc.text('Amount Received:', 20, 100)
  doc.setFontSize(20)
  doc.text(`$${document.data.amountReceived.toFixed(2)}`, 20, 112)
  
  // Received for
  if (document.data.receivedFor) {
    doc.setFont(undefined, 'normal')
    doc.setFontSize(10)
    doc.text('Received For:', 15, 130)
    doc.text(document.data.receivedFor, 15, 135, { maxWidth: 180 })
  }
  
  if (profile.subscription_status === 'free') {
    doc.setTextColor(220, 220, 220)
    doc.setFontSize(50)
    doc.text('TRIAL VERSION', 105, 180, { align: 'center', angle: 45 })
  }
  
  return doc
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export async function generateDocumentPDF(document: any, profile: any) {
  switch (document.document_type) {
    case 'invoice':
      return await generateInvoicePDF(document, profile)
    case 'receipt':
      return await generateReceiptPDF(document, profile)
    default:
      // Generic PDF for other document types
      const doc = new jsPDF()
      doc.setFontSize(20)
      doc.text(document.document_type.toUpperCase(), 105, 20, { align: 'center' })
      doc.setFontSize(12)
      doc.text(`Document #: ${document.document_number}`, 15, 40)
      doc.text(`Date: ${formatDate(document.created_at)}`, 15, 50)
      if (document.client_name) {
        doc.text(`Client: ${document.client_name}`, 15, 60)
      }
      return doc
  }
}
