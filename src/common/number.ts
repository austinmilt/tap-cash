const USDC_FORMATTER = Intl.NumberFormat(undefined, {
    minimumFractionDigits: 2,
    minimumIntegerDigits: 1,
    maximumFractionDigits: 2,
});

const USDC_FORMATTER_SHORT = Intl.NumberFormat(undefined, {
    notation: "compact",
    compactDisplay: "short"
});

export function formatUsd(amount: number, options?: {
    leadingSymbol?: boolean
    short?: boolean;
    stripZeroCents?: boolean;
}): string {
    const leadingSymbol: boolean = options?.leadingSymbol ?? true;
    const short: boolean = options?.short ?? false;
    const stripZeroCents: boolean = options?.stripZeroCents ?? true;

    const useShortFormatter: boolean = short && (amount >= 10000);

    let result: string;
    if (useShortFormatter) {
        result = USDC_FORMATTER_SHORT.format(amount);

    } else {
        result = USDC_FORMATTER.format(amount);
    }

    if (leadingSymbol) {
        result = "$" + result;
    }

    if (stripZeroCents && !useShortFormatter && Number.isInteger(amount)) {
        result = result.slice(0, -3);
    }

    return result;
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
