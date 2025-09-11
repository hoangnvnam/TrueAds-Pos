import { Platform } from 'react-native';

/**
 * Các mã hóa ký tự cho máy in nhiệt
 */
export enum PrinterEncoding {
  GBK = 'GBK',
  UTF8 = 'UTF-8', // UTF-8 hỗ trợ tốt hơn cho tiếng Việt
  GB18030 = 'GB18030',
  CP850 = 'CP850',
  CP1252 = 'CP1252',
  BIG5 = 'BIG5',
  CP437 = 'CP437', // Bảng mã DOS cơ bản cho các máy in nhiệt
}

/**
 * Mã trang cho máy in nhiệt
 * Mã trang ảnh hưởng đến cách hiển thị ký tự đặc biệt
 */
export enum PrinterCodepage {
  PC437 = 0, // USA, Standard Europe
  KATAKANA = 1, // Katakana
  PC850 = 2, // Multilingual
  PC860 = 3, // Portuguese
  PC863 = 4, // Canadian-French
  PC865 = 5, // Nordic
  PC857 = 6, // Turkish
  PC737 = 7, // Greek
  ISO_8859_7 = 8, // Greek
  WPC1252 = 16, // Western European Windows
  PC866 = 17, // Cyrillic
  PC852 = 18, // Latin 2
  PC858 = 19, // Euro
  THAI42 = 20, // Thai
  THAI11 = 21, // Thai
  THAI13 = 22, // Thai
  THAI14 = 23, // Thai
  THAI16 = 24, // Thai
  THAI17 = 25, // Thai
  THAI18 = 26, // Thai
}

/**
 * Phương thức xử lý tiếng Việt
 */
export enum VietnameseHandling {
  REMOVE_ACCENTS, // Loại bỏ dấu
  NORMALIZE, // Phân rã dấu
  CUSTOM_MAPPING, // Sử dụng bảng mã tùy chỉnh
}

/**
 * Các tùy chọn định dạng in cho máy in nhiệt
 */
export interface PrintFormatOptions {
  encoding?: string;
  codepage?: number;
  widthtimes?: number;
  heigthtimes?: number;
  fonttype?: number;
  width?: number;
  vietnameseMode?: VietnameseHandling; // Thêm tùy chọn xử lý tiếng Việt
}

/**
 * Khổ giấy in
 */
export enum PaperSize {
  Width58mm = 58,
  Width80mm = 80,
}

/**
 * Lấy tùy chọn định dạng in dựa trên khổ giấy
 * @param paperSize Kích thước giấy (58mm hoặc 80mm)
 * @param customOptions Tùy chọn tùy chỉnh
 * @returns Tùy chọn định dạng in
 */
export function getPrintOptions(
  paperSize: PaperSize = PaperSize.Width80mm,
  customOptions: Partial<PrintFormatOptions> = {},
  keepAccents: boolean = false,
): PrintFormatOptions | undefined {
  // Chỉ trả về tùy chọn cho Android vì iOS tự động xử lý
  if (Platform.OS !== 'android') {
    return undefined;
  }

  // Dựa vào ảnh, có thể thấy máy in nhiệt làm việc tốt nhất với ASCII
  // và các mã hóa cơ bản như CP437, PC850
  const baseOptions: PrintFormatOptions = {
    encoding: PrinterEncoding.CP437, // Thay đổi sang CP437 phổ biến hơn cho máy in nhiệt
    codepage: PrinterCodepage.PC850, // Bảng mã PC850 hỗ trợ nhiều ký tự Latin hơn PC437
    widthtimes: 1,
    heigthtimes: 1,
    fonttype: 1,
    vietnameseMode: VietnameseHandling.REMOVE_ACCENTS, // Luôn bỏ dấu để đảm bảo in đúng
  };

  // Điều chỉnh theo khổ giấy
  const options: PrintFormatOptions = {
    ...baseOptions,
    width: paperSize,
  };

  // Áp dụng tùy chọn tùy chỉnh
  return {
    ...options,
    ...customOptions,
  };
}

/**
 * Tạo chuỗi gạch ngang phù hợp với chiều rộng giấy
 * @param paperSize Kích thước giấy (58mm hoặc 80mm)
 * @returns Chuỗi gạch ngang
 */
export function getSeparator(paperSize: PaperSize = PaperSize.Width80mm): string {
  // 58mm ~ 32 ký tự, 80mm ~ 48 ký tự
  const charCount = paperSize === PaperSize.Width58mm ? 32 : 48;
  return '-'.repeat(charCount);
}

/**
 * Căn giữa văn bản trong một chiều rộng nhất định
 * @param text Văn bản cần căn giữa
 * @param paperSize Kích thước giấy (58mm hoặc 80mm)
 * @returns Văn bản đã căn giữa
 */
