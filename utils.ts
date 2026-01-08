
export const formatLocalTime = (dateStr?: string): string => {
  if (!dateStr) return '';

  // Heuristics to detect non-specific date strings (e.g., "Daily", "This Weekend")
  // If it matches these patterns, return as is.
  const isDescriptive = /daily|weekly|monthly|weekend|tbd|various|today|tomorrow|soon| - /i.test(dateStr);
  if (isDescriptive) return dateStr;

  const date = new Date(dateStr);
  
  // If invalid date, return original string
  if (isNaN(date.getTime())) return dateStr;

  // Format to user's local timezone
  try {
    return new Intl.DateTimeFormat('default', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      // Only show year if it's not current year to save space
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
    }).format(date);
  } catch (e) {
    return dateStr;
  }
};
