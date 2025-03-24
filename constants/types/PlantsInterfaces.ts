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

export {HealthyPlant, DiseasedPlant}