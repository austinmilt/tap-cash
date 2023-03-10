import { CircleEmulator } from "../circle/circle-emulator";
import { CircleClient } from "../circle/client";
import { CircleMainClient } from "../circle/main-client";
import { SERVER_ENV, USE_IN_MEMORY_DB, CIRCLE_CLIENT_TYPE, USE_MOCK_TAP_CASH } from "../constants";
import { DatabaseClient } from "../db/client";
import { FirestoreClient } from "../db/firestore";
import { InMemoryDatabaseClient } from "../dev/testing/InMemoryDatabaseClient";
import { MockCircleClient } from "../dev/testing/MockCircleClient";
import { MockTapCashClient } from "../dev/testing/MockTapCashClient";
import { MainTapCashClient, TapCashClient } from "../program/sdk";
import { CircleClientType, ServerEnv } from "../types/types";

let dbClient: DatabaseClient;
export function getDatabaseClient(): DatabaseClient {
    if (dbClient === undefined) {
        dbClient = makeSingleton<DatabaseClient>(
            InMemoryDatabaseClient.make,
            () => USE_IN_MEMORY_DB ? InMemoryDatabaseClient.make() : FirestoreClient.ofDefaults(),
            FirestoreClient.ofDefaults,
            FirestoreClient.ofDefaults
        )
    }
    return dbClient;
}


export function setDatabaseClient(newClient: DatabaseClient) {
    if (SERVER_ENV !== ServerEnv.TEST) {
        throw new Error("Setting the singleton only allowed in tests.");
    }
    dbClient = newClient;
}


let tapClient: TapCashClient;
export function getTapCashClient(): TapCashClient {
    if (tapClient === undefined) {
        tapClient = makeSingleton<TapCashClient>(
            MockTapCashClient.make,
            () => USE_MOCK_TAP_CASH ? MockTapCashClient.make() : MainTapCashClient.ofDefaults(),
            MainTapCashClient.ofDefaults,
            MainTapCashClient.ofDefaults
        )
    }
    return tapClient;
}


export function setTapCashClient(newClient: TapCashClient) {
    if (SERVER_ENV !== ServerEnv.TEST) {
        throw new Error("Setting the singleton only allowed in tests.");
    }
    tapClient = newClient;
}


let circleClient: CircleClient;
export function getCircleClient(): CircleClient {
    if (circleClient === undefined) {
        const makeMocked = () => {
            const tapClient = getTapCashClient();
            if (tapClient instanceof MockTapCashClient) {
                return MockCircleClient.make(tapClient);

            } else {
                throw new Error("Must use MockTapCashClient for MockCircleClient");
            }
        };
        let constructor: () => CircleClient;
        switch (CIRCLE_CLIENT_TYPE) {
            case CircleClientType.MOCK: {
                constructor = makeMocked;
                break;
            }
            case CircleClientType.EMULATOR: {
                constructor = CircleEmulator.ofDefaults;
                break;
            }
            case CircleClientType.MAIN: {
                constructor = CircleMainClient.ofDefaults;
                break;
            }
        }
        circleClient = makeSingleton<CircleClient>(
            constructor,
            constructor,
            constructor,
            constructor
        )
    }
    return circleClient;
}


export function setCircleClient(newClient: CircleClient) {
    if (SERVER_ENV !== ServerEnv.TEST) {
        throw new Error("Setting the singleton only allowed in tests.");
    }
    circleClient = newClient;
}


function makeSingleton<T>(
    makeTest: () => T,
    makeLocal: () => T,
    makeDev: () => T,
    makeProd: () => T
): T {
    switch (SERVER_ENV) {
        case ServerEnv.TEST: return makeTest();
        case ServerEnv.LOCAL: return makeLocal();
        case ServerEnv.DEV: return makeDev();
        case ServerEnv.PROD: return makeProd();
    }
}
