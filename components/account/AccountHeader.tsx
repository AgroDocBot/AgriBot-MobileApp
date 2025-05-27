import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import i18n from '@/translations/i18n';

export const AccountHeader = ({ userPhoto }: { userPhoto?: string }) => {

  const { language } = useSelector((state: RootState) => state.settings);
  const user = useSelector((state: RootState) => state.auth.user);

  if (language === 'English') i18n.locale = 'en';
  else if (language === 'Български') i18n.locale = 'bg';
  else i18n.locale = 'de';

  // Displays username and avatar
  return (
    <View style={styles.headerContainer}>
      <Image source={ require('../../assets/images/account_profile_user_avatar_icon_219236.png') } style={styles.avatar} />
      <View style={styles.titleContainer}>
        <Text style={styles.userName}>{user ? user.username : "Name Surname"}</Text>
        <Text style={styles.userRole}>{user ? i18n.t("personal.user") : i18n.t("personal.guest")}</Text>
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
