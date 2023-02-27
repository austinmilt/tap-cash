import { DatabaseClient } from "./client";
import { FIRESTORE_MEMBERS_COLLECTION } from "../constants";
import { MemberPublicProfile, EmailAddress, ProfilePicture } from "../shared/member";
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
import { MemberAccounts } from "../types/types";
import { PublicKey } from "../helpers/solana";

initializeApp();

export class FirestoreClient implements DatabaseClient {
    private readonly membersRef: CollectionReference<MemberDocument>;

    private constructor(members: CollectionReference<MemberDocument>) {
        this.membersRef = members;
    }

    public static ofDefaults(): FirestoreClient {
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
        //TODO check that the member doesnt already exist
        const memberDocData: MemberDocument = {
            email: profile.email,
            profile: profile.profile,
            name: profile.name,
            usdcAddress: usdcAddress,
            signerAddress: signerAddress,
            circleCreditCards: []
        };
        const memberDoc = await this.membersRef.add(memberDocData);

        return memberDoc.id;
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


    public async getMembersByUsdcAddress(accounts: PublicKey[]): Promise<Map<PublicKey, MemberPublicProfile>> {
        const result: Map<PublicKey, MemberPublicProfile> = new Map();
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
                        result.set(account, profile);

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


    public async getMemberAccountsByEmail(email: EmailAddress): Promise<MemberAccounts> {
        const member: MemberDocument | null = await this.getMemberDocByEmail(email);
        if (member === null) {
            throw ApiError.noSuchMember(email);
        }

        return {
            signerAddress: member.signerAddress,
            usdcAddress: member.usdcAddress
        }
    }


    public async saveCircleCreditCard(member: EmailAddress, circleCreditCardId: string): Promise<void> {

        //TODO
    }


    private async getMemberDocByEmail(email: EmailAddress): Promise<MemberDocument | null> {
        const response: QuerySnapshot<MemberDocument> = await this.buildMemberQuery("email", "==", email)
            .limit(1)
            .get();

        if (response.empty) return null;
        return response.docs[0].data();
    }


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
    private readonly creditCardsConverter: ArrayConverter<string, string> = new ArrayConverter(this.stringConverter);

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
            email: this.getField(snapshot, "email", this.stringConverter.fromFirestore),
            name: this.getField(snapshot, "name", this.stringConverter.fromFirestore),
            profile: this.getField(snapshot, "profile", this.stringConverter.fromFirestore),
            signerAddress: this.getField(snapshot, "signerAddress", this.pubkeyConverter.fromFirestore),
            usdcAddress: this.getField(snapshot, "usdcAddress", this.pubkeyConverter.fromFirestore),
            circleCreditCards: this.getField(snapshot, "circleCreditCards", this.creditCardsConverter.fromFirestore),
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


class ArrayConverter<Model, Doc> implements FieldConverter<Model[], Doc[]> {
    private readonly elementConverter: FieldConverter<Model, Doc>;

    constructor(elementConverter: FieldConverter<Model, Doc>) {
        this.elementConverter = elementConverter;
    }

    toFirestore(value: Model[]): Doc[] {
        return value.map(this.elementConverter.toFirestore);
    }

    fromFirestore(value: Doc[]): Model[] {
        return value.map(this.elementConverter.fromFirestore);
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
    circleCreditCards: string[];
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
