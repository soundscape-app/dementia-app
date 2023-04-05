import React, { useEffect, useRef, useState } from 'react';
import * as SQLite from 'expo-sqlite';
import { View, Text, StyleSheet, Image, ScrollView, Button, TouchableOpacity } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import styled from 'styled-components/native';
import { Linking } from 'react-native';
import MapView, { PROVIDER_GOOGLE, Marker, MapMarker } from 'react-native-maps';
import * as Location from 'expo-location';
import Icon from 'react-native-vector-icons/FontAwesome';

import Loading from '@/components/Loading';

const internalDbName = "hospital.db";

const getHospitalLists = async (title: string, setList: React.Dispatch<React.SetStateAction<Hospital[]>>) => {
  let likeStringList: string[] = [];
  switch (title) {
    case '성수권역':
      likeStringList.push('%성수%');
      break;
    case '금호권역':
      likeStringList.push('%금호%');
      likeStringList.push('%옥수%');
      break;
    case '마장권역':
      likeStringList.push('%용답%');
      likeStringList.push('%동대문%');
      break;
    case '왕십리권역':
      likeStringList.push('%왕십리%');
      likeStringList.push('%행당%');
      break;
  }

  let queryString = 'SELECT * FROM hospital WHERE (';
  likeStringList.map((likeQuery, idx) => {
    queryString += `district LIKE \'${likeQuery}\'`;
    if(idx !== likeStringList.length - 1) queryString += ' OR ';
  });
  queryString += ') ORDER BY favorite DESC, hospital_name;';

  console.log(queryString);

  const db = SQLite.openDatabase(internalDbName);
  db.transaction((trx) => {
    trx.executeSql(
      queryString,
      [],
      (_, { rows }) => {
        const obj = rows._array;
        setList(obj);
      }
    )
  });
}

type ParamList = {
  routeParam: {
    color: string,
    title: string,
  }
};

const Title = styled.Text<{ color: string }>`
  font-size: 32px;
  width: 100%;
  text-align: center;
  font-weight: bold;
  border-bottom-left-radius: 17px;
  border-bottom-right-radius: 17px;
  padding-vertical: 10px;
  color: #ffffff;
  background-color: ${props => props.color};
`;

const FavoriteButton = styled.TouchableOpacity<{ favorite: boolean }>`
  border: 1px solid #f79c40;
  border-radius: 10px;
  width: 20px;
  height: 20px;
  background-color: ${props => props.favorite ? '#f79c40' : '#ffffff00'};
`;

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

