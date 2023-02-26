export interface CircleClient {
    transferUsdc(args: CircleDepositArgs): Promise<string | undefined>;
}

export interface CircleDepositArgs {
    destinationAtaString: string,
    amount: number
}