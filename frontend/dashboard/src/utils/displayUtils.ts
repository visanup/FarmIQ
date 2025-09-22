// Display Utilities
// Helper functions for safely rendering data that might be objects

/**
 * Safely renders a value that might be an object, string, or null
 * @param value - The value to render
 * @param fallback - Fallback value if value is null/undefined
 * @returns Safe string representation for React rendering
 */
export const safeRenderValue = (value: any, fallback: string = 'N/A'): string => {
  if (value === null || value === undefined) {
    return fallback;
  }
  
  if (typeof value === 'string') {
    return value;
  }
  
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value);
    } catch (error) {
      return '[Object]';
    }
  }
  
  return String(value);
};

/**
 * Safely renders a value with custom formatting
 * @param value - The value to render
 * @param formatter - Custom formatter function
 * @param fallback - Fallback value if value is null/undefined
 * @returns Formatted string representation
 */
export const safeRenderWithFormatter = (
  value: any, 
  formatter: (val: any) => string,
  fallback: string = 'N/A'
): string => {
  if (value === null || value === undefined) {
    return fallback;
  }
  
  try {
    return formatter(value);
  } catch (error) {
    return safeRenderValue(value, fallback);
  }
};

/**
 * Safely renders a boolean value as Active/Inactive
 * @param value - Boolean value or object with isActive property
 * @returns 'Active' or 'Inactive'
 */
export const safeRenderBoolean = (value: any): string => {
  if (typeof value === 'boolean') {
    return value ? 'Active' : 'Inactive';
  }
  
  if (typeof value === 'object' && value !== null) {
    if ('isActive' in value) {
      return value.isActive ? 'Active' : 'Inactive';
    }
  }
  
  return 'Unknown';
};

/**
 * Safely renders a number with unit
 * @param value - Number value or object with value and unit
 * @param unit - Default unit if not provided
 * @returns Formatted string with unit
 */
export const safeRenderNumber = (value: any, unit: string = ''): string => {
  if (typeof value === 'number') {
    return unit ? `${value} ${unit}` : String(value);
  }
  
  if (typeof value === 'object' && value !== null) {
    if ('value' in value && 'unit' in value) {
      return `${value.value} ${value.unit}`;
    }
    if ('value' in value) {
      return unit ? `${value.value} ${unit}` : String(value.value);
    }
  }
  
  return 'N/A';
};

/**
 * Safely renders a date
 * @param value - Date string, Date object, or timestamp
 * @param format - Date format (default: 'short')
 * @returns Formatted date string
 */
export const safeRenderDate = (value: any, format: 'short' | 'long' | 'time' = 'short'): string => {
  if (!value) return 'N/A';
  
  try {
    const date = new Date(value);
    if (isNaN(date.getTime())) return 'Invalid Date';
    
    switch (format) {
      case 'short':
        return date.toLocaleDateString();
      case 'long':
        return date.toLocaleString();
      case 'time':
        return date.toLocaleTimeString();
      default:
        return date.toLocaleDateString();
    }
  } catch (error) {
    return safeRenderValue(value);
  }
};

/**
 * Safely renders an array as comma-separated string
 * @param value - Array or single value
 * @param separator - Separator string (default: ', ')
 * @returns Comma-separated string
 */
export const safeRenderArray = (value: any, separator: string = ', '): string => {
  if (Array.isArray(value)) {
    return value.map(item => safeRenderValue(item)).join(separator);
  }
  
  if (value === null || value === undefined) {
    return 'N/A';
  }
  
  return safeRenderValue(value);
};

/**
 * Safely renders a nested object property
 * @param obj - Object to extract property from
 * @param path - Dot-separated path to property
 * @param fallback - Fallback value if property not found
 * @returns Safe string representation
 */
export const safeRenderNested = (obj: any, path: string, fallback: string = 'N/A'): string => {
  if (!obj || typeof obj !== 'object') {
    return fallback;
  }
  
  const keys = path.split('.');
  let current = obj;
  
  for (const key of keys) {
    if (current === null || current === undefined || typeof current !== 'object') {
      return fallback;
    }
    current = current[key];
  }
  
  return safeRenderValue(current, fallback);
};
