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

    error: "#E53E3E"
}

const CORE_TEXT_STYLES = StyleSheet.create({
    "primary-light": {
        color: COLORS.primaryLight,
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
    "text-sm": {
        fontSize: 12,
    },
    "text-md": {
        fontSize: 18,
    },
    "text-lg": {
        fontSize: 24,
    },
    "text-xl": {
        fontSize: 36,
    },
    "text-xxl": {
        fontSize: 48,
    },
    "light-weight": {
        fontFamily: "Jost-Light"
    },
    "normal": {
        fontFamily: "Jost-Medium"
    },
    "semibold": {
        fontFamily: "Jost-Semibold"
    },
    "bold": {
        fontFamily: "Jost-Bold"
    },
    "extra-bold": {
        fontFamily: "Jost-ExtraBold"
    },
    "center": {
        justifyContent: "center",
        alignItems: "center"
    }
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
    "padding-sm": {
        padding: 10
    },
    "padding-md": {
        padding: 20
    },
    "padding-lg": {
        padding: 30
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
    "bordered": {
        borderColor: COLORS.grayMedium,
        borderRadius: 6,
        borderWidth: 1
    },
    "bordered-focused": {
        borderColor: COLORS.primaryMedium,
        borderRadius: 6,
        borderWidth: 2
    },
    "bordered-error": {
        borderColor: COLORS.error,
        borderRadius: 6,
        borderWidth: 2
    }
});


type TextStyleKey = keyof typeof CORE_TEXT_STYLES;
export type TextStyleProps = { [key in TextStyleKey]?: boolean };
export function useTextStyle(props: TextStyleProps): TextStyle {
    return useMemo(() => {
        let result: TextStyle = {
            fontFamily: "Jost-Medium",
            color: COLORS.grayMedium
        };
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
