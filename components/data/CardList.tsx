import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Dimensions, ScrollView } from 'react-native';
import Card from './Card';
import Ionicons from '@expo/vector-icons/Ionicons';
import AddFieldPopup from './AddFieldPopUp';
import { useSelector } from 'react-redux';
import AddMeasurementPopup from './AddMeasurementPopUp';
import i18n from '@/translations/i18n';
import ContentLoader from '../loading/ContentLoader';
import GuestPrompt from '../loading/GuestPrompt';
import { RootState } from '@/redux/store';
import { FieldData, FieldType, MeasurementFieldData, MeasurementType } from '@/constants/types/FieldInterfaces';
import SupportedCropsModal from './SupportedCropsModal';

export default function CardList({ activeTab, searchQuery }: {activeTab: 'fields' | 'measurements' | "diseases", searchQuery: string}) {
  const [isPopupVisible, setPopupVisible] = useState(false);
  const [popupMode, setPopupMode] = useState<'add' | 'edit'>('add');
  const [fields, setFields] = useState<any[]>([]);
  const [measurements, setMeasurements] = useState<any[]>([]);
  const [diseases, setDiseases] = useState<any[]>([]);
  const [editData, setEditData] = useState<any>(null);

  // State for determining whether the loading screen should be displayed
  const [loadingFields, setLoadingFields] = useState(true);
  const [loadingMeasurements, setLoadingMeasurements] = useState(true);
  const [loadingDiseases, setLoadingDiseases] = useState(true);

  const [isPlantModalVisible, setPlantModalVisible] = useState(false);

  const [currentMeasurementField, setCurrentMeasurementField] = useState<any>(null);

  const userId = useSelector((state: RootState) => state.auth.user?.id);
  const user = useSelector((state: RootState) => state.auth.user);
  const username = useSelector((state: RootState) => state.auth.user?.username);

  const { language, controlStyle, unitsSystem } = useSelector((state: RootState) => state.settings);

  if(language === 'English') i18n.locale = 'en';
  else if(language === 'Български') i18n.locale = 'bg';
  else i18n.locale = 'de';

  useEffect(() => {
    if (userId) {
      fetch(`https://agribot-backend-abck.onrender.com/fields/getfields/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': 'https://agribot-backend-abck.onrender.com'
        },
      })
        .then((response) => response.json())
        .then((data) => setFields(data))
        .catch((error) => console.error('Error fetching fields:', error))
        .finally(() => setLoadingFields(false));
    }

    if (username) {
      fetch(`https://agribot-backend-abck.onrender.com/measurements/read/${username}`, {
        method: 'GET',
      })
        .then((response) => response.json())
        .then((data) => setMeasurements(data))
        .catch((error) => console.error('Error fetching measurements:', error))
        .finally(() => setLoadingMeasurements(false));
    }

    fetch(`https://agribot-backend-abck.onrender.com/diseases/all`, { method: 'GET' })
      .then((response) => response.json())
      .then((data) => setDiseases(data))
      .catch((error) => console.error('Error fetching diseases:', error))
      .finally(() => setLoadingDiseases(false));
    //console.log(diseases)
  }, [userId, username, fields]);

  const handleAdd = (fieldData: FieldData) => {
    console.log("Current user: "+user?.username);
    console.log("Current User ID: " + user?.id);
    const curId = user?.id;
    console.log("Added id: "+curId);
    fetch('https://agribot-backend-abck.onrender.com/fields/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'https://agribot-backend-abck.onrender.com'
      },
      body: JSON.stringify({
        fieldname: fieldData.fieldName,
        crop: fieldData.crop,
        area: fieldData.area,
        latitude: fieldData.location.latitude,
        longitude: fieldData.location.longitude,
        userId: curId,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        setFields((prev) => [...prev, data]);
        setPopupVisible(false);
      })
      .catch((error) => console.error('Error adding field:', error));
  };

  const handleEdit = (fieldData: FieldData) => {
    fetch(`https://agribot-backend-abck.onrender.com/fields/edit`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'https://agribot-backend-abck.onrender.com'
      },
      body: JSON.stringify({
        id: fieldData.id,
        fieldname: fieldData.fieldName,
        crop: fieldData.crop,
        area: fieldData.area,
        latitude: fieldData.location.latitude,
        longitude: fieldData.location.longitude,
        userId: user?.id,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Returned response: "+JSON.stringify(data));
        setFields((prev) =>
          prev.map((field) =>
            field.id === fieldData.id ? data : field
          )
        );
        setPopupVisible(false);
      })
      .catch((error) => console.error('Error editing field:', error));
  };

  const handleDelete = (fieldData: FieldData) => {
    fetch(`https://agribot-backend-abck.onrender.com/fields/delete`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'https://agribot-backend-abck.onrender.com'
      },
      body: JSON.stringify({
        id: fieldData.id
      }),
    })
      .then(() => {
        setFields((prev) =>
          prev.filter((field) => field.id !== fieldData.id)
        );
      })
      .catch((error) => console.error('Error deleting field:', error));
  };

  const handleAddMeasurement = (measurementData: {fieldId: number}) => {
    console.log("RETURNED_MEASUREMENT_DATA: "+JSON.stringify(measurementData));
    fetch('https://agribot-backend-abck.onrender.com/measurements/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'https://agribot-backend-abck.onrender.com'

      },
      body: JSON.stringify({ ...measurementData, userId }),
    })
      .then((response) => response.json())
      .then((data) => {
        setMeasurements((prev) => [...prev, data]);
        setPopupVisible(false);
      })
      .catch((error) => console.error('Error adding measurement:', error));
  };

  const handleEditMeasurement = (measurementData: MeasurementType) => {
    console.log("EDIT_MEASUREMENT_DATA: "+JSON.stringify(measurementData));
    fetch(`https://agribot-backend-abck.onrender.com/measurements/edit`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'https://agribot-backend-abck.onrender.com'

      },
      body: JSON.stringify({ ...measurementData, userId }),
    })
      .then((response) => response.json())
      .then((data) => {
        setMeasurements((prev) =>
          prev.map((measurement) =>
            measurement.id === measurementData.id ? data : measurement
          )
        );
        setPopupVisible(false);
      })
      .catch((error) => console.error('Error editing measurement:', error));
  };

  const handleDeleteMeasurement = (measurementData: MeasurementType) => {
    fetch(`https://agribot-backend-abck.onrender.com/measurements/delete`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'https://agribot-backend-abck.onrender.com'
      },
      body: JSON.stringify({ measurementId: measurementData.id, userId }),
    })
      .then(() => {
        setMeasurements((prev) =>
          prev.filter((measurement) => measurement.id !== measurementData.id)
        );
      })
      .catch((error) => console.error('Error deleting measurement:', error));
  };

  const filteredData =
    activeTab === 'fields'
      ? (
          fields.filter((item) =>
            item.fieldname.toLowerCase().includes(searchQuery.toLowerCase())
            
      ))
      : activeTab === 'measurements'
      ? (
          measurements.filter((item) =>
            item.createdAt.toLowerCase().includes(searchQuery.toLowerCase()) 
      ))
      : (
        diseases.filter((item) =>
            item.diseaseName.toLowerCase().includes(searchQuery.toLowerCase())

      ));
  
  const sortedData = [...filteredData].sort((a, b) => {
    if (activeTab === 'fields') {
      return a.fieldname.localeCompare(b.fieldname);
    } else if (activeTab === 'measurements') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(); // latest first
    } else if (activeTab === 'diseases') {
      return a.diseaseName.localeCompare(b.diseaseName);
    }
    return 0;
  });

  const supportedCrops = [
    { id: '1', name: i18n.t("classification.crops.Pepperbell"), latinName: 'Capsicum annuum', imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRVYKU6BuIusO1cSMmhBajVkzSg3LahtKdBdQ&s' },
    { id: '2', name: i18n.t("classification.crops.Corn"), latinName: 'Zea mays', imageUrl: 'https://plantura.garden/uk/wp-content/uploads/sites/2/2022/04/corn-cob.jpg' },
    { id: '3', name: i18n.t("classification.crops.Tomato"), latinName: 'Solanum lycopersicum', imageUrl: 'https://www.lacostegardencentre.com/files/images/news/how-to-grow-tomatoes-1000x666-65ead2e671f5b_og.jpg' },
    { id: '4', name: i18n.t("classification.crops.Potato"), latinName: 'Solanum tuberosum', imageUrl: 'https://cdn.mos.cms.futurecdn.net/Ys52dqtT4fLt6m3rpRLdxm.jpg' },
    { id: '5', name: i18n.t("classification.crops.Raspberry"), latinName: 'Rubus idaeus', imageUrl: 'https://www.fs.usda.gov/database/feis/plants/shrub/rubida/fruits.jpg' }
  ];
  
  if (!user) return <GuestPrompt feature='manage fields, measurements and diseases'/>

  const isLoading = 
  (activeTab === 'fields' && loadingFields) ||
  (activeTab === 'measurements' && loadingMeasurements) ||
  (activeTab === 'diseases' && loadingDiseases);

  if (isLoading) return <ContentLoader />;

  return (
    <ScrollView style={styles.wrapper}>
      {activeTab === 'diseases' && (
        <TouchableOpacity
          style={styles.plantsButton}
          onPress={() => setPlantModalVisible(true)}
        >
          <Text style={styles.plantsButtonText}>{i18n.t('classification.supportedCrops')}</Text>
        </TouchableOpacity>
      )}
      {sortedData.length ? (
        sortedData.map((item: any, index: number) => (
          <Card
            key={item.id}
            data={item}
            activeTab={activeTab}
            onEdit={(data: any, currentField : FieldType) => {
              setEditData(data);
              setPopupMode('edit');
              setPopupVisible(true);
              setCurrentMeasurementField(currentField);
              console.log("PASSED_EDIT_DATA: "+JSON.stringify(editData));
            }}
            onRemove={activeTab === 'measurements' ? handleDeleteMeasurement : handleDelete}
            fields={fields}
            measurements={measurements}
          />
        ))
      ) : (
        <Text style={styles.noResults}>No results found</Text>
      )}

      {activeTab === 'fields' && (
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            setPopupMode('add');
            setEditData(null);
            setPopupVisible(true);
          }}>
          <Ionicons name="add-outline" size={32} color="#fff" />
        </TouchableOpacity>
      )}

      {activeTab === 'measurements' && (
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            setPopupMode('add');
            setEditData(null);
            setPopupVisible(true);
          }}>
          <Ionicons name="add-outline" size={32} color="#fff" />
        </TouchableOpacity>
      )}

      {activeTab === 'fields' && (
        <AddFieldPopup
          visible={isPopupVisible}
          onClose={() => setPopupVisible(false)}
          onSubmit={popupMode === 'add' ? handleAdd : handleEdit}
          initialValues={editData}
          mode={popupMode}
        />
      )}

      {activeTab === 'measurements' && (
        <AddMeasurementPopup
          visible={isPopupVisible}
          onClose={() => setPopupVisible(false)}
          onSubmit={popupMode === 'add' ? handleAddMeasurement : handleEditMeasurement}
          userId={userId!}
          initialField={editData}
          mode={popupMode}
          currentField={currentMeasurementField}
        />
      )}

      <SupportedCropsModal
        visible={isPlantModalVisible}
        onClose={() => setPlantModalVisible(false)}
        crops={supportedCrops}
      />

    </ScrollView>
  );
}

const screenHeight = Dimensions.get('window').height;

const styles = StyleSheet.create({
  noResults: { color: '#ccc', textAlign: 'center', marginTop: 20 },
  addButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    marginTop: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  wrapper: {
    height: screenHeight * 0.75
  },
  plantsButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 8,
    marginVertical: 10,
    alignItems: 'center',
  },
  
  plantsButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 24
  },
});