export function centerText(text: string, paperSize: PaperSize = PaperSize.Width80mm): string {
  const width = paperSize === PaperSize.Width58mm ? 32 : 48;
  const padding = Math.max(0, width - text.length);
  const leftPadding = Math.floor(padding / 2);

  return ' '.repeat(leftPadding) + text;
}

/**
 * Bỏ dấu tiếng Việt và chỉ giữ lại các ký tự ASCII
 * Tương tự hàm toAscii trong code JavaScript của bạn
 * @param text Văn bản tiếng Việt
 * @returns Văn bản không dấu
 */
export function toASCII(text: string): string {
  if (!text) return '';

  // Thay thế trực tiếp các ký tự tiếng Việt phổ biến trước
  text = text
    .replace(/[àáảãạăằắẳẵặâầấẩẫậ]/g, 'a')
    .replace(/[èéẻẽẹêềếểễệ]/g, 'e')
    .replace(/[ìíỉĩị]/g, 'i')
    .replace(/[òóỏõọôồốổỗộơờớởỡợ]/g, 'o')
    .replace(/[ùúủũụưừứửữự]/g, 'u')
    .replace(/[ỳýỷỹỵ]/g, 'y')
    .replace(/đ/g, 'd')
    .replace(/[ÀÁẢÃẠĂẰẮẲẴẶÂẦẤẨẪẬ]/g, 'A')
    .replace(/[ÈÉẺẼẸÊỀẾỂỄỆ]/g, 'E')
    .replace(/[ÌÍỈĨỊ]/g, 'I')
    .replace(/[ÒÓỎÕỌÔỒỐỔỖỘƠỜỚỞỠỢ]/g, 'O')
    .replace(/[ÙÚỦŨỤƯỪỨỬỮỰ]/g, 'U')
    .replace(/[ỲÝỶỸỴ]/g, 'Y')
    .replace(/Đ/g, 'D');

  // Sau đó mới normalize và bỏ dấu
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\x20-\x7E]/g, ''); // Loại bỏ các ký tự không phải ASCII thay vì thay bằng ?
}

/**
 * Định dạng số tiền theo định dạng Việt Nam
 * @param value Giá trị số
 * @returns Chuỗi đã định dạng
 */
export function formatMoney(value: number | string): string {
  const n = Number(String(value ?? 0).replace(/[^\d\-]/g, '')) || 0;
  return n.toLocaleString('vi-VN');
}

/**
 * Chuẩn hóa tiếng Việt để in
 * Chuyển đổi tiếng Việt sang dạng không dấu vì máy in nhiệt không hỗ trợ Unicode
 * @param text Văn bản tiếng Việt
 * @param keepAccents Tham số này không còn được sử dụng, luôn bỏ dấu
 * @returns Chuỗi đã chuẩn hóa không dấu
 */
export function normalizeVietnamese(text: string, keepAccents: boolean = false): string {
  // Từ ảnh thấy rõ: máy in nhiệt không xử lý được dấu tiếng Việt theo bất kỳ cách nào
  // Dù người dùng chọn keepAccents = true hay false, vẫn luôn bỏ dấu để tránh hiển thị lỗi

  // Luôn sử dụng phương pháp bỏ dấu hoàn toàn (đơn giản và hiệu quả nhất cho máy in nhiệt)
  return toASCII(text);
}

/**
 * Định dạng hóa đơn in cơ bản
 * @param title Tiêu đề hóa đơn
 * @param content Nội dung hóa đơn
 * @param footer Chân trang hóa đơn
 * @param paperSize Kích thước giấy (58mm hoặc 80mm)
 * @param keepAccents Giữ nguyên dấu tiếng Việt (true) hoặc chuyển thành không dấu (false)
 * @returns Chuỗi định dạng hóa đơn
 */
export function formatReceipt(
  title: string[] = ['TrueAds Inc.', 'www.trueads.ai'],
  content: string[] = ['Kết nối thành công'],
  footer: string[] = [new Date().toLocaleString()],
  paperSize: PaperSize = PaperSize.Width80mm,
  keepAccents: boolean = false, // Mặc định bỏ dấu
): string {
  const separator = getSeparator(paperSize);

  // Xử lý văn bản tiếng Việt - dựa trên ảnh biết rằng máy in không hỗ trợ Unicode
  // Luôn xử lý theo tùy chọn người dùng, nhưng đảm bảo kết quả là ASCII
  title = title.map((line) => normalizeVietnamese(line, keepAccents));
  content = content.map((line) => normalizeVietnamese(line, keepAccents));
  footer = footer.map((line) => normalizeVietnamese(line, keepAccents));

  // Căn giữa văn bản
  const formattedTitle = title.map((line) => centerText(line, paperSize)).join('\n');
  const formattedContent = content.map((line) => centerText(line, paperSize)).join('\n');
  const formattedFooter = footer.map((line) => centerText(line, paperSize)).join('\n');

  return `
${separator}
${formattedTitle}
${separator}

${formattedContent}
       
${separator}
${formattedFooter}
${separator}
`;
}
