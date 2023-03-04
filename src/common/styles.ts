import { Colors, Typography, Spacings } from 'react-native-ui-lib';
import { StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { useMemo } from 'react';

export const COLORS = {
    primaryLight: "#3E5FE1",
    primaryMedium: "#3E5FE1",
    primaryDark: "#3E5FE1",

    secondaryLight: "#14AE5C",
    secondaryMedium: "#14AE5C",
    secondaryDark: "#14AE5C",

    grayLight: "#FFFFFF",
    grayMedium: "#808080",
    grayDark: "#000000",
}

const CORE_TEXT_STYLES = StyleSheet.create({
    "primary-light": {
        color: COLORS.primaryLight
    },
    "primary-medium": {
        color: COLORS.primaryMedium
    },
    "primary-dark": {
        color: COLORS.primaryDark
    },
    "secondary-light": {
        color: COLORS.secondaryLight
    },
    "secondary-medium": {
        color: COLORS.secondaryMedium
    },
    "secondary-dark": {
        color: COLORS.secondaryDark
    },
    "gray-light": {
        color: COLORS.grayLight
    },
    "gray-medium": {
        color: COLORS.grayMedium
    },
    "gray-dark": {
        color: COLORS.grayDark
    },
    "sm": {
        fontSize: 12,
        fontFamily: "Futura"
    },
    "md": {
        fontSize: 18,
        fontFamily: "Futura"
    },
    "lg": {
        fontSize: 24,
        fontFamily: "Futura"
    },
    "xl": {
        fontSize: 36,
        fontFamily: "Futura"
    },
    "xxl": {
        fontSize: 48,
        fontFamily: "Futura"
    },
});

const CORE_VIEW_STYLES = StyleSheet.create({
    "debug": {
        borderWidth: 1,
        borderColor: "red",
        borderStyle: "solid"
    },
    "gap-sm": {
        gap: 10
    },
    "gap-md": {
        gap: 20
    },
    "gap-lg": {
        gap: 30
    },
    "primary-light": {
        backgroundColor: COLORS.primaryLight
    },
    "primary-medium": {
        backgroundColor: COLORS.primaryMedium
    },
    "primary-dark": {
        backgroundColor: COLORS.primaryDark
    },
    "secondary-light": {
        backgroundColor: COLORS.secondaryLight
    },
    "secondary-medium": {
        backgroundColor: COLORS.secondaryMedium
    },
    "secondary-dark": {
        backgroundColor: COLORS.secondaryDark
    },
    "gray-light": {
        backgroundColor: COLORS.grayLight
    },
    "gray-medium": {
        backgroundColor: COLORS.grayMedium
    },
    "gray-dark": {
        backgroundColor: COLORS.grayDark
    },
});


type TextStyleKey = keyof typeof CORE_TEXT_STYLES;
export type TextStyleProps = { [key in TextStyleKey]?: boolean };
export function useTextStyle(props: TextStyleProps): TextStyle {
    return useMemo(() => {
        let result: TextStyle = {};
        for (const key of Object.keys(props)) {
            result = { ...result, ...CORE_TEXT_STYLES[key as TextStyleKey] }
        }
        return result;
    }, [props]);
}


type ViewStyleKey = keyof typeof CORE_VIEW_STYLES;
export type ViewStyleProps = { [key in ViewStyleKey]?: boolean };
export function useViewStyle(props: ViewStyleProps): ViewStyle {
    return useMemo(() => {
        let result: ViewStyle = {};
        for (const key of Object.keys(props)) {
            result = { ...result, ...CORE_VIEW_STYLES[key as ViewStyleKey] }
        }
        return result;
    }, [props]);
}


Colors.loadColors({
    primaryLight: "red",
    primaryMedium: CORE_TEXT_STYLES['primary-medium'].color,
    primaryDark: CORE_TEXT_STYLES['primary-dark'].color,
    secondaryLight: CORE_TEXT_STYLES['secondary-light'].color,
    secondaryMedium: CORE_TEXT_STYLES['secondary-medium'].color,
    secondaryDark: CORE_TEXT_STYLES['secondary-dark'].color,
});

Typography.loadTypographies({
    heading: { fontSize: 36, fontWeight: '600', fontFamily: "Futura" },
    subheading: { fontSize: 28, fontWeight: '500', fontFamily: "Futura" },
    body: { fontSize: 18, fontWeight: '400', fontFamily: "Futura" }
});

Spacings.loadSpacings({
    page: 20,
    card: 12,
    gridGutter: 16
});
