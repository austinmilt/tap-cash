
//TODO tests

import { DatabaseClient } from "../db/client";
import { FirestoreClient } from "../db/firestore";
import { PublicKey } from "../helpers/solana";
import { TapCashClient } from "../program/sdk";
import { MemberActivityWithMemberDetail } from "../shared/activity";
import { EmailAddress } from "../shared/member";

export interface RecentActivityArgs {
    memberEmail: EmailAddress;
    limit: number;
}

const DB_CLIENT: DatabaseClient = FirestoreClient.ofDefaults();
const TAP_CLIENT: TapCashClient = TapCashClient.ofDefaults();

export async function getRecentActivity(request: RecentActivityArgs): Promise<MemberActivityWithMemberDetail[]> {
    const { usdcAddress } = await DB_CLIENT.getMemberAccountsByEmail(request.memberEmail);
    const recentActivity  = await TAP_CLIENT.getRecentActivity(usdcAddress, request.limit);

    let recentActivityWithMemberDetail:MemberActivityWithMemberDetail[] = [];
    for (const activity of recentActivity) {
        let newActivity: MemberActivityWithMemberDetail = {
            type: activity.type,
            deposit: activity.deposit,
            send: undefined,
            receive: undefined,
            withdraw: activity.withdraw,
            timestamp: activity.timestamp,
        };

        if (activity.send) {
            const recipientProfile = await DB_CLIENT.getMembersByUsdcAddress([new PublicKey(activity.send.recipient)]);
            newActivity.send = {
                recipient: Array.from(recipientProfile.values())[0],
                currency: activity.send.currency,
                amount: activity.send.amount,
            };
        }

        if (activity.receive) {
            const senderProfile = await DB_CLIENT.getMembersByUsdcAddress([new PublicKey(activity.receive.sender)]);
            newActivity.receive = {
                sender: Array.from(senderProfile.values())[0],
                currency: activity.receive.currency,
                amount: activity.receive.amount,
            };
        }

        recentActivityWithMemberDetail.push(newActivity);
    }

    return recentActivityWithMemberDetail;
}
