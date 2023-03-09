import { View } from "../components/View";
import { Text } from "../components/Text";
import { StyleSheet } from 'react-native';
import { formatDate, formatUsd } from "../common/number";
import { MemberActivity, MemberActivityType } from "../shared/activity";
import { Image } from 'react-native-ui-lib';
import { IMAGES } from "../images/images";

interface Props {
    item: MemberActivity;
}

export function Activity({ item }: Props): JSX.Element {
    let amount: number | undefined;
    let type: string;
    let color: string;
    let iconSource;

    switch (item.type) {
        case MemberActivityType.DEPOSIT:
            amount = item.deposit?.amount;
            type = 'Deposit';
            color = 'black';
            iconSource = IMAGES.activity.deposit;
            break;

        case MemberActivityType.WITHDRAW:
            amount = item.withdraw?.amount;
            type = 'Withdraw';
            color = 'red';
            iconSource = IMAGES.activity.withdraw;

            break;

        case MemberActivityType.RECEIVE:
            amount = item.receive?.amount;
            type = 'Receive';
            color = 'green';
            iconSource = IMAGES.activity.receive;

            break;

        case MemberActivityType.SEND:
            amount = item.send?.amount;
            type = 'Send';
            color = 'blue';
            iconSource = IMAGES.activity.send;
            break;

        default:
            throw new Error("Dont know how to display " + MemberActivityType[MemberActivityType.WITHDRAW]);
    }

    return (
        <View style={activityStyles.row}>
            <Image
                style={activityStyles.icon}
                source={iconSource}
                resizeMode="contain"
            />
            <View style={activityStyles.info}>
                <Text gray-dark text-md>{type}</Text>
                <Text gray-gray-medium text-md>
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
        paddingHorizontal: 16,
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
