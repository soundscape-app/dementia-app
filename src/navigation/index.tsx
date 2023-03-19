import React from "react";
import { NavigationContainer, useFocusEffect, useRoute } from "@react-navigation/native";

import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { BackHandler } from 'react-native';


import HomeScreen from '@/screens/HomeScreen';
import DetailScreen from "@/screens/DetailScreen";
import LandingScreen from "@/screens/LandingScreen";

const Stack = createNativeStackNavigator();

const RootNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="Landing">
      <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Detail" component={DetailScreen} options={{ headerShown: false, gestureEnabled: false }} />
      <Stack.Screen name="Landing" component={LandingScreen} options={{ headerShown: false, gestureEnabled: false }} />
    </Stack.Navigator>
  );
};

const Navigation = () => {
  return (
    <NavigationContainer>
      <RootNavigator />
    </NavigationContainer>
  );
};

export default Navigation; 