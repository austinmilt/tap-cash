import { Button, View } from "react-native";

export function Home({ navigation }): JSX.Element {
    return (
        <View>
            <Button
                title="Go to Send"
                onPress={() => navigation.navigate('Send')}
            />
            <Button
                title="Go to Profile"
                onPress={() => navigation.navigate('Profile')}
            />
        </View>
    )
}
