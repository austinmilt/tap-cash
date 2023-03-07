import { TopNavScreen, TopRouteParams } from "../common/navigation";
import { Button } from "../components/Button";
import { Screen } from "../components/Screen";
import { View } from "../components/View";
import { Text } from "../components/Text";
import { useUserProfile } from "../components/profile-provider";
import { Image } from "react-native-ui-lib";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

type Props = NativeStackScreenProps<TopRouteParams, TopNavScreen.HOME>;

export function HomeScreen({ navigation }: Props): JSX.Element {
    const { name, imageUrl, usdcBalance } = useUserProfile();

    return (
        <Screen>
            <View>
                {imageUrl && (
                    <Image source={{ uri: imageUrl }} />
                )}
                <Text>
                    {name}
                </Text>
                <Text>
                    ${usdcBalance ? usdcBalance.toFixed(2) : "0"}
                </Text>
            </View>
            <View flex row centerH bottom spread paddingH-30 width="80%" gap-sm>
                <Button
                    primary
                    label="Profile"
                    onPress={() => navigation.navigate(TopNavScreen.PROFILE)}
                />
                <Button
                    primary
                    label="Send"
                    onPress={() => navigation.navigate(TopNavScreen.SEND)}
                />
            </View>
        </Screen>
    )
}
