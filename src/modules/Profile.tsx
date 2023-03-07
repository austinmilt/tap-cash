import { Image } from "react-native-ui-lib";
import { TopNavScreen, TopRouteParams } from "../common/navigation";
import { Button } from "../components/Button";
import { Screen } from "../components/Screen";
import { View } from "../components/View";
import { useUserProfile } from "../components/profile-provider";
import { Text } from "../components/Text";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

type Props = NativeStackScreenProps<TopRouteParams, TopNavScreen.PROFILE>;

export function Profile({ navigation }: Props): JSX.Element {
    const { imageUrl, name, wallet } = useUserProfile();

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
                <Button
                    primary
                    label="Home"
                    onPress={() => navigation.navigate(TopNavScreen.HOME)}
                />
            </View>
        </Screen>
    )
}
