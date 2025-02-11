import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { VictoryChart, VictoryBar, VictoryPie, VictoryTheme } from 'victory-native';
import i18n from '@/translations/i18n';
import { useDispatch, useSelector } from 'react-redux';

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

export const  AppStats = () => {

  const { language, controlStyle, unitsSystem } = useSelector((state: any) => state.settings);

  if(language === 'English') i18n.locale = 'en';
  else if(language === 'Български') i18n.locale = 'bg';
  else i18n.locale = 'de';

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{i18n.t('stats.appStats')}</Text>

      {/* Control Hours Chart */}
      <Text style={styles.subHeader}>{i18n.t('stats.hours')}</Text>
      <VictoryChart theme={VictoryTheme.material} width={0.9*screenWidth}>
        <VictoryBar data={sampleStats.controlHours} style={{ data: { fill: "#4caf50" } }} />
      </VictoryChart>

      {/* Field Coverage Pie Chart */}
      <Text style={styles.subHeader}>{i18n.t('stats.fieldCoverage')}</Text>
      <VictoryPie
        data={sampleStats.fieldCoverage}
        colorScale={["#4caf50", "#ff9800"]}
        style={{ labels: { fill: "#FFF" } }}
        width={0.9*screenWidth}
        innerRadius={50}
      />

      {/* Measurements Success Rate */}
      <Text style={styles.subHeader}>{i18n.t('stats.measurementRates')}</Text>
      <VictoryPie
        data={sampleStats.measurements}
        colorScale={["#4caf50", "#f44336"]}
        style={{ labels: { fill: "#FFF" } }}
        width={0.9*screenWidth}
        innerRadius={50}
      />
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
