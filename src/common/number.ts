const USDC_FORMATTER = Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    minimumIntegerDigits: 1,
    maximumFractionDigits: 2,
});

const USDC_FORMATTER_NO_DECIMAL = Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    minimumIntegerDigits: 1,
    maximumFractionDigits: 0,
});

export function formatUsd(amount: number): string {
    if (amount < 1000) {return USDC_FORMATTER.format(amount)}
    return USDC_FORMATTER_NO_DECIMAL.format(amount);
}

const DATE_FORMATTER = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
});

export function formatDate(unixTimestamp: number): string {
    const date = new Date(unixTimestamp * 1000); // Convert to milliseconds
    return DATE_FORMATTER.format(date);
}