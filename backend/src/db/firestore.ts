import { DatabaseClient } from "./client";
import { FIRESTORE_MEMBERS_COLLECTION } from "../constants";
import { MemberPublicProfile, EmailAddress, ProfilePicture, MemberId, MemberPrivateProfile } from "../shared/member";
import { initializeApp } from "firebase-admin/app";
import {
    CollectionReference,
    DocumentData,
    Firestore,
    FirestoreDataConverter,
    QueryDocumentSnapshot,
    QuerySnapshot,
    getFirestore
} from "firebase-admin/firestore";
import { ApiError } from "../shared/error";
import { CircleCardId, MemberAccounts } from "../types/types";
import { PublicKey } from "../helpers/solana";

/**
 * Implementation of Database Client using Firestore.
 */
export class FirestoreClient implements DatabaseClient {
    private readonly membersRef: CollectionReference<MemberDocument>;

    private constructor(members: CollectionReference<MemberDocument>) {
        this.membersRef = members;
    }

    /**
     * 
     * @returns a FirestoreClient with default configs from environment variables
     */
    public static ofDefaults(): FirestoreClient {
        initializeApp();
        // `getFirestore()` pulls configs from environment variables
        const firestore: Firestore = getFirestore();
        const membersRef: CollectionReference<MemberDocument> = firestore.collection(FIRESTORE_MEMBERS_COLLECTION)
            .withConverter<MemberDocument>(new MemberDocumentConverter());

        return new FirestoreClient(membersRef);
    }


    public async addMember(
        profile: MemberPublicProfile,
        signerAddress: PublicKey,
        usdcAddress: PublicKey
    ): Promise<string> {
        if (await this.isMember(profile.email)) {
            ApiError.memberAlreadyExists(profile.email);
        }
        const memberDocData: MemberDocument = {
            email: profile.email,
            profile: profile.profile,
            name: profile.name,
            usdcAddress: usdcAddress,
            signerAddress: signerAddress,
            circleCreditCards: new Set()
        };
        const memberDoc = await this.membersRef.add(memberDocData);

        return memberDoc.id;
    }

    public async updateMember(profile: Partial<MemberPublicProfile>): Promise<MemberId> {
        if (profile.email == null) throw ApiError.invalidParameter("profile.email");
        const doc = await this.getMemberDocSnapshotByEmail(profile.email);
        if (doc == null) throw ApiError.noSuchMember(profile.email);
        await doc.ref.update(profile);
        return doc.id;
    }


    public async isMember(emailAddress: EmailAddress): Promise<boolean> {
        const matches: MemberPublicProfile[] = await this.queryMembersByEmail(emailAddress, 1);
        return matches.length > 0;
    }


    public async queryMembersByEmail(emailQuery: string, limit: number): Promise<MemberPublicProfile[]> {
        // see MemberDocumentConverter for where `emailSearch` comes from
        // see Stack Overflow for lots of examples of how to create search in firestore... it sucks
        // e.g. https://stackoverflow.com/a/72072725/3314063
        const response: QuerySnapshot<MemberDocument> = await this.membersRef.where(`emailSearch.${emailQuery}`, "==", true)
            .limit(limit)
            .get();

        return extractPublicProfile(response.docs);
    }


    public async getMembersByUsdcAddress(accounts: PublicKey[]): Promise<Map<string, MemberPublicProfile>> {
        const result: Map<string, MemberPublicProfile> = new Map();
        await Promise.all(
            accounts.map(async account => {
                const response = await this.buildMemberQuery("usdcAddress", "==", account.toBase58())
                    .limit(1)
                    .get();

                // there should be only 1 or 0 results
                for (const doc of response.docs) {
                    try {
                        const memberDoc: MemberDocument = doc.data();
                        const profile: MemberPublicProfile = {
                            name: memberDoc.name,
                            email: memberDoc.email,
                            profile: memberDoc.profile
                        };
                        result.set(account.toBase58(), profile);

                    } catch (e) {
                        // omit malformed documents
                        //TODO better logging
                        console.error("Unable to process document " + doc.id);
                    }
                }
            })
        );
        return result;
    }


    public async getMemberPrivateProfile(email: EmailAddress): Promise<MemberPrivateProfile> {
        const member: MemberDocument | null = await this.getMemberDocByEmail(email);
        if (member === null) {
            throw ApiError.noSuchMember(email);
        }

        return member;
    }


    public async saveCircleCreditCard(email: EmailAddress, circleCreditCardId: CircleCardId): Promise<void> {
        const snapshot: QueryDocumentSnapshot<MemberDocument> | null = await this.getMemberDocSnapshotByEmail(email);
        if (snapshot === null) {
            throw ApiError.noSuchMember(email);
        }

        const updated: Set<string> = snapshot.data().circleCreditCards.add(circleCreditCardId);
        await this.membersRef.doc(snapshot.id).update({ circleCreditCards: updated });
    }


    public async getCircleCreditCards(email: EmailAddress): Promise<Set<CircleCardId>> {
        const member: MemberDocument | null = await this.getMemberDocByEmail(email);
        if (member === null) {
            throw ApiError.noSuchMember(email);
        }

        return member.circleCreditCards;
    }

