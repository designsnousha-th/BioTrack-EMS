import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBillingDto } from './dto/create-billing.dto';
import PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class AccountsService {
  private uploadsDir = path.join(__dirname, '..', '..', 'uploads');

  constructor(private prisma: PrismaService) {
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }
  }

  async createQuotation(dto: CreateBillingDto) {
    const quotationNumber = `QTN-${Date.now()}`;
    const customer = await this.prisma.customer.findUnique({ where: { id: dto.customerId } });
    if (!customer) throw new NotFoundException('Customer not found');

    const quotation = await this.prisma.quotation.create({
      data: {
        quotationNumber,
        customerId: dto.customerId,
        serviceCallId: dto.serviceCallId,
        amount: dto.amount,
        taxAmount: dto.taxAmount,
        totalAmount: dto.totalAmount,
        status: 'DRAFT',
      },
    });

    const pdfFilename = `quotation_${quotation.id}.pdf`;
    const pdfPath = path.join(this.uploadsDir, pdfFilename);
    await this.generatePdfDocument('QUOTATION', quotationNumber, customer, dto, pdfPath);

    return this.prisma.quotation.update({
      where: { id: quotation.id },
      data: { pdfFile: `/uploads/${pdfFilename}` },
    });
  }

  async createInvoice(dto: CreateBillingDto) {
    const invoiceNumber = `INV-${Date.now()}`;
    const customer = await this.prisma.customer.findUnique({ where: { id: dto.customerId } });
    if (!customer) throw new NotFoundException('Customer not found');

    const invoice = await this.prisma.invoice.create({
      data: {
        invoiceNumber,
        customerId: dto.customerId,
        serviceCallId: dto.serviceCallId,
        amount: dto.amount,
        taxAmount: dto.taxAmount,
        totalAmount: dto.totalAmount,
        paymentStatus: 'UNPAID',
      },
    });

    const pdfFilename = `invoice_${invoice.id}.pdf`;
    const pdfPath = path.join(this.uploadsDir, pdfFilename);
    await this.generatePdfDocument('INVOICE', invoiceNumber, customer, dto, pdfPath);

    return this.prisma.invoice.update({
      where: { id: invoice.id },
      data: { pdfFile: `/uploads/${pdfFilename}` },
    });
  }

  async findAllInvoices() {
    return this.prisma.invoice.findMany({
      include: { customer: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAllQuotations() {
    return this.prisma.quotation.findMany({
      include: { customer: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateInvoiceStatus(id: number, status: 'UNPAID' | 'PARTIAL' | 'PAID') {
    const invoice = await this.prisma.invoice.findUnique({ where: { id } });
    if (!invoice) throw new NotFoundException('Invoice not found');

    return this.prisma.invoice.update({
      where: { id },
      data: {
        paymentStatus: status,
        paymentDate: status === 'PAID' ? new Date() : null,
      },
    });
  }

  private async generatePdfDocument(
    type: 'INVOICE' | 'QUOTATION',
    docNumber: string,
    customer: any,
    dto: CreateBillingDto,
    outputPath: string,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const writeStream = fs.createWriteStream(outputPath);

      doc.pipe(writeStream);

      doc.fillColor('#1A365D')
         .fontSize(20)
         .text('BIOTRACK EMS SaaS', 50, 50);
      doc.fontSize(10)
         .fillColor('#718096')
         .text('Biomedical Equipment Management System', 50, 75)
         .text('123 Healthway St, Medical City', 50, 90);

      doc.fontSize(16)
         .fillColor('#2D3748')
         .text(`${type} REPORT`, 400, 50, { align: 'right' });
      doc.fontSize(10)
         .fillColor('#718096')
         .text(`Number: ${docNumber}`, 400, 75, { align: 'right' })
         .text(`Date: ${new Date().toLocaleDateString()}`, 400, 90, { align: 'right' });

      doc.moveTo(50, 120).lineTo(550, 120).stroke('#E2E8F0');

      doc.fillColor('#2D3748')
         .fontSize(12)
         .text('Billed To:', 50, 140);
      doc.fontSize(10)
         .fillColor('#4A5568')
         .text(customer.name, 50, 160)
         .text(customer.address, 50, 175)
         .text(`${customer.district}, ${customer.state} - ${customer.pin}`, 50, 190);
      if (customer.gst) {
        doc.text(`GSTIN: ${customer.gst}`, 50, 205);
      }

      let y = 250;
      doc.rect(50, y, 500, 25).fill('#F7FAFC');
      doc.fillColor('#2D3748')
         .fontSize(10)
         .text('Description', 60, y + 7)
         .text('Amount (INR)', 450, y + 7, { align: 'right' });

      y += 25;
      doc.rect(50, y, 500, 35).stroke('#E2E8F0');
      doc.fillColor('#4A5568')
         .text(`Biomedical Equipment Service & Labour Support (Ref Call: ${dto.serviceCallId || 'N/A'})`, 60, y + 12)
         .text(dto.amount.toFixed(2), 450, y + 12, { align: 'right' });

      y += 50;
      doc.text('Subtotal:', 350, y)
         .text(`INR ${dto.amount.toFixed(2)}`, 450, y, { align: 'right' });

      y += 15;
      doc.text('CGST/SGST (18%):', 350, y)
         .text(`INR ${dto.taxAmount.toFixed(2)}`, 450, y, { align: 'right' });

      y += 20;
      doc.moveTo(350, y - 5).lineTo(550, y - 5).stroke('#E2E8F0');
      doc.fillColor('#1A365D')
         .fontSize(12)
         .text('Total Amount:', 350, y)
         .text(`INR ${dto.totalAmount.toFixed(2)}`, 450, y, { align: 'right' });

      doc.fontSize(8)
         .fillColor('#A0AEC0')
         .text('Thank you for choosing BioTrack EMS. For support email support@biotrackems.com', 50, 700, { align: 'center' });

      doc.end();

      writeStream.on('finish', () => resolve());
      writeStream.on('error', (err) => reject(err));
    });
  }
}
