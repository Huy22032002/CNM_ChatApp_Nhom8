import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Login from "./screens/login";
import Register from "./screens/register";
import HomeChat from "./screens/homeChat";
import VerifyOtp from "./screens/verifyOtp";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{ headerShown: false }}
        initialRouteName="login"
      >
        <Stack.Screen name="login" component={Login} />
        <Stack.Screen name="register" component={Register} />
        <Stack.Screen name="verifyOtp" component={Register} />
        <Stack.Screen name="homeChat" component={HomeChat} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
