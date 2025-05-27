import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { DiseaseType } from '@/constants/types/DiseaseInterfaces';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import i18n from '@/translations/i18n';

export default function DiseaseModalContent({ disease }: { disease: DiseaseType }) {

  const tags: Array<string> = disease?.affectedParts?.split(',');

  const { language, controlStyle, unitsSystem } = useSelector((state: RootState) => state.settings);

  if(language === 'English') i18n.locale = 'en';
  else if(language === 'Български') i18n.locale = 'bg';
  else i18n.locale = 'de';

  console.log(language)

  return (
    <View style={styles.diseaseContainer}>
      {/* Header Image */}
      {disease.imageUrl ? (
        <Image source={{ uri: disease.imageUrl }} style={styles.diseaseImage} resizeMode="cover" />
      ) : (
        <View style={styles.diseaseImagePlaceholder}>
          <Ionicons name="leaf-outline" size={64} color="#888" />
        </View>
      )}

      {/* Title */}
      <Text style={styles.diseaseTitle}>{disease.diseaseName}</Text>

      {/* Affected Parts */}
      <View style={styles.tagsContainer}>
        {tags?.map((tag, index) => (
          <View key={index} style={styles.tag}>
            <MaterialCommunityIcons name="virus-outline" size={16} color="#4caf50" />
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}
      </View>

      {/* Description */}
      <Text style={styles.description}>{disease.description}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  diseaseContainer: {
    marginBottom: 20,
  },
  diseaseImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 15,
  },
  diseaseImagePlaceholder: {
    width: '100%',
    height: 200,
    backgroundColor: '#333',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  diseaseTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    color: '#ccc',
    marginLeft: 4,
    fontSize: 13,
  },
  description: {
    fontSize: 15,
    color: '#ddd',
    lineHeight: 22,
  },
});
