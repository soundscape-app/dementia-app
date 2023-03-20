import React, { useEffect, useState } from 'react';
import * as SQLite from 'expo-sqlite';
import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import styled from 'styled-components/native';
import { Linking } from 'react-native';

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
};

const DetailScreen = () => {
  const route = useRoute<RouteProp<ParamList, 'routeParam'>>();
  const { color, title } = route.params;
  const [ hospital, setHospital ] = useState([] as Hospital[]);

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
  }

  useEffect(() => {
    loadAsync();
  }, []);

  return (
    <View style={style.container}>
      <Title color={color}>{title}</Title>
      <View style={style.map}>
        <Image style={{ width: 200, height: 200 }} source={require('#/imgs/mapImage.png')} />
      </View>
      <View style={style.list}>
        <ScrollView style={style.scrollView}>
          {hospital.map((obj, idx) => {
            return (
              <View key={obj.id * 2}>
                <View key={obj.id * 2 + 1} style={style.textBox}>
                  <Text style={style.listTextStyle} 
                    key={obj.hospital_name}  
                    onPress={() => Linking.openURL(`tel:${obj.contact}`)}>
                      {obj.hospital_name} ({obj.contact}) 
                  </Text>
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