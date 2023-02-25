import { PublicKey } from "@solana/web3.js";
import { EmailAddress, MemberPublicProfile } from "../../../shared/member";
import { DatabaseClient } from "./client";
import { CollectionReference, DocumentData, Firestore, QueryDocumentSnapshot, QuerySnapshot } from "@google-cloud/firestore";
import { FIRESTORE_MEMBERS_COLLECTION } from "../constants";

export class FirestoreClient implements DatabaseClient {
    private readonly membersRef: CollectionReference;

    private constructor(members: CollectionReference) {
        this.membersRef = members;
    }

    public static ofDefaults(): FirestoreClient {
        // `new Firestore()` pulls configs from environment variables
        const firestore: Firestore = new Firestore();
        return new FirestoreClient(firestore.collection(FIRESTORE_MEMBERS_COLLECTION));
    }

    public async addMember(
        profile: MemberPublicProfile,
        wallet: PublicKey,
        usdcAccountAddress: PublicKey
    ): Promise<string> {
        //TODO check that the member doesnt already exist
        const memberDocData: MemberDocument = {
            email: profile.email,
            emailSearch: this.createEmailSearchIndex(profile.email),
            profile: profile.profile,
            name: profile.name,
            usdcAccount: usdcAccountAddress.toBase58(),
            wallet: wallet.toBase58(),
        };
        const memberDoc = await this.membersRef.add(memberDocData);

        return memberDoc.id;
    }


    // god I hate this
    private createEmailSearchIndex(email: EmailAddress): MemberDocument['emailSearch'] {
        const result: MemberDocument['emailSearch'] = {};
        let partial: string = '';
        for (const letter of email) {
            partial += letter;
            result[partial] = true;
        }
        return result;
    }


    public async queryMembersByEmail(emailQuery: string, limit: number): Promise<MemberPublicProfile[]> {
        const response: QuerySnapshot<DocumentData> = await this.membersRef.where(`emailSearch.${emailQuery}`, "==", true)
            .limit(limit)
            .get();

        return parseMemberProfiles(response.docs);
    }


    public async getMembersByUsdcAccountAddress(accounts: PublicKey[]): Promise<MemberPublicProfile[]> {
        const responses: QuerySnapshot<DocumentData>[] = await Promise.all(
            accounts.map(account => (
                this.membersRef.where("usdcAccount", "==", account.toBase58()).limit(1).get()
            ))
        );
        return parseMemberProfiles(responses.flatMap(r => r.docs));
    }
}


interface MemberDocument extends DocumentData {
    email: string;
    emailSearch: { [index: string]: boolean };
    name: string;
    profile: string;
    wallet: string;
    usdcAccount: string;
}


function parseMemberProfiles(docs: QueryDocumentSnapshot<DocumentData>[]): MemberPublicProfile[] {
    const result: MemberPublicProfile[] = [];
    for (const doc of docs) {
        try {
            result.push({
                email: getMemberDocField(doc, 'email'),
                profile: getMemberDocField(doc, 'profile'),
                name: getMemberDocField(doc, 'name')
            });

        } catch (e) {
            // omit malformed documents
            //TODO better logging
            console.error("Unable to process document " + doc.id);
        }
    }

    return result;
}


function getMemberDocField<T>(
    doc: QueryDocumentSnapshot<DocumentData>,
    field: keyof MemberDocument,
    transform: (v: any) => T = (v => v as T)
): T {
    const candidate: any = doc.get(field as string);
    if (candidate == null) {
        throw new Error("Missing field " + field);
    }
    return transform(candidate);
}
