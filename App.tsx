import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Home } from './src/modules/Home';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Authorize } from './src/modules/Authorize';
import { Send } from './src/modules/Send';
import { Profile } from './src/modules/Profile';

const Stack = createNativeStackNavigator();

export default function App(): JSX.Element {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="LogIn"
          component={Authorize}
          options={{title: 'Log In'}}
        />
        <Stack.Screen
          name="Home"
          component={Home}
          options={{title: 'Home'}}
        />
        <Stack.Screen
          name="Send"
          component={Send}
          options={{title: 'Send'}}
        />
        <Stack.Screen
          name="Profile"
          component={Profile}
          options={{title: 'Profile'}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

