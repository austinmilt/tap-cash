import { DatabaseClient } from "./client";
import { FIRESTORE_MEMBERS_COLLECTION } from "../constants";
import { MemberPublicProfile, EmailAddress } from "@tap/shared/member";
import { initializeApp } from "firebase-admin/app";
import { CollectionReference, DocumentData, Firestore, QueryDocumentSnapshot, QuerySnapshot, getFirestore } from "firebase-admin/firestore";
import { web3 } from "@project-serum/anchor";
import { ApiError } from "@tap/shared/error";
import { MemberAccounts } from "../types/types";

initializeApp();

export class FirestoreClient implements DatabaseClient {
    private readonly membersRef: CollectionReference;

    private constructor(members: CollectionReference) {
        this.membersRef = members;
    }

    public static ofDefaults(): FirestoreClient {
        // `getFirestore()` pulls configs from environment variables
        const firestore: Firestore = getFirestore();
        return new FirestoreClient(firestore.collection(FIRESTORE_MEMBERS_COLLECTION));
    }

    public async addMember(
        profile: MemberPublicProfile,
        signerAddress: web3.PublicKey,
        usdcAddress: web3.PublicKey
    ): Promise<string> {
        //TODO check that the member doesnt already exist
        const memberDocData: MemberDocument = {
            email: profile.email,
            emailSearch: this.createEmailSearchIndex(profile.email),
            profile: profile.profile,
            name: profile.name,
            usdcAddress: usdcAddress.toBase58(),
            signerAddress: signerAddress.toBase58(),
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


    public async getMembersByUsdcAddress(accounts: web3.PublicKey[]): Promise<MemberPublicProfile[]> {
        const responses: QuerySnapshot<DocumentData>[] = await Promise.all(
            accounts.map(account => (
                this.buildMemberQuery("usdcAddress", "==", account.toBase58())
                    .limit(1)
                    .get()
            ))
        );
        return parseMemberProfiles(responses.flatMap(r => r.docs));
    }

    public async getMemberAccountsByEmail(email: EmailAddress): Promise<MemberAccounts> {
        const response: QuerySnapshot<DocumentData> = await this.buildMemberQuery("email", "==", email)
            .limit(1)
            .get()

        if (response.size === 0) {
            throw ApiError.noSuchMember(email);
        }

        return {
            signerAddress: getMemberDocField(response.docs[0], "signerAddress", v => new web3.PublicKey(v)),
            usdcAddress: getMemberDocField(response.docs[0], "usdcAddress", v => new web3.PublicKey(v))
        };
    }


    private buildMemberQuery(
        field: MemberDocumentField,
        operation: FirebaseFirestore.WhereFilterOp,
        value: any
    ): FirebaseFirestore.Query {
        return this.membersRef.where(field, operation, value);
    }
}


interface MemberDocument extends DocumentData {
    email: string;
    emailSearch: { [index: string]: boolean };
    name: string;
    profile: string;
    signerAddress: string;
    usdcAddress: string;
}


//TODO there's gotta be a better way to do this... keyof doesnt work because DocumentData is generic
type MemberDocumentField = "email" | "emailSearch" | "name" | "profile" | "signerAddress" | "usdcAddress";


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
    field: MemberDocumentField,
    transform: (v: any) => T = (v => v as T)
): T {
    const candidate: any = doc.get(field as string);
    if (candidate == null) {
        throw new Error("Missing field " + field);
    }
    return transform(candidate);
}
