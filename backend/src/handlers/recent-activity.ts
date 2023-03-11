
import { ApiMemberActivity, ApiRecentActivityRequest, ApiRecentActivityResult } from "../shared/api";
import { UNKNOWN_USER_PROFILE } from "../constants";
import { PublicKey } from "../helpers/solana";
import { TransactionDetail } from "../program/sdk";
import { MemberActivityType, MemberActivity } from "../shared/activity";
import { Currency } from "../shared/currency";
import { EmailAddress } from "../shared/member";
import { getRequiredParam, getRequiredIntegerParam, makeGetHandler } from "./model";
import { getDatabaseClient, getTapCashClient } from "../helpers/singletons";

interface RecentActivityArgs {
    memberEmail: EmailAddress;
    limit: number;
}

export const handleRecentActivity = makeGetHandler(getRecentActivity, transformRequest, transformResult);

/**
 *
 * Find the most recent activity for a member by querying their USDC address on chain
 *
 * @param request { memberEmail: string, limit: number}
 * @returns { MemberActivity[] }
 */
async function getRecentActivity(request: RecentActivityArgs): Promise<MemberActivity[]> {
    const { usdcAddress } = await getDatabaseClient().getMemberPrivateProfile(request.memberEmail);
    const recentActivity: TransactionDetail[] = await getTapCashClient().getRecentActivity(usdcAddress, request.limit);
    // Filter only transactions that have a valid otherPartyAddress (to fetch member profiles)
    const addressesToQuery: PublicKey[] = recentActivity.flatMap(a => a.otherPartyAtaAddress !== undefined ? [a.otherPartyAtaAddress] : []);
    const memberProfiles = await getDatabaseClient().getMembersByUsdcAddress(addressesToQuery);

    let recentActivityWithMemberDetail: MemberActivity[] = [];
    for (const activity of recentActivity) {
        const { bankChange, memberChange, otherPartyChange, memberAtaAddress: member, unixTimestamp, otherPartyAtaAddress: otherPartyAddress } = activity;

        // we only queried for known otherPartyAddress above, but
        // `recentActivity` doesnt filter by those
        if (otherPartyAddress === undefined) continue;

        const memberString = member.toBase58();

        let txType: MemberActivityType;
        if (bankChange < 0) { txType = MemberActivityType.DEPOSIT }
        else if (bankChange > 0) { txType = MemberActivityType.WITHDRAW }
        else if (otherPartyChange < 0 && memberChange > 0) { txType = MemberActivityType.RECEIVE }
        else if (otherPartyChange > 0 && memberChange < 0) { txType = MemberActivityType.SEND }
        // TODO fix deposits showing up as unknown
        // Added this to handle Devnet MintTo transactions
        else if (memberChange > 0) { txType = MemberActivityType.DEPOSIT }
        else continue;

        let memberActivity: MemberActivity | undefined;
        switch (txType) {
            case MemberActivityType.DEPOSIT:
                memberActivity = {
                    type: MemberActivityType.DEPOSIT,
                    deposit: {
                        amount: bankChange * -1,
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
                        sender: memberProfiles.get(otherPartyAddress.toBase58()) ?? UNKNOWN_USER_PROFILE,
                        currency: Currency.USD
                    },
                    unixTimestamp
                }
                break;

            case MemberActivityType.SEND:
                memberActivity = {
                    type: MemberActivityType.SEND,
                    send: {
                        amount: -memberChange,
                        // Based on our filtering above, we know that otherPartyAddress is not null
                        recipient: memberProfiles.get(otherPartyAddress.toBase58()) ?? UNKNOWN_USER_PROFILE,
                        currency: Currency.USD
                    },
                    unixTimestamp
                }
                break;

            default:
                break;
        }

        // TODO: remove this once we have a better way to handle unknown transactions
        // This is a temporary fix to prevent the app from crashing when it encounters an unknown transaction
        if (!memberActivity) {
            console.warn("Unknown activity", activity);

        } else {
            recentActivityWithMemberDetail.push(memberActivity);
        }
    }
    return recentActivityWithMemberDetail;
}


function transformRequest(params: ApiRecentActivityRequest): RecentActivityArgs {
    return {
        memberEmail: getRequiredParam<ApiRecentActivityRequest, EmailAddress>(params, "memberEmail"),
        limit: getRequiredIntegerParam<ApiRecentActivityRequest>(params, "limit"),
    };
}


function transformResult(result: MemberActivity[]): ApiRecentActivityResult {
    return result.map(act => {
        const activityType: MemberActivityType = act.type;
        const transformed: ApiMemberActivity = {
            type: act.type,
            unixTimestamp: act.unixTimestamp ?? 0
        };

        if (activityType === MemberActivityType.SEND) {
            transformed.send = {
                currency: act.send!.currency,
                amount: act.send!.amount,
                recipient: act.send!.recipient,
            }
        }

        if (activityType === MemberActivityType.DEPOSIT) {
            transformed.deposit = {
                currency: act.deposit!.currency,
                amount: act.deposit!.amount,
                account: act.deposit!.account
            }
        }

        if (activityType === MemberActivityType.WITHDRAW) {
            transformed.withdraw = {
                currency: act.withdraw!.currency,
                amount: act.withdraw!.amount,
                source: act.withdraw!.source
            }
        }

        if (activityType === MemberActivityType.RECEIVE) {
            transformed.receive = {
                currency: act.receive!.currency,
                amount: act.receive!.amount,
                sender: act.receive!.sender
            }
        }
        return transformed;
    });
}
