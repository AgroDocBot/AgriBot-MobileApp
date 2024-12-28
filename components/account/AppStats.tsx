import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { VictoryChart, VictoryBar, VictoryPie, VictoryTheme } from 'victory-native';

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
  return (
    <View style={styles.container}>
      <Text style={styles.header}>App Statistics</Text>

      {/* Control Hours Chart */}
      <Text style={styles.subHeader}>Hours Spent Controlling Robot</Text>
      <VictoryChart theme={VictoryTheme.material}>
        <VictoryBar data={sampleStats.controlHours} style={{ data: { fill: "#4caf50" } }} />
      </VictoryChart>

      {/* Field Coverage Pie Chart */}
      <Text style={styles.subHeader}>Field Coverage</Text>
      <VictoryPie
        data={sampleStats.fieldCoverage}
        colorScale={["#4caf50", "#ff9800"]}
        style={{ labels: { fill: "#FFF" } }}
        innerRadius={50}
      />

      {/* Measurements Success Rate */}
      <Text style={styles.subHeader}>Measurement Success Rate</Text>
      <VictoryPie
        data={sampleStats.measurements}
        colorScale={["#4caf50", "#f44336"]}
        style={{ labels: { fill: "#FFF" } }}
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
