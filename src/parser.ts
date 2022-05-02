import {JSON, JSONArray, Maybe} from "./types";
import {json, JSONValue} from "@graphprotocol/graph-ts";

export function parseJsonString(jsonString: string): Maybe<JSON> {
    const jsonResult = json.try_fromString(jsonString)
    if (!jsonResult.isOk) {
        return null
    }

    return jsonResult.value.toObject()
}

export function parseJsonField(jsonString: string, field: string): Maybe<JSON> {
    const json = parseJsonString(jsonString)
    if (!json) {
        return null
    }

    const data = json.get(field)
    return data ? data.toObject() : null
}

export function parseJsonArray(jsonString: string, field: string): Maybe<JSONArray> {
    const json = parseJsonString(jsonString)
    if (!json) {
        return null
    }

    const data = json.get(field)
    return data ? data.toArray() : null
}

export function parseData(jsonString: string): Maybe<JSON> {
    return parseJsonField(jsonString, "data")
}

export function parseDataArray(jsonString: string): Maybe<JSONArray> {
    return parseJsonArray(jsonString, "data")
}