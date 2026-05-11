import { CURRENCY } from '@utsav/shared/constants';

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('ne-NP', {
    style: 'currency',
    currency: CURRENCY.CODE,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('977')) {
    return `+${cleaned}`;
  }
  if (cleaned.startsWith('0')) {
    return `+977${cleaned.slice(1)}`;
  }
  return `+977${cleaned}`;
};

export const validateNepaliPhone = (phone: string): boolean => {
  const phoneRegex = /^(?:\+977[- ])?(98|97)[0-9]{8}$/;
  return phoneRegex.test(phone);
};

export const formatDate = (date: Date | string): string => {
  const d = new Date(date);
  return new Intl.DateTimeFormat('en-NP', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(d);
};

export const formatDateTime = (date: Date | string): string => {
  const d = new Date(date);
  return new Intl.DateTimeFormat('en-NP', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
};

export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

export const getServiceCategoryIcon = (category: string): string => {
  const icons: Record<string, string> = {
    photographer: '📷',
    caterer: '🍽️',
    decorator: '🎨',
    'tent-supplier': '⛺',
    venue: '🏛️',
    band: '🎵',
    dj: '🎧',
    'makeup-artist': '💄',
    'flower-decorator': '💐',
    'mehndi-artist': '🖐️',
  };
  return icons[category] || '📦';
};

export const capitalizeFirst = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const cn = (...classes: (string | undefined | false | Record<string, boolean>)[]): string => {
  return classes
    .flatMap((cls) => {
      if (typeof cls === 'string') return cls;
      if (typeof cls === 'object' && cls !== null) {
        return Object.entries(cls)
          .filter(([, value]) => Boolean(value))
          .map(([key]) => key);
      }
      return [];
    })
    .filter(Boolean)
    .join(' ');
};