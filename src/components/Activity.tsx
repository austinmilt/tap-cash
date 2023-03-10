import { View } from "../components/View";
import { Text } from "../components/Text";
import { StyleSheet } from 'react-native';
import { formatDate, formatUsd } from "../common/number";
import { MemberActivity, MemberActivityType } from "../shared/activity";
import { Image } from 'react-native-ui-lib';
import { IMAGES } from "../images/images";
import { COLORS } from "../common/styles";
import { truncateName } from "../common/text";

interface Props {
    item: MemberActivity;
}

export function Activity({ item }: Props): JSX.Element {
    let amount: number | undefined;
    let type: string;
    let color: string;
    let iconSource;
    let name: string | undefined;
    let displayMessage: string;

    switch (item.type) {
        case MemberActivityType.DEPOSIT:
            amount = item.deposit?.amount;
            type = 'Deposit';
            color = COLORS.grayDark;
            iconSource = IMAGES.activity.deposit;
            break;

        case MemberActivityType.WITHDRAW:
            amount = item.withdraw?.amount;
            type = 'Withdraw';
            color = COLORS.grayDark;
            iconSource = IMAGES.activity.withdraw;
            break;

        case MemberActivityType.RECEIVE:
            amount = item.receive?.amount;
            type = 'Receive';
            color = COLORS.secondaryMedium;
            iconSource = IMAGES.activity.receive;
            name = item.receive?.sender.name;
            break;

        case MemberActivityType.SEND:
            amount = item.send?.amount;
            type = 'Send';
            color = COLORS.primaryMedium;
            iconSource = IMAGES.activity.send;
            name = item.send?.recipient.name;
            break;

        default:
            throw new Error("Unexpected activity type");
    }
    displayMessage = name ? `${type} from ${truncateName(name)}` : type;
    return (
        <View style={activityStyles.row}>
            <Image
                style={activityStyles.icon}
                source={iconSource}
                resizeMode="contain"
            />
            <View style={activityStyles.info}>
                <Text gray-dark text-md>{displayMessage}</Text>
                <Text gray-medium text-md>
                    {item.unixTimestamp ? formatDate(item.unixTimestamp) : FALLBACK_DATE_VALUE}
                </Text>
            </View>
            <Text style={{ color }} text-md>{formatUsd(amount || 0)}</Text>
        </View>
    );
};

const FALLBACK_DATE_VALUE = '';

const activityStyles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 8,
        paddingRight: 8,
        width: '90%'
    },
    icon: {
        width: 48,
        height: 48,
        marginRight: 16
    },
    info: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
    },
    type: {
        fontSize: 12,
        color: '#333',
        marginBottom: 4,
    },
    amount: {
        fontSize: 25,
        fontWeight: 'bold',
        color: '#333',
    },
});