const DetailScreen = () => {
  const mapRef = useRef<MapView>(null);
  const markerRef = useRef<(MapMarker | null)[]>([]);

  const route = useRoute<RouteProp<ParamList, 'routeParam'>>();
  const { color, title } = route.params;
  const [ hospital, setHospital ] = useState([] as Hospital[]);
  const [ location, setLocation ] = useState<Location.LocationObject | null>(null);
  const [ errorMsg, setErrorMsg ] = useState<string | null>(null);
  const [ selectedIdx, setSelectedIdx ] = useState(-1);

  const loadAsync = async () => {
    await getHospitalLists(title, setHospital);
  }

  const handleFavorite = async (id: number, favorite: boolean) => {
    const db = SQLite.openDatabase(internalDbName);

    const queryString = `UPDATE hospital SET favorite=${!favorite} WHERE id=${id}`

    db.transaction((trx) => {
      trx.executeSql(
        queryString,
      )
    });

    await loadAsync();
  };
  
  const handleFocusOnLocation = ({ latitude, longitude, idx }: { latitude: number, longitude: number, idx: number }) => {
    mapRef.current?.animateToRegion({
      latitude: latitude,
      longitude: longitude,
      latitudeDelta: 0.0075,
      longitudeDelta: 0.0075,
    }, 600);
    if(idx !== -1) markerRef.current[idx]?.showCallout();
  };

  useEffect(() => {
    (async () => {
      await loadAsync();
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
      <Title color={color}>{title}</Title>
      <View style={style.map}>
        <TouchableOpacity style={style.myPositionButton} onPress={() => handleFocusOnLocation({ latitude: location?.coords?.latitude ?? 37.00000, longitude: location?.coords?.longitude ?? 126.00000, idx: -1})}>
          <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#FFFFFF'}}>내 위치</Text>
        </TouchableOpacity>
        <MapView style={style.mapStyle} 
          ref={mapRef}
          region={{ 
            latitude: location?.coords?.latitude ?? 37.00000,
            longitude: location?.coords?.longitude ?? 126.00000,
            latitudeDelta: 0.025,
            longitudeDelta: 0.025,
          }}
          provider={PROVIDER_GOOGLE}
        >
          <Marker
            coordinate={{
              latitude: 37.546356158998016,
              longitude: 127.04433027743359,
            }}
            pinColor='aqua'
            title='성동구치매안심센터'
            description='서울 성동구 왕십리로 5길 3 5층'
          />
          <Marker
            coordinate={{
              latitude: location?.coords?.latitude ?? 37.561680692372406,
              longitude: location?.coords?.longitude ?? 127.03523097146459,
            }}
            pinColor='#fc324e'
            title='내 위치'
            description='내 위치'
          />

          {hospital.map((obj, idx) => {
            return (
              <Marker
                key={obj.id}
                coordinate={{
                  latitude: parseFloat(obj.latitude),
                  longitude: parseFloat(obj.longitude),
                }}
                ref={el => markerRef.current[idx] = el}
                pinColor={color}
                title={obj.hospital_name}
                description={obj.address}
              />
            );
          })}
        </MapView>
      </View>
      <View style={style.list}>
        <View style={style.sdg}>
          <Text style={{ color: '#f79caa', fontSize: 22, fontWeight: 'bold' }} onPress={() => Linking.openURL(`tel:02-499-8071`)} >성동구치매안심센터 (02-499-8071)</Text>
          <Text style={{ color: '#000000', fontSize: 11 }}>서울 성동구 왕십리로 5길 3 5층</Text>
        </View>
        <ScrollView style={style.scrollView}>
          {hospital.map((obj, idx) => {
            return (
              <View key={obj.id * 2}>
                <View key={obj.id * 2 + 1} style={style.textBox}>
                  <Text style={style.listTextStyle} 
                    key={obj.hospital_name}  
                    onPress={() => {
                      setSelectedIdx(idx);
                      handleFocusOnLocation({ latitude: parseFloat(obj.latitude), longitude: parseFloat(obj.longitude), idx: idx })
                    }}>
                      {obj.hospital_name} ({obj.contact}) 
                  </Text>
                  {(idx === selectedIdx) && <Icon name="phone" size={30} onPress={() => Linking.openURL(`tel:${obj.contact}`)} style={{ position:'absolute', right:25 }} color="#f79c40" />}
                  <FavoriteButton favorite={obj.favorite} onPress={async () => handleFavorite(obj.id, obj.favorite)} />
                </View>
                <Text style={style.listSmallTextStyle} key={obj.address}>{obj.address}</Text>
              </View>
            );
          })}
        </ScrollView>        
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
    justifyContent: 'flex-start',
    backgroundColor: '#ffffff',
  },
  myPositionButton: {
    position: 'absolute',
    top: 10,
    right: 20,
    width: 50,
    height: 30,
    borderRadius: 10,
    backgroundColor: '#fc324e',
    zIndex: 2,
    textAlign: 'center',
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
  },
  sdg: {
    flex: 0.15,
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f4f4f4',
    borderRadius: 10,
    marginBottom: 10,
    gap: 4,
    padding: 4,
  },
  mapStyle: {
    width: '95%',
    height: '95%',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#f4f4f4',
    borderRadius: 10,
    paddingVertical: 12,
  },
  listTextStyle: {
    fontSize: 18,
    paddingBottom: 4,
    paddingHorizontal: 10,
    color: '#f79c40',
    fontWeight: 'bold',
  },
  listSmallTextStyle: {
    fontSize: 12,
    paddingBottom: 16,
    paddingHorizontal: 10,
    color: '#000000',
    fontWeight: '300',
  },
  textBox: {
    flex: 1,
    justifyContent: 'space-between',
    flexDirection: 'row',
    marginRight: 10,
  },
  list: {
    flex: 4,
    paddingHorizontal: 15,
    flexDirection: 'column',
    textAlign: 'left',
  },
  map: {
    flex: 2,
    width: '100%',
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
    backgroundColor: '#d5e9f5',
    zIndex: 1,
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
  listBox: {
    flex: 1,
    width: '96%',
    backgroundColor: 'rgba(12,12,12,0.05)',
    borderRadius: 10,
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

export default DetailScreen;