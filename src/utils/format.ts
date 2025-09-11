export const formatCurrency = (value: number | string): string => {
  return parseInt(value.toString()).toLocaleString() + 'đ';
};

export function formatTimeConver(dateTimeString: string): string {
  const date = new Date(dateTimeString + 'Z');

  const now = new Date();
  now.setHours(now.getUTCHours() + 7);

  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();

  const daysOfWeek = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  const dayOfWeek = daysOfWeek[date.getDay()];

  function getWeekNumber(d: Date): number {
    const start = new Date(d.getFullYear(), 0, 1);
    const days = Math.floor((d.getTime() - start.getTime()) / (24 * 60 * 60 * 1000));
    return Math.ceil((days + start.getDay() + 1) / 7);
  }

  const isSameWeek = date.getFullYear() === now.getFullYear() && getWeekNumber(date) === getWeekNumber(now);

  if (isSameWeek) {
    return `${hours}:${minutes}, ${dayOfWeek}`;
  }

  return `${day}-${month}-${year}`;
}

export function convertUTCtoVietnamTime(utcDateTimeString: string) {
  const utcDate = new Date(utcDateTimeString + 'Z');

  utcDate.setHours(utcDate.getHours() + 7);

  const vnYear = utcDate.getFullYear();
  const vnMonth = (utcDate.getMonth() + 1).toString().padStart(2, '0');
  const vnDay = utcDate.getDate().toString().padStart(2, '0');
  const vnHours = utcDate.getHours().toString().padStart(2, '0');
  const vnMinutes = utcDate.getMinutes().toString().padStart(2, '0');
  const vnSeconds = utcDate.getSeconds().toString().padStart(2, '0');

  return `${vnYear}-${vnMonth}-${vnDay} ${vnHours}:${vnMinutes}:${vnSeconds}`;
}

export const formatTimeWebhook = (timestamp: any) => {
  const date = new Date(timestamp);

  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  const seconds = String(date.getUTCSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};
export const formatPageIds = (pageIds: any) => {
  return pageIds.map((item: any) => item.id);
};

export const removeAccents = (str: string): string => {
  if (!str) return '';

  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
};

export const formatDate = (date: string) => {
  const dateObj = new Date(date + 'Z');
  const day = dateObj.getDate().toString().padStart(2, '0');
  const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
  const year = dateObj.getFullYear();
  const hours = dateObj.getHours().toString().padStart(2, '0');
  const minutes = dateObj.getMinutes().toString().padStart(2, '0');
  return `${day}-${month}-${year} ${hours}:${minutes}`;
};
