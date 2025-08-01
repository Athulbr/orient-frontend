export const formatDate = (iso: string): string => {
  try {
    const date = new Date(iso);
    if (isNaN(date.getTime())) throw new Error('Invalid date format');

    const day = date.getDate(); // 1-31
    const month = date.getMonth() + 1; // 0-indexed, so +1
    const year = date.getFullYear();

    const hours = date.getHours(); // 0-23
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();

    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  } catch (error) {
    console.error('Error while formatting date:', (error as Error).message);
    return 'Invalid Date';
  }
};
