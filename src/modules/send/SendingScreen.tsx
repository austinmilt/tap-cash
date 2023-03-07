import { Button } from "../../components/Button";
import { Text } from "../../components/Text";
import { View } from "../../components/View";
import { SendNavScreen, SendStackRouteParams } from "../../common/navigation";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useSend } from "../../api/client";
import { useEffect } from "react";
import { useUserProfile } from "../../components/profile-provider";

type Props = NativeStackScreenProps<SendStackRouteParams, SendNavScreen.SENDING>;

export function SendingScreen(props: Props): JSX.Element {
    const { recipient, amount } = props.route.params;
    const profileContext = useUserProfile();
    const sendingContext = useSend();

    useEffect(() => {
        //TODO make sure this can only run once
        if (profileContext.email == null) {
            //TODO show some error state
            console.error("missing user email");
            return;
        } else if (profileContext.wallet == null) {
            //TODO show some error state
            console.error("missing user wallet");
            return;
        }
        sendingContext.submit({
            sender: profileContext.email,
            recipeient: recipient,
            amount: amount,
            privateKey: profileContext.wallet?.getKeypair()
        });
    }, []);

    return (
        <View>
            {
                sendingContext.loading ? (
                    <View flex center gap-md>
                        <Text text-lg>Sending...</Text>
                        <Text text-xl primary-light>${amount}</Text>
                        <Text text-lg>to</Text>
                        <Text text-xl primary-light>{recipient}</Text>
                    </View>
                ) : (
                    <View flex center>
                        <View flex center gap-md>
                            <Text text-lg>Sent ✅</Text>
                            <Text text-xl primary-light>${amount}</Text>
                            <Text text-lg>to</Text>
                            <Text text-xl primary-light>{recipient}</Text>
                        </View>
                        <View flex bottom>
                            <Button
                                primary
                                label="Home"
                                onPress={() => props.navigation.getParent()?.goBack()}
                            />
                        </View>
                    </View>
                )
            }
        </View>
    )
}
