import React, { useState } from "react";
import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity, Dimensions, ImageBackground } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import PlantImagesContainer from "./PlantImageContainer";
import i18n from '@/translations/i18n';
import { useDispatch, useSelector } from 'react-redux';

const Home = () => {
  const [activeTab, setActiveTab] = useState("Last plants");

  const dispatch = useDispatch();

  const { language, controlStyle, unitsSystem } = useSelector((state: any) => state.settings);

  if(language === 'English') i18n.locale = 'en';
  else if(language === 'Български') i18n.locale = 'bg';
  else i18n.locale = 'de';

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
          <Text style={styles.cardTemp}><Ionicons name="battery-full" size={36} color="white" /> 80%</Text>
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
            <PlantImagesContainer index={0} name="Field1" date="01-01-2025"/>

            <PlantImagesContainer index={1} name="Field1" date="01-01-2025"/>

            <PlantImagesContainer index={2} name="Field1" date="01-01-2025"/>
          </>
        ) : (
          <>
            <PlantImagesContainer index={0} name="Field2" date="02-02-2025"/>

            <PlantImagesContainer index={1} name="Field2" date="02-02-2025"/>

            <PlantImagesContainer index={2} name="Field2" date="02-02-2025"/>
            <PlantImagesContainer index={3} name="Field2" date="02-02-2025"/>
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
