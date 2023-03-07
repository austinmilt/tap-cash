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
