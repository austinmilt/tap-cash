import { ProfileNavScreen, TopNavScreen, TopRouteParams } from "../common/navigation";
import { useEffect, useState } from "react";
import { Button } from "../components/Button";
import { Screen } from "../components/Screen";
import { View } from "../components/View";
import { Text } from "../components/Text";
import { useUserProfile } from "../components/profile-provider";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Avatar, GridList } from "react-native-ui-lib";
import { AppLogo } from "../components/AppLogo";
import { TouchableOpacity, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import { COLORS } from "../common/styles";
import { useRecentActivity } from "../api/client";
import { Activity } from "../components/Activity";
import { BigDollars } from "../components/BigDollars";

type Props = NativeStackScreenProps<TopRouteParams, TopNavScreen.HOME>;

export function HomeScreen({ navigation }: Props): JSX.Element {
    const { name, imageUrl, usdcBalance, email, syncUsdcBalance, loggedIn } = useUserProfile();
    const { submit: fetchRecentActivity, data: recentActivity } = useRecentActivity();
    const [displayWelcome, setDisplayWelcome] = useState(true);

    // update home data each time the user returns to the screen
    // https://reactnavigation.org/docs/navigation-lifecycle
    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            if (loggedIn && email) {
                fetchRecentActivity({
                    memberEmail: email,
                    limit: 5
                });
                syncUsdcBalance();
            }
        });

        return unsubscribe;
    }, [navigation, loggedIn, email, fetchRecentActivity, syncUsdcBalance]);

    return (
        <Screen gap-lg center style={styles.home}>
            <View style={styles.header}>
                <View style={styles.logo}>
                    <AppLogo primary fontSize={48} />
                </View>
                <View style={styles.user} gap-sm>
                    <Text gray-dark text-md>
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
            <View padding-md flexG gap-lg centerV style={{ width: "90%" }}>
                <BigDollars>{usdcBalance ?? 0}</BigDollars>
                <Button
                    primary
                    text-lg
                    label="Send"
                    style={styles.button}
                    onPress={() => navigation.navigate(TopNavScreen.SEND)}
                />
            </View>
            {recentActivity?.length ?
                <View style={styles.history} >
                    <Text text-lg gray-dark>Recent Activity</Text>
                    <GridList
                        data={recentActivity}
                        renderItem={({ item }) => (
                            <Activity item={item} />
                        )}
                        itemSpacing={0}
                        listPadding={0}
                        numColumns={1}
                    />
                </View>
                :
                (displayWelcome && <View style={styles.welcome}>
                    <TouchableWithoutFeedback onPress={() => setDisplayWelcome(false)}>
                        <Text style={styles.closeButton}>✖</Text>
                    </TouchableWithoutFeedback>
                    <View centerH padding-lg gap-md style={{ width: "100%" }}>
                        {/* TODO Add Icon */}
                        <View style={styles.welcomeIcon}></View>
                        <Text text-lg gray-dark>Welcome to Tap!</Text>
                        <View style={{ width: "80%" }}>
                            <Text text-md gray-medium center padding-sm>
                                Deposit cash
                                to start sending money to friends.
                            </Text>
                        </View>
                        <TouchableOpacity onPress={() => navigation.navigate(
                            TopNavScreen.PROFILE,
                            { screen: ProfileNavScreen.ADD_FUNDS }
                        )}>
                            <Text text-lg primary-medium>Add funds</Text>
                        </TouchableOpacity>
                    </View>
                </View>)}
        </Screen>
    )
}

const HOME_COLORS = {
    homeBackground: "#E8EDF6",
    welcomeBox: "#F7F9FC",
}

const styles = StyleSheet.create({
    home: {
        backgroundColor: HOME_COLORS.homeBackground,
    },
    buttonContainer: {
        width: '90%',
    },
    button: {
        height: 55,
        borderRadius: 8
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 15
    },
    logo: {
        flex: 1,
        paddingLeft: 18
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
        width: '100%',
        height: "50%",
        backgroundColor: COLORS.whiteish,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        padding: 20
    },
    welcome: {
        position: "relative",
        marginBottom: "8%",
        width: "90%",
        aspectRatio: 1,
        backgroundColor: HOME_COLORS.welcomeBox,
        borderRadius: 8,
        borderWidth: 0,
        justifyContent: "center",
        alignItems: "center"
    },
    closeButton: {
        position: "absolute",
        top: 10,
        right: 20,
        fontSize: 30,
        color: COLORS.grayLight,
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
