import { Avatar, Image } from "react-native-ui-lib";
import { ProfileNavScreen, ProfileStackRouteParams, TopNavScreen, TopRouteParams } from "../../common/navigation";
import { Screen } from "../../components/Screen";
import { View } from "../../components/View";
import { useUserProfile } from "../../components/profile-provider";
import { Text } from "../../components/Text";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { TouchableOpacity, StyleSheet } from 'react-native';
import { IMAGES } from "../../images/images";
import { useMemo } from "react";
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
                    <View style={styles.divider} />
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
                    <View style={styles.divider} />
                    <TouchableOpacity style={styles.row} onPress={() => navigation.navigate(ProfileNavScreen.ADD_FUNDS)}>
                        <Text style={styles.action}>Add Funds</Text>
                    </TouchableOpacity>
                    <View style={styles.divider} />
                    <TouchableOpacity style={styles.row} disabled>
                        <Text style={styles.disabled}>Withdraw Funds (coming soon)</Text>
                    </TouchableOpacity>
                    <View style={styles.divider} />
                    <TouchableOpacity style={styles.row} disabled>
                        <Text style={styles.disabled}>Log Out (coming soon)</Text>
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
       color: '#E2E8F0' 
    }
});

