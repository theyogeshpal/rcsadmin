import * as XLSX from 'xlsx';

const SAMPLE_ROWS = [
  { phone: '919876543210', name: 'Sample User 1' },
  { phone: '919123456789', name: 'Sample User 2' },
  { phone: '918001234567', name: 'Sample User 3' },
  { phone: '+91 98000 11223', name: 'With formatting OK' },
  { phone: '9876543210', name: '10-digit local' },
];

/**
 * Downloads a sample .xlsx matching parser expectations (phone column).
 */
export function downloadSampleExcel(filename = 'campaign_numbers_sample.xlsx') {
  const sheet = XLSX.utils.json_to_sheet(SAMPLE_ROWS);
  sheet['!cols'] = [{ wch: 18 }, { wch: 22 }];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, 'Numbers');

  XLSX.writeFile(workbook, filename);
}
