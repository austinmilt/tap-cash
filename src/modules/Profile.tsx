import { Image } from "react-native-ui-lib";
import { NavScreen, Navigation } from "../common/navigation";
import { Button } from "../components/Button";
import { Screen } from "../components/Screen";
import { View } from "../components/View";
import { useUserProfile } from "../components/profile-provider";
import { Text } from "../components/Text";

interface Props {
    navigation: Navigation;
}

export function Profile({ navigation }: Props): JSX.Element {
    const { imageUrl, name, wallet } = useUserProfile();
    console.log(wallet?.getPublicKey().toBase58())

    return (
        <Screen>
            <View center>
                {imageUrl && (
                    <Image source={{ uri: imageUrl }} />
                )}
                <Text>
                    {name}
                </Text>
                <Text>
                    {wallet?.getPublicKey().toBase58()}
                </Text>
            </View>
            <View flex bottom>
                <Button.Primary
                    title="Home"
                    onPress={() => navigation.navigate(NavScreen.HOME)}
                />
            </View>
        </Screen>
    )
}
