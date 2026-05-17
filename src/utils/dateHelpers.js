export const formatDate = (value) => {
  const date = value ? new Date(value) : new Date();
  return date.toISOString().slice(0, 10);
};

export const currentRwandaDate = () => {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Africa/Kigali',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  return formatter.format(new Date());
};

export const subtractDays = (value, days) => {
  const date = new Date(value);
  date.setUTCDate(date.getUTCDate() - days);
  return formatDate(date);
};
