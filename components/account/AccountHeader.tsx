import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';

export const AccountHeader = ({ userPhoto }: { userPhoto?: string }) => {

  const user = useSelector((state: RootState) => state.auth.user);

  return (
    <View style={styles.headerContainer}>
      <Image source={ require('../../assets/images/account_profile_user_avatar_icon_219236.png') } style={styles.avatar} />
      <View style={styles.titleContainer}>
        <Text style={styles.userName}>{user ? user.username : "Name Surname"}</Text>
        <Text style={styles.userRole}>{user ? "User" : "Guest"}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 15,
  },
  titleContainer: {
    justifyContent: 'center',
  },
  userName: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  userRole: {
    color: '#808080',
    fontSize: 14,
  },
});
