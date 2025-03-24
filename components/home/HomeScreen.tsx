import React, { useState } from "react";
import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity, Dimensions, ImageBackground } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import PlantImagesContainer from "./PlantImageContainer";
import i18n from '@/translations/i18n';
import { useDispatch, useSelector } from 'react-redux';
import { createOrUpdateRobotData, updateUsage, updateBattery, setBatteryStatus } from '@/redux/batteryUsageSlice';
import { useEffect } from "react";
import { RootState } from "@/redux/store";
import type { AppDispatch } from '@/redux/store';
import type { HealthyPlant, DiseasedPlant } from "@/constants/types/PlantsInterfaces";

const Home = () => {
  const [activeTab, setActiveTab] = useState("Last plants");
  const [latestHPlants, setLatestHPlants] = useState<any[]>([

    {
        id:123,
        latitude:"42",
        longitude:"21",
        crop:"Net ",
        disease:"lotch (Pyrenophora teres)",
        imageUrl:"https://res.cloudinary.com/dfdga8pr1/image/upload/v1742508929/s4d9l1ymz59plwlmsdin.jpg",
        measurementId:23
    }

]);
  const [latestDPlants, setLatestDPlants] = useState<any[]>([]);

  let plantsArray: any[] = [];
  const dispatch = useDispatch<AppDispatch>();

  const { language, controlStyle, unitsSystem } = useSelector((state: any) => state.settings);

  if(language === 'English') i18n.locale = 'en';
  else if(language === 'Български') i18n.locale = 'bg';
  else i18n.locale = 'de';

  const user = useSelector((state: RootState) => state.auth.user);
  const battery = useSelector((state: RootState) => state.battery.battery);

  useEffect(() => {
    console.log("The arrays: "+JSON.stringify(latestHPlants));
  }, [latestDPlants, latestHPlants])

  useEffect(() => {
    if(user?.id) dispatch(createOrUpdateRobotData(user?.id));
    if(user) {
      fetch(`https://agribot-backend-abck.onrender.com/plants/healthy/user/${user.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': 'https://agribot-backend-abck.onrender.com'
        },
      })
        .then((response) => response.json())
        .then((data) => {setLatestHPlants(data); console.log(data)})
        .catch((error) => console.error('Error fetching healthy plants:', error));
      
      fetch(`https://agribot-backend-abck.onrender.com/plants/diseased/user/${user.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': 'https://agribot-backend-abck.onrender.com'
        },
      })
        .then((response) => response.json())
        .then((data) => {setLatestDPlants(JSON.parse(JSON.stringify(data))); console.log(JSON.stringify(latestDPlants)); plantsArray = data.slice(); setLatestHPlants([...data])})
        .catch((error) => console.error('Error fetching diseased plants:', error));
    }
  }, [user, dispatch]);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Image source={{ uri: "https://via.placeholder.com/40" }} style={styles.profileImage} />
        <View style={styles.iconContainer}>
          <Ionicons name="notifications-outline" size={24} color="white" />
          <Ionicons name="cloud-outline" size={24} color="white" />
        </View>
      </View>
      <Text style={styles.title}>{i18n.t("home.welcome")}</Text>
      <Text style={styles.subtitle}>{i18n.t("home.waiting")}</Text>
      
      <ImageBackground source={require("@/assets/images/trianglify-lowres.png")} imageStyle={{ borderRadius: 16 }} style={styles.card}>
        <Image source={require("@/assets/images/robot.png")} style={styles.cardImage} />
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle}>AgriBot</Text>
          <Text style={styles.cardSubtitle}>{i18n.t("home.lastUsed")}: 12 {i18n.t("home.daysAgo")}</Text>
          <Text style={styles.cardTemp}><Ionicons name="battery-full" size={36} color="white" /> {battery}</Text>
          <Text style={styles.cardLight}>🔴 {i18n.t("home.disconnected")}</Text>
        </View>
      </ImageBackground>
      
      <View style={styles.tabs}>
        <TouchableOpacity onPress={() => setActiveTab("Last plants")}>
          <Text style={activeTab === "Last plants" ? styles.activeTab : styles.inactiveTab}>{i18n.t("home.last")}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab("Urgent plants")}>
          <Text style={activeTab === "Urgent plants" ? styles.activeTab : styles.inactiveTab}>{i18n.t("home.urgent")}</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.plantImagesContainer}>
        {activeTab === "Last plants" ? (
          <>
            {latestHPlants?.map(plant => (
              <PlantImagesContainer index={plant.id} name={plant.crop} date={plant.measurementId.toString()} imageUrl={plant.imageUrl}/>
            ))}
          </>
        ) : (
          <>
            {latestDPlants?.map(plant => (
              <PlantImagesContainer index={plant.id} name={plant.crop} date={plant.disease} imageUrl={plant.imageUrl}/>
            ))}
          </>       
          )}
      </View>
    </ScrollView>
  );
};

export default Home;

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

const styles = StyleSheet.create({
  container: { backgroundColor: "#1b1f23", padding: 16, flex: 1 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  profileImage: { width: 40, height: 40, borderRadius: 20 },
  iconContainer: { flexDirection: "row", gap: 16 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 4, color: "#F3F3F3" },
  subtitle: { fontSize: 24, fontWeight: "bold", color: "#8F8F8F" },
  card: { backgroundColor: "#4CAF50",  borderRadius: 16, padding: 16, marginTop: 16, paddingLeft: 0},
  cardImage: { width: "80%", height: 225, borderRadius: 12, marginLeft: -30 },
  cardInfo: { position: "absolute", top: 16, right: 16, backgroundColor: "#24292e", padding: 8, borderRadius: 8 },
  cardTitle: { fontSize: 14, fontWeight: "bold", color: "#F3F3F3" },
  cardSubtitle: { fontSize: 12, color: "#8F8F8F" },
  cardTemp: { fontSize: 18, fontWeight: "bold", marginTop: 4, color: "#4CAF50" },
  cardLight: { fontSize: 14, color: "#8F8F8F" },
  tabs: { flexDirection: "row", justifyContent: "space-evenly", marginTop: 24 },
  activeTab: { fontSize: 18, fontWeight: "bold", color: "#4CAF50" },
  inactiveTab: { fontSize: 18, color: "#8F8F8F" },
  plantImagesContainer: { flexDirection: "row", justifyContent:'flex-start', padding: 0.05*screenWidth, gap: 0.2*screenWidth - 32, flexWrap:'wrap', maxWidth: screenWidth},
  plantImage: { width: 0.35*screenWidth, height: 0.35*screenWidth, borderRadius: 12 },
});
