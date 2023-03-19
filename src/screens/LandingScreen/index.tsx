import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { ParamListBase, useNavigation } from '@react-navigation/native';
import styled from 'styled-components/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

const LandingScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();

  useEffect(() => {
    setTimeout(() => { navigation.navigate('Home') }, 3000);
  }, []);

  return (
    <View style={style.container}>
      <View style={style.header}>
        <Image style={style.headerImage} source={require('#/imgs/mainLogo.png')} />
      </View>
      <View style={style.map}>
        <Image style={style.mapImage} source={require('#/imgs/mapImage.png')} />
      </View>
      <View style={style.footer}>
        <Image style={style.footerLogo} source={require('#/imgs/footerLogo.png')} />
      </View>
    </View>
  );
};

const style = StyleSheet.create({
  container: {
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'flex-start',
    backgroundColor: '#d5e9f5',
  },
  header: {
    flex: 2,
    paddingTop: 130,
  },
  headerImage: {
    width: 300,
    height: 200,
    resizeMode: 'contain',
  },
  map: {
    flex: 5,
  },
  mapImage: {
    width: 370,
    height: 370,
    resizeMode: 'contain',
  },
  footerLogo: {
    width: 220,
    height: 80,
    resizeMode: 'contain',
  },
  footer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: '100%',
    paddingBottom: 50,
  },
});

export default LandingScreen;