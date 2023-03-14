import { LoaderScreen } from "react-native-ui-lib";
import { Image } from 'react-native-ui-lib';
import { IMAGES } from "../images/images";
import { View } from "./View";

export function Loading(): JSX.Element {
    return (
        <View style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center'
        }}>
            <Image
                style={{ width: 200, height: 200 }}
                source={IMAGES.loaders.loaderLarge}
                resizeMode="contain"
            />
        </View>
    )
}
