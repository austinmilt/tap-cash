import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Home } from './src/modules/Home';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Authorize } from './src/modules/Authorize';
import { Send } from './src/modules/send/Send';
import { Profile } from './src/modules/Profile';
import { NavScreen } from './src/common/navigation';

const Stack = createNativeStackNavigator();

export default function App(): JSX.Element {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name={NavScreen.AUTHORIZE}
          component={Authorize}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name={NavScreen.HOME}
          component={Home}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name={NavScreen.SEND}
          component={Send}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name={NavScreen.PROFILE}
          component={Profile}
          options={{headerShown: false}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

