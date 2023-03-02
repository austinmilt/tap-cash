import { CircleEmulator } from "../circle/circle-emulator";
import { CircleClient } from "../circle/client";
import { CircleMainClient } from "../circle/main-client";
import { SERVER_ENV } from "../constants";
import { DatabaseClient } from "../db/client";
import { FirestoreClient } from "../db/firestore";
import { InMemoryDatabaseClient } from "../dev/testing/InMemoryDatabaseClient";
import { MockCircleClient } from "../dev/testing/MockCircleClient";
import { MockTapCashClient } from "../dev/testing/MockTapCashClient";
import { MainTapCashClient, TapCashClient } from "../program/sdk";
import { ServerEnv } from "../types/types";

let dbClient: DatabaseClient;
export function getDatabaseClient(): DatabaseClient {
    if (dbClient === undefined) {
        dbClient = makeSingleton<DatabaseClient>(
            InMemoryDatabaseClient.make,
            FirestoreClient.ofDefaults,
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



let circleClient: CircleClient;
export function getCircleClient(): CircleClient {
    if (circleClient === undefined) {
        circleClient = makeSingleton<CircleClient>(
            MockCircleClient.make,
            CircleEmulator.ofDefaults,
            CircleMainClient.ofDefaults,
            CircleMainClient.ofDefaults
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


let tapClient: TapCashClient;
export function getTapCashClient(): TapCashClient {
    if (tapClient === undefined) {
        tapClient = makeSingleton<TapCashClient>(
            MockTapCashClient.make,
            MainTapCashClient.ofDefaults,
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
