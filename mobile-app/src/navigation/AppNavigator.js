import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import SportSelectionScreen from '../screens/SportSelectionScreen';
import BodyMetricsScreen from '../screens/BodyMetricsScreen';
import HomeScreen from '../screens/HomeScreen';
import ProgressScreen from '../screens/ProgressScreen';
import AddMealScreen from '../screens/AddMealScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SplashScreen from '../screens/SplashScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Bottom Tab Navigator (Main App)
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#4A90E2',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen 
        name="HomeTab" 
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color }) => <span style={{ fontSize: 24 }}>🏠</span>,
        }}
      />
      <Tab.Screen 
        name="ProgressTab" 
        component={ProgressScreen}
        options={{
          tabBarLabel: 'Progress',
          tabBarIcon: ({ color }) => <span style={{ fontSize: 24 }}>📊</span>,
        }}
      />
      <Tab.Screen 
        name="AddMealTab" 
        component={AddMealScreen}
        options={{
          tabBarLabel: 'Add Meal',
          tabBarIcon: ({ color }) => <span style={{ fontSize: 24 }}>➕</span>,
        }}
      />
      <Tab.Screen 
        name="ProfileTab" 
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color }) => <span style={{ fontSize: 24 }}>👤</span>,
        }}
      />
    </Tab.Navigator>
  );
}

// Stack Navigator (Auth Flow + Main App)
export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="SportSelection" component={SportSelectionScreen} />
        <Stack.Screen name="BodyMetrics" component={BodyMetricsScreen} />
        <Stack.Screen name="Home" component={MainTabs} />

      </Stack.Navigator>
    </NavigationContainer>
  );
}



// import React from 'react';
// import { NavigationContainer } from '@react-navigation/native';
// import { createNativeStackNavigator } from '@react-navigation/native-stack';
// import LoginScreen from '../screens/LoginScreen';
// import RegisterScreen from '../screens/RegisterScreen';
// import SportSelectionScreen from '../screens/SportSelectionScreen';
// import BodyMetricsScreen from '../screens/BodyMetricsScreen';
// import HomeScreen from '../screens/HomeScreen';

// const Stack = createNativeStackNavigator();

// export default function AppNavigator() {
//   return (
//     <NavigationContainer>
//       <Stack.Navigator
//         initialRouteName="Login"
//         screenOptions={{
//           headerShown: false,
//         }}
//       >
//         <Stack.Screen name="Login" component={LoginScreen} />
//         <Stack.Screen name="Register" component={RegisterScreen} />
//         <Stack.Screen name="SportSelection" component={SportSelectionScreen} />
//          <Stack.Screen name="BodyMetrics" component={BodyMetricsScreen} />
//          <Stack.Screen name="Home" component={HomeScreen} />
//       </Stack.Navigator>
//     </NavigationContainer>
//   );
// }