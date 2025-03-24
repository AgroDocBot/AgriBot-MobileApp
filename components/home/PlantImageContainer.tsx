import { View, Image, Text, StyleSheet } from "react-native";
import { Dimensions } from "react-native";

interface PlantImageProps {
    index : number,
    name : string,
    date : string,
    imageUrl: string | null
}

export default function PlantImagesContainer({index, name, date, imageUrl} : PlantImageProps) {
    return (
      <View key={index} style={styles.plantItem}>
        <Image source={ imageUrl ? {uri: imageUrl} : {uri: ""}} style={styles.plantImage} />
        <Text style={styles.plantName}>{name}</Text>
        <Text style={styles.plantDate}>{date}</Text>
      </View>
    )
}

const screenWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
    plantItem: { alignItems: "center"},
    plantImage: { width: 0.35*screenWidth, height: 0.35*screenWidth, borderRadius: 12 },
    plantName: { fontSize: 16, fontWeight: "bold", color: "#F3F3F3", marginTop: 4 },
    plantDate: { fontSize: 14, color: "#8F8F8F" }
})