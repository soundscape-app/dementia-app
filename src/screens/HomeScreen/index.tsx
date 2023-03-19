import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import WebView from 'react-native-webview';
import { ParamListBase, useNavigation, useFocusEffect } from '@react-navigation/native';
import styled from 'styled-components/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BackHandler } from 'react-native';
import * as Location from 'expo-location';
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';

const Button = ({ color, title, navigation }: { color: string, title: string, navigation: NativeStackNavigationProp<ParamListBase> }) => {
  const handleNavigate = ({ color, title }: { color: string, title: string }) => {
    navigation.navigate('Detail', { color: color, title: title });
  }

  return (
    <CustomButton color={color} onPress={() => handleNavigate({ color: color, title: title })} > 
      <Text style={style.buttonText}>{title}</Text>
    </CustomButton>
  );
};

const CustomButton = styled.TouchableOpacity<{ color: string }>`
  flex: 1;
  align-items: center;
  justify-content: center;
  background-color: ${props => props.color};
`

const HomeScreen = () => {
  const [ location, setLocation ] = useState<Location.LocationObject | null>(null);
  const [ errorMsg, setErrorMsg ] = useState<string | null>(null);
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();

  const handleExit = () => { 
    BackHandler.exitApp();
  };

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => true;
      BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [])
  );

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied.');
        return;
      }

      let location = await Location.getCurrentPositionAsync();
      setLocation(location);
    })();
  }, []);
  
  return (
    <View style={style.container}>
      <Text style={style.title}>내손에 치매안심주치의</Text>
      <View style={style.map}>
        {/* <Image style={{ width: 'auto', resizeMode: 'contain' }} source={require('#/imgs/mapImage.png')} /> */}
        <MapView style={style.mapStyle} 
          region={{ 
            latitude: location?.coords?.latitude ?? 37.00000,
            longitude: location?.coords?.longitude ?? 126.00000,
            latitudeDelta: 0.00922,
            longitudeDelta: 0.00922,
          }}
          provider={PROVIDER_GOOGLE}
        >
          <Marker
            coordinate={{
              latitude: location?.coords?.latitude ?? 37.00000,
              longitude: location?.coords?.longitude ?? 126.00000,
            }}
            pinColor='#fc324e'
            title='내 위치'
            description='내 위치'
          />
        </MapView>
      </View>
      <View style={style.content}>
        <View style={style.buttonBox}>
          <View style={style.button}>
            <Button color='#fac125' title='금호권역' navigation={navigation} />
          </View>
          <View style={style.button}>
            <Button color='#1c8032' title='마장권역' navigation={navigation} />
          </View>
        </View>
        <View style={style.buttonBox}>
          <View style={style.button}>
            <Button color='#2338b0' title='성수권역' navigation={navigation} />
          </View>
          <View style={style.button}>
            <Button color='#6d36b5' title='왕십리권역' navigation={navigation} />
          </View>
        </View>
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
    gap: 10,
    alignItems: 'center', 
    justifyContent: 'space-evenly',
    backgroundColor: '#ffffff',
  },
  mapStyle: {
    width: '95%',
    height: '95%',
  },
  title: {
    fontSize: 32,
    width: '100%',
    textAlign: 'center',
    fontWeight: 'bold',
    borderBottomLeftRadius: 17,
    borderBottomRightRadius: 17,
    paddingVertical: 10,
    backgroundColor: '#f79c40',
  },
  map: {
    flex: 4,
    width: '100%',
    alignContent: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#d5e9f5',
  },
  content: {
    flex: 1.4,
    width: '100%',
    flexDirection: 'column',
  },
  buttonBox: {
    flex: 1,
    width: '100%',
    flexDirection: 'row',
  },
  button: {
    flex: 1,
    width: '100%',
  },
  buttonText: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#ffffff',
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
    paddingBottom: 10,
  },
});

export default HomeScreen;