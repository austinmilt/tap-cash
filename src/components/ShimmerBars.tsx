import LinearGradient from 'react-native-linear-gradient';
import ShimmerPlaceHolder from 'react-native-shimmer-placeholder';
import { View } from './View';
import { useWindowDimensions } from 'react-native';

interface Props {
    loading: boolean;
    numBars: number;
}

export function ShimmerBars({ loading, numBars }: Props): JSX.Element {
    const windowWidth = useWindowDimensions().width;
    const width = Math.round(windowWidth * 0.8);

    const ShimmerBar = (
        <ShimmerPlaceHolder
            style={{
                justifyContent: "center",
                alignItems: "center"
            }}
            LinearGradient={LinearGradient}
            width={width}
            visible={!loading}
        />
    );

    const bars = Array.from({ length: numBars }, () => ShimmerBar);

    return (
        <View style={{
            justifyContent: "center",
            alignItems: "center",
            marginTop: 10
        }}>
            {bars.map((bar, index) => (
                <View key={index} style={{ marginVertical: 1 }}>
                    {bar}
                </View>
            ))}
        </View>
    );
}
