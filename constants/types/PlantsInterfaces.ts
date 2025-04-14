interface HealthyPlant {
    id: number,
    latitude: number,
    longitude: number
    crop: string,
    imageUrl: string,
    measurementId: number
}

interface DiseasedPlant {
    id: number,
    latitude: number,
    longitude: number
    crop: string,
    disease: string,
    imageUrl: string,
    measurementId: number
}

interface ReceivedPlantDataH {
    latitude: string,
    longitude: string,
    crop: string,
    measurementId: number
}

interface ReceivedPlantDataD {
    latitude: number,
    longitude: number,
    crop: string,
    measurementId: number | null,
    disease?: string
}

export {HealthyPlant, DiseasedPlant, ReceivedPlantDataD, ReceivedPlantDataH}