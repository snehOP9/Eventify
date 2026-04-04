export const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(value);

export const formatDate = (value, options = {}) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    ...options
  }).format(new Date(value));

export const formatCompactNumber = (value) =>
  new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1
  }).format(value);

export const getEventStatus = (date) => {
  const eventDate = new Date(date);
  const today = new Date();

  if (eventDate < today) {
    return "Completed";
  }

  const diffDays = Math.ceil((eventDate - today) / (1000 * 60 * 60 * 24));

  if (diffDays <= 3) {
    return "Almost live";
  }

  return "Upcoming";
};
