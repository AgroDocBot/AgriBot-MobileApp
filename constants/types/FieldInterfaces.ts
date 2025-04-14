import { DateTime, NumberToRoundedOptions } from "i18n-js/typings"

interface FieldData {
    id?: number | null,
    fieldName: string,
    crop: string,
    area: number,
    location: {
        latitude: number,
        longitude: number
    }
}

interface FieldType {
    id: number,
    fieldname: string,
    crop: string,
    area: number,
    latitude: number,   
    longitude: number,
    createdAt: Date,
    ownerId: number
}

interface MeasurementFieldData {
    fieldId: number
}

interface MeasurementType {
    id: number,
    duration: number,
    explored: number,
    createdAt: Date,
    fieldId: number
}

export {FieldData, MeasurementFieldData, FieldType, MeasurementType}