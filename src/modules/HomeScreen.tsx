import { TopNavScreen, TopRouteParams } from "../common/navigation";
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
import { formatUsd } from "../common/number";
import { useRecentActivity } from "../api/client";
import { Activity } from "../components/Activity";
type Props = NativeStackScreenProps<TopRouteParams, TopNavScreen.HOME>;

export function HomeScreen({ navigation }: Props): JSX.Element {


    const { name, imageUrl, usdcBalance, email, syncUsdcBalance } = useUserProfile();
    const { loading: loadingActivity, submit: fetchRecentActivity, data, error } = useRecentActivity();
    const [displayWelcome, setDisplayWelcome] = useState(true);

    useEffect(() => {
        console.log('data: ', data);
    }, [data]);

    useEffect(() => {
        console.log('email: ', email,)
        if (!email) return;
        fetchRecentActivity({
            memberEmail: email,
            limit: 5
        });
        syncUsdcBalance();
    }, [email]);

    // TODO - add fetch recent activity
    const history = [];
    return (
        <Screen gap-lg style={styles.home}>
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
            {/* TODO maybe add 20 px margin */}
            <View>
                <Text style={styles.balance} center>
                    {formatUsd(usdcBalance || 0)}
                </Text>
            </View>
            <View style={styles.buttonContainer}>
                <Button
                    primary
                    text-lg
                    label="Send"
                    style={styles.button}
                    onPress={() => navigation.navigate(TopNavScreen.SEND)}
                />
            </View>
            {/* TODO maybe add 20 px margin */}

            {/* history ? txLogs : newCard */}


            {data?.length ?
                <View style={styles.history} >
                    <Text text-lg gray-dark>Recent Activity</Text>
                    <GridList
                        data={data}
                        renderItem={({ item }) => (
                            <Activity item={item} />
                        )}
                        /* keyExtractor={item => item?.unixTimestamp} */
                        /* contentContainerStyle={STYLES.suggestions} */
                        itemSpacing={0}
                        listPadding={0}
                        numColumns={1}
                    />
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
                        <Text text-md gray-medium center padding-sm>
                            Deposit cash
                            to start sending money to friends.
                        </Text>
                        {/* TODO Add navigate to deposit workflow */}
                        <TouchableOpacity onPress={() => navigation.navigate(TopNavScreen.HOME)}>
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
        height: "50%",
        backgroundColor: 'white',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        padding: 20
    },
    welcome: {
        position: 'absolute',
        bottom: "8%",
        alignSelf: 'center',
        width: '90%',
        aspectRatio: 1,
        backgroundColor: HOME_COLORS.welcomeBox,
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