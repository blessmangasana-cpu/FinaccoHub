export const formatDate = (value) => {
  const date = value ? new Date(value) : new Date();
  return date.toISOString().slice(0, 10);
};

export const currentRwandaDate = () => {
  const date = new Date(new Date().toLocaleString('en-US', { timeZone: 'Africa/Kigali' }));
  return date.toISOString().slice(0, 10);
};

export const subtractDays = (value, days) => {
  const date = new Date(value);
  date.setDate(date.getDate() - days);
  return formatDate(date);
};
