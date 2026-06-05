import * as XLSX from 'xlsx';

/**
 * Parse .xlsx into structured number array.
 * Uses first column or column named phone/mobile/number.
 */
export function parseExcelFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

        const numbers = [];
        for (const row of rows) {
          const keys = Object.keys(row);
          const phoneKey =
            keys.find((k) => /phone|mobile|number|msisdn/i.test(k)) || keys[0];
          const raw = row[phoneKey];
          if (raw === undefined || raw === '') continue;
          const digits = String(raw).replace(/\D/g, '');
          if (digits.length >= 8) numbers.push(digits);
        }

        resolve([...new Set(numbers)]);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(file);
  });
}