    private async getMemberDocByEmail(email: EmailAddress): Promise<MemberDocument | null> {
        return (await this.getMemberDocSnapshotByEmail(email))?.data() ?? null;
    }

    private async getMemberDocSnapshotByEmail(email: EmailAddress): Promise<QueryDocumentSnapshot<MemberDocument> | null> {
        const response: QuerySnapshot<MemberDocument> = await this.buildMemberQuery("email", "==", email)
            .limit(1)
            .get();
        if (response.empty) return null;
        return response.docs[0];
    }

    // https://cloud.google.com/firestore/docs/query-data/get-data
    private buildMemberQuery(
        field: keyof MemberDocument,
        operation: FirebaseFirestore.WhereFilterOp,
        value: any
    ): FirebaseFirestore.Query<MemberDocument> {
        return this.membersRef.where(field, operation, value);
    }
}


class MemberDocumentConverter implements FirestoreDataConverter<MemberDocument> {
    private readonly stringConverter: StringConverter = new StringConverter();
    private readonly pubkeyConverter: PublicKeyConverter = new PublicKeyConverter();
    private readonly creditCardsConverter: SetConverter<string, string> = new SetConverter(new StringConverter());

    toFirestore(model: MemberDocument): DocumentData {
        return {
            email: this.stringConverter.toFirestore(model.email),
            emailSearch: this.stringConverter.toFirestoreSearchIndex(model.email),
            name: this.stringConverter.toFirestore(model.name),
            profile: this.stringConverter.toFirestore(model.profile),
            signerAddress: this.pubkeyConverter.toFirestore(model.signerAddress),
            usdcAddress: this.pubkeyConverter.toFirestore(model.usdcAddress),
            circleCreditCards: this.creditCardsConverter.toFirestore(model.circleCreditCards)
        }
    }

    fromFirestore(snapshot: QueryDocumentSnapshot<DocumentData>): MemberDocument {
        return {
            email: this.getField<string, string>(snapshot, "email", v => this.stringConverter.fromFirestore(v)),
            name: this.getField<string, string>(snapshot, "name", v => this.stringConverter.fromFirestore(v)),
            profile: this.getField<ProfilePicture, string>(snapshot, "profile", v => this.stringConverter.fromFirestore(v)),
            signerAddress: this.getField<PublicKey, string>(snapshot, "signerAddress", v => this.pubkeyConverter.fromFirestore(v)),
            usdcAddress: this.getField<PublicKey, string>(snapshot, "usdcAddress", v => this.pubkeyConverter.fromFirestore(v)),
            circleCreditCards: this.getField<Set<CircleCardId>, string[]>(snapshot, "circleCreditCards", v => this.creditCardsConverter.fromFirestore(v)),
        };
    }

    private getField<Model, Doc>(
        doc: QueryDocumentSnapshot<DocumentData>,
        field: keyof MemberDocument,
        converter: (value: Doc) => Model
    ): Model {
        const candidate: Doc = doc.get(field);
        if (candidate == null) {
            throw new Error("Missing field " + field);
        }
        return converter(candidate);
    }
}


class SetConverter<Model, Doc> implements FieldConverter<Set<Model>, Doc[]> {
    private readonly elementConverter: FieldConverter<Model, Doc>;

    constructor(elementConverter: FieldConverter<Model, Doc>) {
        this.elementConverter = elementConverter;
    }

    toFirestore(value: Set<Model>): Doc[] {
        return Array.from(value).map(this.elementConverter.toFirestore);
    }

    fromFirestore(value: Doc[]): Set<Model> {
        return new Set(value.map(this.elementConverter.fromFirestore));
    }

}


class StringConverter implements FieldConverter<string, string> {
    toFirestore(value: string): string {
        return value;
    }

    fromFirestore(value: string): string {
        return value;
    }

    toFirestoreSearchIndex(value: string): TextSearchIndex {
        const result: TextSearchIndex = {};
        let partial: string = '';
        for (const letter of value) {
            partial += letter;
            result[partial] = true;
        }
        return result;
    }
}


class PublicKeyConverter implements FieldConverter<PublicKey, string> {
    toFirestore(value: PublicKey): string {
        return value.toBase58();
    }

    fromFirestore(value: string): PublicKey {
        return new PublicKey(value);
    }
}


interface TextSearchIndex {
    [index: string]: boolean;
}


interface FieldConverter<Model, Doc> {
    toFirestore(value: Model): Doc;
    fromFirestore(value: Doc): Model;
}


interface MemberDocument {
    email: EmailAddress;
    name: string;
    profile: ProfilePicture;
    signerAddress: PublicKey;
    usdcAddress: PublicKey;
    circleCreditCards: Set<CircleCardId>;
}


function extractPublicProfile(docs: QueryDocumentSnapshot<MemberDocument>[]): MemberPublicProfile[] {
    const result: MemberPublicProfile[] = [];
    for (const doc of docs) {
        try {
            const memberDoc: MemberDocument = doc.data();
            result.push({
                name: memberDoc.name,
                email: memberDoc.email,
                profile: memberDoc.profile
            });

        } catch (e) {
            // omit malformed documents
            //TODO better logging
            console.error("Unable to process document " + doc.id);
        }
    }

    return result;
}
