import { View } from "../components/View";
import { Text } from "../components/Text";
import {  StyleSheet } from 'react-native';
import { formatDate, formatUsd } from "../common/number";
import { MemberActivity, MemberActivityType } from "../shared/activity";

interface Props {
    item: MemberActivity;
}

export function Activity({ item }: Props): JSX.Element {


    let amount: number | undefined;
    let type: string;
    let color: string;

    switch (item.type) {
        case MemberActivityType.DEPOSIT:
            amount = item.deposit?.amount;
            type = 'Deposit';
            color = 'black';
            break;

        case MemberActivityType.WITHDRAW:
            amount = item.withdraw?.amount;
            type = 'Withdraw';
            color = 'red';
            break;

        case MemberActivityType.RECEIVE:
            amount = item.receive?.amount;
            type = 'Receive';
            color = 'green';
            break;

        case MemberActivityType.SEND:
            amount = item.send?.amount;
            type = 'Send';
            color = 'blue';
            break;

        default:
            amount = 0;
            color = 'black';
            type = 'Unknown';
            break;
    }
    console.log('amount:', amount);

    const date = formatDate(item.unixTimestamp || 0);
    return (
        <View style={activityStyles.row}>
            <View style={activityStyles.icon} />
            <View style={activityStyles.info}>
                <Text gray-dark text-md>{type}</Text>
                <Text gray-gray-medium text-md>{date}</Text>
            </View>
            <Text style={{ color }} text-md>{formatUsd(amount || 0)}</Text>
        </View>
    );
};

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
        borderRadius: 12,
        backgroundColor: '#ccc',
        marginRight: 16,
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