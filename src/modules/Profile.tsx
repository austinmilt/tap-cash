import { Avatar, Image } from "react-native-ui-lib";
import { TopNavScreen, TopRouteParams } from "../common/navigation";
import { Button } from "../components/Button";
import { Screen } from "../components/Screen";
import { View } from "../components/View";
import { useUserProfile } from "../components/profile-provider";
import { Text } from "../components/Text";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { TouchableOpacity, StyleSheet } from 'react-native';


type Props = NativeStackScreenProps<TopRouteParams, TopNavScreen.PROFILE>;

export function Profile({ navigation }: Props): JSX.Element {
    const { imageUrl, name, email } = useUserProfile();
    const ccnum = '1234 5678 9012 3456';

    return (
        <Screen>
            <View style={styles.container}>
                <View style={styles.account}>
                    <Text>ACCOUNT</Text>
                    <View style={styles.profile}>

                        <Avatar
                            imageStyle={styles.profileImg}
                            source={{ uri: imageUrl }}
                            size={60}
                        />
                        <View style={styles.profileInfo}>
                            <Text style={styles.name}>
                                {name}
                            </Text>
                            <Text style={styles.email}>{email}</Text>
                        </View>
                    </View>
                    <View style={styles.divider} />
                </View>
                <View style={styles.settings}>
                    <Text>SETTINGS</Text>
                    <TouchableOpacity style={styles.row}>
                        <View style={styles.iconWrapper}>
                            <Image
                                source={require('../images/payments/visa.png')}
                                resizeMode="contain"
                            />
                        </View>
                        <View style={styles.ccnumWrapper}>
                        <Text style={styles.ccnum}>{`•••• •••• •••• ${ccnum.slice(-4)}`}</Text>
                        </View>
                        <Text>▶</Text>
                    </TouchableOpacity>
                    <View style={styles.divider} />
                    <TouchableOpacity style={styles.row} onPress={() => console.log('add')}>
                        <Text style={styles.action}>Add Funds</Text>
                    </TouchableOpacity>
                    <View style={styles.divider} />
                    <TouchableOpacity style={styles.row} onPress={() => console.log('remove')}>
                        <Text style={styles.action}>Withdraw Funds</Text>
                    </TouchableOpacity>
                    <View style={styles.divider} />
                    <TouchableOpacity style={styles.row} onPress={() => console.log('logout')}>
                        <Text style={styles.action}>Log Out</Text>
                    </TouchableOpacity>
                    <View style={styles.divider} />

                </View>
            </View>

        </Screen>
    )
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    account: {
        paddingVertical: 30,
        paddingHorizontal: 20,
    },
    profile: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    profileImg: {

        borderRadius: 32,
        marginRight: 32,
    },
    profileInfo: {
        flex: 1,    
        width: 0,
        padding: 20
      },
    name: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    email: {
        fontSize: 18,
        color: '#666',
    },
    divider: {
        height: 2,
        backgroundColor: '#f0f0f0',
        marginVertical: 10,
    },
    settings: {
        paddingTop: 30,
        paddingHorizontal: 20,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
    },
    iconWrapper: {
        width: 48,
        height: 48,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    icon: {
        fontSize: 24,
        color: '#555',
    },
    ccnum: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#555',
    },
    action: {
        fontSize: 18,
        color: '#555',
    },
    ccnumWrapper: {
        flex: 1,
    }
});

