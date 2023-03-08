import { TopNavScreen, TopRouteParams } from "../common/navigation";
import { useState } from "react";

import { Button } from "../components/Button";
import { Screen } from "../components/Screen";
import { View } from "../components/View";
import { Text } from "../components/Text";
import { useUserProfile } from "../components/profile-provider";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Avatar } from "react-native-ui-lib";
import { AppLogo } from "../components/AppLogo";
import Spacer from "../components/Spacer";
import { TouchableOpacity, StyleSheet, Dimensions, TouchableWithoutFeedback } from 'react-native';
import { COLORS } from "../common/styles";

type Props = NativeStackScreenProps<TopRouteParams, TopNavScreen.HOME>;

const screenHeight = Dimensions.get('window').height;

export function HomeScreen({ navigation }: Props): JSX.Element {
    const { name, imageUrl, usdcBalance } = useUserProfile();
    const [displayWelcome, setDisplayWelcome] = useState(true);

    // TODO - add fetch recent activity
    const history = [];
    return (
        <Screen style={styles.home}>
            <View style={styles.header}>
                <View style={styles.logo}>
                    <AppLogo primary fontSize={48} />
                </View>
                <View style={styles.user} gap-sm>
                    <Text gray-dark>
                        Hello, {name}
                    </Text>
                    <TouchableOpacity onPress={() => navigation.navigate(TopNavScreen.PROFILE)}>
                        <Avatar
                            source={{ uri: imageUrl }}
                            size={48}
                        />
                    </TouchableOpacity>
                </View>
            </View>
            <Spacer size={50} />
            <View>
                <Text style={styles.balance} center>
                    ${usdcBalance ? usdcBalance.toFixed(2) : "0.00"}
                </Text>
            </View>
            <Spacer size={30} />
            <View style={styles.buttonContainer}>
                <Button
                    primary
                    text-lg
                    label="Send"
                    style={styles.button}
                    onPress={() => navigation.navigate(TopNavScreen.SEND)}
                />
            </View>
            <Spacer size={50} />

            {/* history ? txLogs : newCard */}


            {history.length ?
                <View style={styles.history} >
                    <Text text-lg gray-dark>Recent Activity</Text>
                </View>
                :
                (displayWelcome && <View style={styles.welcome}>
                    <TouchableWithoutFeedback onPress={() => setDisplayWelcome(false)}>
                        <Text style={styles.closeButton}>X</Text>
                    </TouchableWithoutFeedback>
                    <View center padding-lg gap-sm>
                        {/* TODO Add Icon */}
                        <View style={styles.welcomeIcon}></View>
                        <Text text-lg gray-dark>Welcome to Tap!</Text>
                        <Text text-md gray-medium center style={{ padding: 10 }}>
                            Deposit cash
                            to start sending money to friends.
                        </Text>
                        <TouchableOpacity onPress={() => navigation.navigate(TopNavScreen.HOME)}>
                            <Text text-lg gray-dark style={{ color: 'blue' }}>Add funds</Text>
                        </TouchableOpacity>
                    </View>
                </View>)}
        </Screen>
    )
}

const styles = StyleSheet.create({
    home: {
        backgroundColor: COLORS.homeBackground,
    },
    buttonContainer: {
        width: '90%',
        alignSelf: 'center',
    },
    button: {
        height: 55,
        borderRadius: 8
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 30,
    },
    logo: {
        flex: 1,
    },
    user: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    balance: {
        fontSize: 60,
        color: COLORS.grayDark,
        fontFamily: "Jost-ExtraBold",
    },
    history: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        height: screenHeight * 0.5,
        backgroundColor: 'white',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        padding: 20
    },
    welcome: {
        position: 'absolute',
        bottom: screenHeight * 0.08,
        alignSelf: 'center',
        width: '90%',
        aspectRatio: 1,
        backgroundColor: COLORS.welcomeBox,
        borderRadius: 8,
        borderWidth: 0,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 5
    },
    closeButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        fontSize: 20,
        fontWeight: 'bold',
    },
    welcomeIcon: {
        alignSelf: 'center',
        width: '30%',
        aspectRatio: 1,
        backgroundColor: '#E8EDF7',
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1.33,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 2,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 5
    }
});
