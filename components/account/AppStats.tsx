import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import { VictoryChart, VictoryBar, VictoryPie, VictoryTheme } from 'victory-native';
import i18n from '@/translations/i18n';
import { useSelector } from 'react-redux';
import axios from 'axios';
import GuestPrompt from '../loading/GuestPrompt';

const screenWidth = Dimensions.get('window').width;


const sampleStats = {
  controlHours: [
    { x: "Jan", y: 10 },
    { x: "Feb", y: 20 },
    { x: "Mar", y: 30 },
    { x: "Apr", y: 40 },
    { x: "May", y: 50 },
  ],
  fieldCoverage: [
    { x: "Explored", y: 70 },
    { x: "Unexplored", y: 30 },
  ],
  measurements: [
    { x: "Success", y: 80 },
    { x: "Failed", y: 20 },
  ],
};

export const AppStats = () => {
  const { language } = useSelector((state: any) => state.settings);
  const { user } = useSelector((state: any) => state.auth); // assuming user object contains id and username

  const [fieldCoverage, setFieldCoverage] = useState([{ x: "Explored", y: 0 }, { x: "Unexplored", y: 1 }]);
  const [measurementRates, setMeasurementRates] = useState([{ x: "Success", y: 0 }, { x: "Failed", y: 1 }]);
  const [loading, setLoading] = useState(true);
  const [measurementDurations, setMeasurementDurations] = useState<{ x: string; y: number }[]>([]);

  if (language === 'English') i18n.locale = 'en';
  else if (language === 'Български') i18n.locale = 'bg';
  else i18n.locale = 'de';

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [fieldsRes, measurementsRes, healthyRes, diseasedRes] = await Promise.all([
          axios.get(`https://agribot-backend-abck.onrender.com/fields/getfields/${user.id}`),
          axios.get(`https://agribot-backend-abck.onrender.com/measurements/read/${user.username}`),
          axios.get(`https://agribot-backend-abck.onrender.com/plants/healthy/user/${user.id}`),
          axios.get(`https://agribot-backend-abck.onrender.com/plants/diseased/user/${user.id}`),
        ]);

        const fields = fieldsRes.data;
        const measurements : Array<any> = measurementsRes.data;
        const healthy = healthyRes.data;
        const diseased = diseasedRes.data;

        const formattedDurations = measurements
        .filter(m => m.createdAt && m.duration)
        .map((m, index) => ({
          x: `#${index + 1}`,
          y: m.duration / 60 // convert ms to minutes
        }));
        setMeasurementDurations(formattedDurations);
        console.log("STAT_REACTAPP: "+JSON.stringify(formattedDurations));
        // Field Coverage
        let totalExplored = 0;
        let totalArea = 0;
        for (const field of fields) {
          const fieldMeasurements = measurements.filter(m => m.fieldId === field.id);
          const sumExplored = fieldMeasurements.reduce((acc, m) => acc + (m.explored || 0), 0);
          const avgExplored = fieldMeasurements.length ? sumExplored / fieldMeasurements.length : 0;

          totalExplored += avgExplored;
          totalArea += parseFloat(field.area);
        }

        const exploredPercent = totalArea > 0 ? (totalExplored / totalArea) * 100 : 0;
        const unexploredPercent = 100 - exploredPercent;

        setFieldCoverage([
          { x: i18n.t('stats.explored'), y: exploredPercent },
          { x: i18n.t('stats.unexplored'), y: unexploredPercent }
        ]);

        // Measurement Rates
        const totalHealthy = healthy.length;
        const totalDiseased = diseased.length;
        const total = totalHealthy + totalDiseased;

        const successRate = total > 0 ? (totalHealthy / total) * 100 : 0;
        const failRate = 100 - successRate;

        setMeasurementRates([
          { x: i18n.t('stats.success'), y: successRate },
          { x: i18n.t('stats.failed'), y: failRate }
        ]);
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  if(!user) return <GuestPrompt feature='view app stats'/>

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{i18n.t('stats.appStats')}</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#4caf50" />
      ) : (
        <>
              <Text style={styles.subHeader}>{i18n.t('stats.hours')}</Text>
              <VictoryChart theme={VictoryTheme.material} width={0.9*screenWidth}>
                <VictoryBar data={measurementDurations} style={{ data: { fill: "#4caf50" } }} />
              </VictoryChart>
          {/* Field Coverage */}
          <Text style={styles.subHeader}>{i18n.t('stats.fieldCoverage')}</Text>
          <VictoryPie
            data={fieldCoverage}
            colorScale={["#4caf50", "#ff9800"]}
            style={{ labels: { fill: "#FFF" } }}
            width={0.9 * screenWidth}
            innerRadius={50}
          />

          {/* Measurement Success Rate */}
          <Text style={styles.subHeader}>{i18n.t('stats.measurementRates')}</Text>
          <VictoryPie
            data={measurementRates}
            colorScale={["#4caf50", "#f44336"]}
            style={{ labels: { fill: "#FFF" } }}
            width={0.9 * screenWidth}
            innerRadius={50}
          />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 15,
    backgroundColor: "#222c2e",
    borderRadius: 8,
    marginTop: 10,
  },
  header: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  subHeader: {
    color: "#FFF",
    fontSize: 16,
    marginVertical: 10,
  },
});
