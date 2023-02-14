import { Colors, Typography, Spacings } from 'react-native-ui-lib';

export const COLORS = {
    primaryDark: "#38761d",
    primaryLight: "#b6d7a8ff",
    secondaryDark: "#303030ff",
    secondaryMedium: "#666666ff",
    secondaryLight: "#c9d1d9"
}

export const FONT = {
    sizeNormal: 21,
}

Colors.loadColors({
    secondaryDark: COLORS.secondaryDark,
    secondaryMedium: COLORS.secondaryMedium,
    secondaryLight: COLORS.secondaryLight,
    primaryDark: COLORS.primaryDark,
    primaryLight: COLORS.primaryLight
});

Typography.loadTypographies({
    heading: {fontSize: 36, fontWeight: '600'},
    subheading: {fontSize: 28, fontWeight: '500'},
    body: {fontSize: 18, fontWeight: '400'}
});

Spacings.loadSpacings({
    page: 20,
    card: 12,
    gridGutter: 16
});
