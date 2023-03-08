const USDC_FORMATTER = Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    minimumIntegerDigits: 1,
    maximumFractionDigits: 2,
});

export function formatUsd(amount: number): string {
    return USDC_FORMATTER.format(amount);
}

export function formatDate(unixTimestamp: number): string {
    const date = new Date(unixTimestamp * 1000); // Convert to milliseconds
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthIndex = date.getMonth();
    const year = date.getFullYear();
    const day = date.getDate();
    return `${monthNames[monthIndex]} ${day}, ${year}`;
  }
  