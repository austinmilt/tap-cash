import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Home } from './src/modules/Home';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Authenticate } from './src/modules/Authenticate';
import { Send } from "./src/modules/send/Send";
import { Profile } from './src/modules/Profile';
import { NavScreen } from './src/common/navigation';

const Stack = createNativeStackNavigator();

export default function App(): JSX.Element {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={NavScreen.AUTHORIZE} screenOptions={{headerShown: false}}>
        <Stack.Screen
          name={NavScreen.AUTHORIZE}
          component={Authenticate}
        />
        <Stack.Screen
          name={NavScreen.HOME}
          component={Home}
        />
        <Stack.Screen
          name={NavScreen.SEND}
          component={Send}
        />
        <Stack.Screen
          name={NavScreen.PROFILE}
          component={Profile}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

