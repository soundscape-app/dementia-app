import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Image, Alert } from 'react-native';
import { ParamListBase, useNavigation, useFocusEffect } from '@react-navigation/native';
import styled from 'styled-components/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BackHandler } from 'react-native';
import * as Location from 'expo-location';
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import * as FileSystem from "expo-file-system";
import { Asset } from 'expo-asset';
import * as SQLite from 'expo-sqlite';

type Hospital = {
  hospital_name: string;
  address: string;
  district: string;
  contact: string;
  id: number;
  favorite: boolean;
  latitude: string;
  longitude: string;
};

async function makeDatabase() {
  const internalDbName = "hospital.db";
  const sqlDir = FileSystem.documentDirectory + "SQLite/";
  const csvFilePath = `${FileSystem.documentDirectory}hospital.csv`;

  const db = SQLite.openDatabase(internalDbName);
  db.transaction((trx) => {
    trx.executeSql(
      'CREATE TABLE IF NOT EXISTS hospital (id INTEGER PRIMARY KEY AUTOINCREMENT, hospital_name text, district text, contact text, address text, favorite integer, latitude text, longitude text, unique (hospital_name));',
    )
  });

  if (!(await FileSystem.getInfoAsync(sqlDir + internalDbName)).exists) {
    try {
      const res = await FileSystem.downloadAsync(
        Asset.fromModule(require('#/csv/hospital_list.csv')).uri,
        csvFilePath,
      ); 
      const copyRes = await FileSystem.readAsStringAsync(res.uri);
      const csvList = copyRes.split('\n');
      csvList.map((line, idx) => {
        if (line !== "") {
          const args = line.split(",");
          const hospital_name = args[0];
          const district = args[1];
          const contact = args[2];
          const address = args[3];
          const favorite = args[4];
          const latitude = args[5];
          const longitude = args[6];

          db.transaction((trx) => {
            trx.executeSql(
              `INSERT INTO hospital (hospital_name, district, contact, address, favorite, latitude, longitude) VALUES ("${hospital_name}", "${district}", "${contact}", "${address}", ${favorite}, "${latitude}", "${longitude}")`,
            )
          });
        }
      });
    }
    catch (err) {
      console.log(err);
      return;
    }
  }
}

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
  const internalDbName = "hospital.db";

  const [ hospital, setHospital ] = useState([] as Hospital[]);
  const [ location, setLocation ] = useState<Location.LocationObject | null>(null);
  const [ errorMsg, setErrorMsg ] = useState<string | null>(null);
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();

  const getAllHospitals = async () => {
    const db = SQLite.openDatabase(internalDbName);
    db.transaction((trx) => {
      trx.executeSql(
        'SELECT * FROM hospital',
        [],
        (_, { rows }) => {
          const obj = rows._array;
          setHospital(obj);
        }
      )
    });
  }
  
  const handleExit = () => { 
    BackHandler.exitApp();
  };

  const createTwoButtonAlert = () =>
    Alert.alert('내손에 치매안심주치의', '어플리케이션을 종료하시겠습니까?', [
      {
        text: '취소',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {text: '종료하기', onPress: () => handleExit()},
    ]);

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {createTwoButtonAlert(); return true;}
      BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [])
  );

  useEffect(() => {
    (async () => {
      await makeDatabase();
      await getAllHospitals();
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
          {hospital.map((item, idx) => {
            return (
              <Marker
                key={idx}
                coordinate={{
                  latitude: Number(item.latitude),
                  longitude: Number(item.longitude),
                }}
                pinColor='#56c46e'
                title={item.hospital_name}
                description={item.address}
              />
            );
          })}
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