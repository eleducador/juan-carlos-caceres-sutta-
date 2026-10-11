import jsPDF from 'jspdf';
import { Campaign, Contact } from '../types';

export class PdfReportService {
  static generateExecutiveReport(
    campaigns: Campaign[],
    contacts: Contact[],
    companyName: string = 'WhatsBroadcast Pro'
  ) {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const totalSent = campaigns.reduce((acc, c) => acc + c.stats.sent, 0);
    const totalDelivered = campaigns.reduce((acc, c) => acc + c.stats.delivered, 0);
    const totalRead = campaigns.reduce((acc, c) => acc + c.stats.read, 0);
    const totalReplied = campaigns.reduce((acc, c) => acc + c.stats.replied, 0);
    const totalFailed = campaigns.reduce((acc, c) => acc + c.stats.failed, 0);

    const deliveryRate = totalSent > 0 ? ((totalDelivered / totalSent) * 100).toFixed(1) : '0.0';
    const readRate = totalDelivered > 0 ? ((totalRead / totalDelivered) * 100).toFixed(1) : '0.0';
    const replyRate = totalRead > 0 ? ((totalReplied / totalRead) * 100).toFixed(1) : '0.0';

    // Header background bar
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, 210, 32, 'F');

    // Title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('REPORTE EJECUTIVO DE MENSAJERÍA WHATSAPP', 14, 15);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(52, 211, 153); // emerald-400
    doc.text('OFICIAL META CLOUD API - ANALÍTICA EN TIEMPO REAL', 14, 23);

    const todayStr = new Date().toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text(`Generado: ${todayStr}`, 135, 23);

    // Organization info box
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`Empresa / Cuenta: ${companyName}`, 14, 42);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(`Total contactos registrados: ${contacts.length}  |  Campañas ejecutadas: ${campaigns.length}`, 14, 48);

    // KPI Cards row
    const kpiY = 56;
    const cardWidth = 43;
    const cardHeight = 24;

    const kpis = [
      { label: 'TOTAL ENVIADOS', value: totalSent.toLocaleString(), sub: 'Disparos oficiales' },
      { label: 'TASA ENTREGA', value: `${deliveryRate}%`, sub: `${totalDelivered} recibidos` },
      { label: 'TASA APERTURA', value: `${readRate}%`, sub: `${totalRead} leídos` },
      { label: 'TASA RESPUESTA', value: `${replyRate}%`, sub: `${totalReplied} respuestas` },
    ];

    kpis.forEach((kpi, idx) => {
      const x = 14 + idx * (cardWidth + 5);
      doc.setFillColor(248, 250, 252); // slate-50
      doc.setDrawColor(226, 232, 240); // slate-200
      doc.roundedRect(x, kpiY, cardWidth, cardHeight, 2, 2, 'FD');

      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(100, 116, 139);
      doc.text(kpi.label, x + 4, kpiY + 6);

      doc.setFontSize(14);
      doc.setTextColor(15, 23, 42);
      doc.text(kpi.value, x + 4, kpiY + 15);

      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(148, 163, 184);
      doc.text(kpi.sub, x + 4, kpiY + 20);
    });

    // Section title
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('Desglose de Campañas Recientes', 14, 90);

    // Table Header
    const tableY = 96;
    doc.setFillColor(241, 245, 249); // slate-100
    doc.rect(14, tableY, 182, 8, 'F');

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text('Campaña', 16, tableY + 5.5);
    doc.text('Plantilla', 65, tableY + 5.5);
    doc.text('Enviados', 110, tableY + 5.5);
    doc.text('Entregados', 130, tableY + 5.5);
    doc.text('Leídos (%)', 155, tableY + 5.5);
    doc.text('Respuestas', 178, tableY + 5.5);

    // Table Rows
    let currentY = tableY + 8;
    campaigns.slice(0, 8).forEach((camp, index) => {
      if (index % 2 === 1) {
        doc.setFillColor(248, 250, 252);
        doc.rect(14, currentY, 182, 8, 'F');
      }

      const campReadRate = camp.stats.delivered > 0
        ? `${((camp.stats.read / camp.stats.delivered) * 100).toFixed(0)}%`
        : '0%';

      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(30, 41, 59);

      // Truncate title if long
      const safeTitle = camp.title.length > 25 ? camp.title.substring(0, 22) + '...' : camp.title;
      doc.text(safeTitle, 16, currentY + 5.5);
      doc.text(camp.templateName, 65, currentY + 5.5);
      doc.text(camp.stats.sent.toString(), 110, currentY + 5.5);
      doc.text(camp.stats.delivered.toString(), 130, currentY + 5.5);
      doc.text(campReadRate, 155, currentY + 5.5);
      doc.text(camp.stats.replied.toString(), 178, currentY + 5.5);

      currentY += 8;
    });

    // Policy & Security Section
    const securityY = currentY + 12;
    doc.setFillColor(236, 253, 245); // emerald-50
    doc.setDrawColor(167, 243, 208); // emerald-200
    doc.roundedRect(14, securityY, 182, 28, 2, 2, 'FD');

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(6, 95, 70); // emerald-800
    doc.text('Cumplimiento Normativo y Políticas Meta Cloud API', 18, securityY + 7);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(4, 120, 87);
    doc.text('• Tráfico verificado a través de la infraestructura oficial de Meta WhatsApp Cloud.', 18, securityY + 13);
    doc.text('• Mecanismos automáticos de exclusión voluntaria (Opt-out STOP/BAJA) activos.', 18, securityY + 18);
    doc.text('• Cifrado en tránsito TLS 1.3 y protección de identificadores E.164 según RGPD.', 18, securityY + 23);

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text('WhatsBroadcast Pro · Solución Empresarial WhatsApp Business Cloud API', 14, 285);
    doc.text(`Página 1 de 1`, 180, 285);

    // Save PDF
    doc.save(`Reporte_WhatsBroadcast_${new Date().toISOString().slice(0, 10)}.pdf`);
  }
}
