import { Avatar, Image } from "react-native-ui-lib";
import { ProfileNavScreen, ProfileStackRouteParams } from "../../common/navigation";
import { Screen } from "../../components/Screen";
import { View } from "../../components/View";
import { useUserProfile } from "../../components/profile-provider";
import { Text } from "../../components/Text";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { IMAGES } from "../../images/images";
import { COLORS } from "../../common/styles";


type Props = NativeStackScreenProps<ProfileStackRouteParams, ProfileNavScreen.OVERVIEW>;

export function ProfileOverviewScreen({ navigation, route }: Props): JSX.Element {
    const { imageUrl, name, email } = useUserProfile();

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
                </View>
                <View style={styles.settings}>
                    <Text>SETTINGS</Text>
                    <TouchableOpacity disabled style={styles.row} onPress={() => navigation.navigate(ProfileNavScreen.PAYMENT_METHODS)}>
                        <View style={styles.iconWrapper}>
                            <Image
                                source={IMAGES.payments.visaMini}
                                resizeMode="contain"
                            />
                        </View>
                        <View style={styles.ccnumWrapper}>
                            <Text style={styles.disabled}>{`•••• •••• •••• 4567`}</Text>
                        </View>
                        <Text style={styles.disabled}>▶</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.row} onPress={() => navigation.navigate(ProfileNavScreen.ADD_FUNDS)}>
                        <Text style={styles.action}>Add Funds</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.row} disabled>
                        <Text style={styles.disabled}>Withdraw Funds (coming soon)</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.row} disabled>
                        <Text style={styles.disabled}>Log Out (coming soon)</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.row}
                        onPress={() => Linking.openURL('https://airtable.com/shrbYDC8A1MqFjSH3')}
                    >
                        <Text style={styles.action}>Provide feedback</Text>
                    </TouchableOpacity>
                </View>
            </View>

        </Screen>
    )
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    account: {
        paddingVertical: 30,
        paddingHorizontal: 20,
    },
    profile: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomColor: COLORS.grayLight,
        borderBottomWidth: 2,
        borderStyle: "solid",
        marginBottom: 20,
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
        fontFamily: "Jost-Bold",
        marginBottom: 4,
    },
    email: {
        fontSize: 18,
        color: '#666',
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
        borderBottomColor: COLORS.grayLight,
        borderBottomWidth: 2,
        borderStyle: "solid",
        marginBottom: 20
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
        color: '#000'
    },
    action: {
        fontSize: 18,
        color: '#555',
    },
    ccnumWrapper: {
        flex: 1,
    },
    disabled: {
        fontSize: 18,
        color: '#bdbdbd'
    }
});

