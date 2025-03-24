import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, Modal, StyleSheet, Dimensions } from 'react-native';
import WebView from 'react-native-webview';
import Ionicons from '@expo/vector-icons/Ionicons';
import type { DiseasedPlant } from '@/constants/types/PlantsInterfaces';

interface MeasurementCardProps {
  plant: DiseasedPlant
}

const MeasurementCard: React.FC<MeasurementCardProps> = ({ plant }) => {
  const [mapVisible, setMapVisible] = useState(false);

  return (
    <View style={styles.card}>
      <Image source={{ uri: plant.imageUrl }} style={styles.image} />
      <View style={styles.info}>
          <Text style={styles.name}>{plant.crop}</Text>
          <Text style={styles.status}>{plant.disease}</Text>
      </View>
      <TouchableOpacity onPress={() => setMapVisible(true)} style={styles.iconStyle}>
          <Ionicons name="map-outline" size={32} color="#fff" />
      </TouchableOpacity>

      <Modal visible={mapVisible} animationType="slide">
        <View style={styles.mapContainer}>
        <WebView
                source={{ uri: 'file:///android_asset/map_measurement.html' }}
                style={styles.map}
                injectedJavaScript={` 
                (function() {
                  const plants = ${JSON.stringify([{
                    lat: plant.latitude,
                    lng: plant.longitude
                  }])};
                  
                  window.postMessage({ plants }, "*");
                })();
                `}
              />
          <TouchableOpacity onPress={() => setMapVisible(false)} style={styles.closeButton}>
            <Ionicons name="close-outline" size={32} color="#fff" />
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

const {width, height} = Dimensions.get('window');

const styles = StyleSheet.create({
  card: { flexDirection: 'row', backgroundColor: '#333', padding: 10, borderRadius: 8, marginVertical: 5, height: 0.12*height, alignItems: 'center' },
  image: { width: 0.12*height - 20, height: 0.12*height - 20, borderRadius: 8 },
  info: { flex: 1, marginLeft: 10 },
  name: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  status: { color: '#fff', fontSize: 14, fontWeight: 'bold', marginVertical: 5 },
  healthy: { color: 'green' },
  diseased: { color: 'red' },
  mapContainer: { flex: 1, backgroundColor: '#222' },
  map: { flex: 1 },
  closeButton: { alignSelf: 'center', marginTop: 20 },
  iconStyle: {marginLeft: 10}
});

export default MeasurementCard;
