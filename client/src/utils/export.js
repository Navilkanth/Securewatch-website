export function exportToCSV(data, filename = 'export') {
  if (!data?.length) return;

  const headers = [
    'actor', 'role', 'action', 'resource', 'resourceType',
    'ipAddress', 'region', 'severity', 'status', 'timestamp', 'riskScore',
  ];

  const rows = data.map((row) =>
    headers.map((h) => {
      const val = row[h] ?? '';
      const str = String(val).includes(',') ? `"${val}"` : val;
      return str;
    }).join(',')
  );

  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export async function exportToPDF(data, filename = 'export') {
  const { default: jsPDF } = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');

  const doc = new jsPDF({ orientation: 'landscape' });
  doc.setFontSize(16);
  doc.text('SecureWatch Audit Log Export', 14, 15);
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 22);

  autoTable(doc, {
    startY: 28,
    head: [['Actor', 'Action', 'Severity', 'Status', 'IP', 'Region', 'Timestamp']],
    body: data.slice(0, 100).map((row) => [
      row.actor, row.action, row.severity, row.status,
      row.ipAddress, row.region,
      new Date(row.timestamp).toLocaleString(),
    ]),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [37, 99, 235] },
  });

  doc.save(`${filename}-${new Date().toISOString().slice(0, 10)}.pdf`);
}
