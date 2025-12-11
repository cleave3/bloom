import { CycleData, SYMPTOM_LABELS, FLOW_LABELS, DayLog } from '@/types/cycle';
import { format, parseISO } from 'date-fns';

export function exportToCSV(cycleData: CycleData): string {
  const lines: string[] = [];
  
  // Header
  lines.push('Date,Type,Flow Intensity,Symptoms,Temperature (°F),Notes');
  
  // Period logs
  cycleData.periodLogs.forEach(log => {
    lines.push(`${log.startDate},Period Start,${FLOW_LABELS[log.flowIntensity]},,,`);
    if (log.endDate) {
      lines.push(`${log.endDate},Period End,,,,`);
    }
  });
  
  // Day logs
  cycleData.dayLogs.forEach(log => {
    const symptoms = log.symptoms.map(s => SYMPTOM_LABELS[s]).join('; ');
    const flow = log.flowIntensity ? FLOW_LABELS[log.flowIntensity] : '';
    const temp = log.temperature ? log.temperature.toFixed(1) : '';
    const notes = log.notes ? `"${log.notes.replace(/"/g, '""')}"` : '';
    lines.push(`${log.date},Daily Log,${flow},${symptoms},${temp},${notes}`);
  });
  
  return lines.join('\n');
}

export function downloadCSV(cycleData: CycleData): void {
  const csv = exportToCSV(cycleData);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `cycle-history-${format(new Date(), 'yyyy-MM-dd')}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function generatePDFContent(cycleData: CycleData): string {
  let content = `
    <html>
    <head>
      <title>Cycle History Report</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
        h1 { color: #F4A5AE; border-bottom: 2px solid #F4A5AE; padding-bottom: 10px; }
        h2 { color: #666; margin-top: 30px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
        th { background: #FFF9F5; color: #4A4A4A; }
        .period { background: #FFE5E8; }
        .summary-box { background: #FFF9F5; padding: 20px; border-radius: 10px; margin: 20px 0; }
        .stat { display: inline-block; margin-right: 40px; }
        .stat-value { font-size: 24px; font-weight: bold; color: #F4A5AE; }
        .stat-label { font-size: 14px; color: #666; }
      </style>
    </head>
    <body>
      <h1>🌸 Cycle History Report</h1>
      <p>Generated on ${format(new Date(), 'MMMM d, yyyy')}</p>
      
      <div class="summary-box">
        <div class="stat">
          <div class="stat-value">${cycleData.cycleLength}</div>
          <div class="stat-label">Cycle Length (days)</div>
        </div>
        <div class="stat">
          <div class="stat-value">${cycleData.periodLength}</div>
          <div class="stat-label">Period Length (days)</div>
        </div>
        <div class="stat">
          <div class="stat-value">${cycleData.periodLogs.length}</div>
          <div class="stat-label">Periods Logged</div>
        </div>
      </div>
      
      <h2>Period History</h2>
      <table>
        <tr>
          <th>Start Date</th>
          <th>Flow Intensity</th>
        </tr>
        ${cycleData.periodLogs
          .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
          .map(log => `
            <tr class="period">
              <td>${format(parseISO(log.startDate), 'MMMM d, yyyy')}</td>
              <td>${FLOW_LABELS[log.flowIntensity]}</td>
            </tr>
          `).join('')}
      </table>
      
      <h2>Daily Logs</h2>
      <table>
        <tr>
          <th>Date</th>
          <th>Flow</th>
          <th>Temperature</th>
          <th>Symptoms</th>
        </tr>
        ${cycleData.dayLogs
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 30)
          .map(log => `
            <tr>
              <td>${format(parseISO(log.date), 'MMM d, yyyy')}</td>
              <td>${log.flowIntensity ? FLOW_LABELS[log.flowIntensity] : '-'}</td>
              <td>${log.temperature ? log.temperature.toFixed(1) + '°F' : '-'}</td>
              <td>${log.symptoms.map(s => SYMPTOM_LABELS[s]).join(', ') || '-'}</td>
            </tr>
          `).join('')}
      </table>
      
      <p style="margin-top: 40px; font-size: 12px; color: #999;">
        This report is generated for informational purposes and to share with healthcare providers.
        It is not a substitute for professional medical advice.
      </p>
    </body>
    </html>
  `;
  
  return content;
}

export function downloadPDF(cycleData: CycleData): void {
  const content = generatePDFContent(cycleData);
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.print();
  }
}
