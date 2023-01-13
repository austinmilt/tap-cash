import { Button, View } from "react-native";

export function Authorize({ navigation }): JSX.Element {
    return (
        <View>
            <Button
                title="Go to Home"
                onPress={() => navigation.navigate('Home')}
            />
        </View>
    )
}
