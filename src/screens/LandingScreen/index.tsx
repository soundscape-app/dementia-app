import React, { useEffect } from 'react';
import { Dimensions } from 'react-native';
import { View, StyleSheet, Image } from 'react-native';
import { ParamListBase, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

const LandingScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  const { height, width } = Dimensions.get('window');

  useEffect(() => {
    setTimeout(() => { navigation.navigate('Home') }, 3000);
  }, []);

  return (
    <View style={style.container}>
      <Image style={{ height: height, width: width, resizeMode: 'cover' }} source={require('#/splash.png')} />
    </View>
  );
};

const style = StyleSheet.create({
  container: {
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'flex-start',
    backgroundColor: '#ffffff',
  },
});

export default LandingScreen;