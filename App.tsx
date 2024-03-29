import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { HomeScreen } from './src/modules/HomeScreen';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthenticateScreen } from './src/modules/AuthenticateScreen';
import { TopNavScreen, TopRouteParams } from './src/common/navigation';
import { SplashScreen } from './src/modules/SplashScreen';
import { UserProfileProvider } from './src/components/profile-provider';
import { SendStack } from './src/modules/send/SendStack';
import { ProfileStack } from './src/modules/profile/ProfileStack';
import { StatusBar } from 'react-native';
// for using solana utils in the app
// see https://github.com/uuidjs/uuid#getrandomvalues-not-supported
import 'react-native-get-random-values';

const Stack = createNativeStackNavigator<TopRouteParams>();

export default function App(): JSX.Element {
  return (
    <>
      <StatusBar hidden />
      <UserProfileProvider>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName={TopNavScreen.SPLASH}
            screenOptions={{ headerShown: false }}
          >
            <Stack.Screen
              name={TopNavScreen.SPLASH}
              component={SplashScreen}
            />
            <Stack.Screen
              name={TopNavScreen.AUTHENTICATE}
              component={AuthenticateScreen}
            />
            <Stack.Screen
              name={TopNavScreen.HOME}
              component={HomeScreen}
              options={{ gestureEnabled: false }}
            />
            <Stack.Screen
              name={TopNavScreen.SEND}
              component={SendStack}
            />
            <Stack.Screen
              name={TopNavScreen.PROFILE}
              component={ProfileStack}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </UserProfileProvider>
    </>
  );
}