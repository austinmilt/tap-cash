import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Home } from './src/modules/Home';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthenticateScreen } from './src/modules/AuthenticateScreen';
import { Send } from "./src/modules/send/Send";
import { Profile } from './src/modules/Profile';
import { NavScreen } from './src/common/navigation';
import { SplashScreen } from './src/modules/SplashScreen';
import { UserProfileProvider } from './src/components/profile-provider';

const Stack = createNativeStackNavigator();

export default function App(): JSX.Element {
  return (
    <UserProfileProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName={NavScreen.SPLASH}
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen
            name={NavScreen.SPLASH}
            component={SplashScreen}
          />
          <Stack.Screen
            name={NavScreen.AUTHENTICATE}
            component={AuthenticateScreen}
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
    </UserProfileProvider>
  );
}

