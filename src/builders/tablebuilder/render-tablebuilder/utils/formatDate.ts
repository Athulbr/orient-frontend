export const formatDate = (iso: string): string => {
  const [, year, month, day] = iso.match(/^(\d{4})-(\d{2})-(\d{2})/) || [];
  if (!year) throw new Error('Invalid date format');
  return `${day}/${month}/${year}`;
};
