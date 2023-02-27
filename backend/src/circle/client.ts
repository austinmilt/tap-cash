export interface CircleClient {
    transferUsdc(args: CircleDepositArgs): Promise<void>;
}

export interface CircleDepositArgs {
    destinationAtaString: string,
    amount: number
}