import { Button, View } from "react-native";

export function Send({ navigation }): JSX.Element {
    return (
        <View>
            <Button
                title="Go to Home"
                onPress={() => navigation.navigate('Home')}
            />
        </View>
    )
}
