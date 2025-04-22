import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Login from "./screens/login";
import Register from "./screens/register";
import HomeChat from "./screens/homeChat";
import VerifyOtp from "./screens/verifyOtp";
import Profile from "./screens/Profile";
import FindUserScreen from "./screens/findUserScreen";
import { Provider } from "react-redux";
import { store } from "./redux/store";
import ChatScreen from "./screens/ChatScreen";
import ChatGroupScreen from "./screens/ChatGroupScreen";
const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{ headerShown: false }}
          initialRouteName="login"
        >
          <Stack.Screen name="login" component={Login} />
          <Stack.Screen name="register" component={Register} />
          <Stack.Screen name="verifyOtp" component={VerifyOtp} />
          <Stack.Screen name="homeChat" component={HomeChat} />
          <Stack.Screen name="findUser" component={FindUserScreen} />
          <Stack.Screen name="profile" component={Profile} />
          <Stack.Screen name="chatScreen" component={ChatScreen} />
          <Stack.Screen name="chatGroupScreen" component={ChatGroupScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  );
}
