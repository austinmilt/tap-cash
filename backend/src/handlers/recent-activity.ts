
//TODO tests

import { UNKNOWN_USER_PROFILE } from "../constants";
import { DatabaseClient } from "../db/client";
import { FirestoreClient } from "../db/firestore";
import { PublicKey } from "../helpers/solana";
import { TapCashClient } from "../program/sdk";
import { MemberActivityType, MemberActivity } from "../shared/activity";
import { Currency } from "../shared/currency";
import { EmailAddress } from "../shared/member";

export interface RecentActivityArgs {
    memberEmail: EmailAddress;
    limit: number;
}

const DB_CLIENT: DatabaseClient = FirestoreClient.ofDefaults();
const TAP_CLIENT: TapCashClient = TapCashClient.ofDefaults();

/**
 * 
 * Find the most recent activity for a member by querying their USDC address on chain
 * 
 * @param request { memberEmail: string, limit: number}
 * @returns { MemberActivity[] }
 */
export async function getRecentActivity(request: RecentActivityArgs): Promise<MemberActivity[]> {
    const { usdcAddress } = await DB_CLIENT.getMemberAccountsByEmail(request.memberEmail);
    const recentActivity = await TAP_CLIENT.getRecentActivity(usdcAddress, request.limit);
    // Filter only transactions that have a valid otherPartyAddress (to fetch member profiles)
    const addressesToQuery = recentActivity.filter((activity) => activity.otherPartyAddress);
    const memberProfiles = await DB_CLIENT.getMembersByUsdcAddress(addressesToQuery.map((activity) => activity.otherPartyAddress as PublicKey));
    
    let recentActivityWithMemberDetail: MemberActivity[] = [];
    for (const activity of recentActivity) {
        const { bankChange, memberChange, otherPartyChange, member, unixTimestamp, otherPartyAddress } = activity;
        const memberString = member.toBase58();
        let txType: MemberActivityType = MemberActivityType.UNKNOWN;
        if (bankChange < 0) { txType = MemberActivityType.DEPOSIT }
        else if (bankChange > 0) { txType = MemberActivityType.WITHDRAW }
        else if (otherPartyChange < 0 && memberChange > 0) { txType = MemberActivityType.RECEIVE }
        else if (otherPartyChange > 0 && memberChange < 0) { txType = MemberActivityType.SEND }
        let memberActivity: MemberActivity;
        switch (txType) {
            case MemberActivityType.DEPOSIT:
                memberActivity = {
                    type: MemberActivityType.DEPOSIT,
                    deposit: {
                        amount: bankChange,
                        account: memberString,
                        currency: Currency.USD
                    },
                    unixTimestamp
                }
                break;
            case MemberActivityType.WITHDRAW:
                memberActivity = {
                    type: MemberActivityType.WITHDRAW,
                    withdraw: {
                        amount: bankChange,
                        source: memberString,
                        currency: Currency.USD
                    },
                    unixTimestamp
                }
                break;
            case MemberActivityType.RECEIVE:
                memberActivity = {
                    type: MemberActivityType.RECEIVE,
                    receive: {
                        amount: memberChange,
                        // Based on our filtering above, we know that otherPartyAddress is not null
                        sender: memberProfiles.get(otherPartyAddress as PublicKey) ?? UNKNOWN_USER_PROFILE,
                        currency: Currency.USD
                    },
                    unixTimestamp
                }
                break;
            case MemberActivityType.SEND:
                memberActivity = {
                    type: MemberActivityType.SEND,
                    send: {
                        amount: memberChange,
                        // Based on our filtering above, we know that otherPartyAddress is not null
                        recipient: memberProfiles.get(otherPartyAddress as PublicKey) ?? UNKNOWN_USER_PROFILE,
                        currency: Currency.USD
                    },
                    unixTimestamp
                }
                break;
            default:
                memberActivity = {
                    type: MemberActivityType.UNKNOWN,
                    unixTimestamp
                }
                break;
        }
        // TODO: remove this once we have a better way to handle unknown transactions
        // This is a temporary fix to prevent the app from crashing when it encounters an unknown transaction
        if (memberActivity.type === MemberActivityType.UNKNOWN) continue;
        recentActivityWithMemberDetail.push(memberActivity);
    }
    return recentActivityWithMemberDetail;
}
