import { TextStyleProps, ViewStyleProps } from "../common/styles";
import { Text, TextProps } from "./Text";
import { StyleSheet } from "react-native";
import { useCallback, useMemo, useState } from "react";
import { View } from "./View";
import { TextInput } from "./TextInput";
import { formatUsd } from "../common/number";

type Props = TextProps & TextStyleProps & {
    onSubmit: (value: number) => void;
    onValueChange?: (value: number) => void;
    inputFieldStyle?: ViewStyleProps;
    maxValue?: number;
    allowCents?: boolean;
}

const NUMBER_CHARS: string[] = "0123456789".split("");

export function DollarInput(props: Props): JSX.Element {
    const [value, setValue] = useState<string | undefined>();
    const [validationError, setValidationError] = useState<string | undefined>();
    const allowCents: boolean = useMemo(() => props.allowCents ?? false, [props.allowCents]);

    const onUserInput: (value: string) => void = useCallback((v) => {
        setValidationError(undefined);

        // if user hasnt done any editing then dont try to validate
        if (v === undefined) return;

        if (!allowCents && v.includes(".")) {
            setValidationError("Whole dollars only.");
            return;
        }

        const valueAsNumber: number | undefined = parseDollars(v, allowCents);

        if ((valueAsNumber === undefined) || (valueAsNumber === 0)) {
            setValue(undefined);
            return;
        }

        if (valueAsNumber < 0) {
            setValidationError("Amount must be positive.");
            return;
        }

        if ((props.maxValue != null) && (valueAsNumber > props.maxValue)) {
            setValidationError("Amount cannot exceed " + formatUsd(props.maxValue));
            return;
        }

        if (v !== undefined) {
            const formatter = Intl.NumberFormat("en-US", {
                maximumFractionDigits: allowCents ? 2 : 0,
                minimumFractionDigits: allowCents ? 2 : 0,
                notation: "standard"
            });
            v = formatter.format(valueAsNumber);
        }

        setValue(v);
        if ((v !== undefined) && (props.onValueChange !== undefined)) {
            props.onValueChange(valueAsNumber);
        }
    }, [value, allowCents]);


    const onSubmit: () => void = useCallback(() => {
        if (value !== undefined) {
            const valueAsNumber: number | undefined = parseDollars(value, allowCents);
            if ((valueAsNumber !== undefined) && (valueAsNumber > 0)) {
                props.onSubmit(valueAsNumber);
            }
        };
    }, [value, props.onSubmit, allowCents]);


    return (
        <View center>
            <Text text-md gray-medium center error>{validationError}</Text>
            <TextInput
                keyboardType="number-pad"
                value={value}
                placeholder={allowCents ? "0.00" : "0"}
                onChangeText={onUserInput}
                onSubmitEditing={onSubmit}
                leadingAccessory={<Text gray-dark style={STYLES.leadingText}>$</Text>}
                style={STYLES.text}
                autoFocus
                {...props}
            >
                {props.children}
            </TextInput>
        </View>
    )
}

const STYLES = StyleSheet.create({
    text: {
        fontSize: 53,
    },

    leadingText: {
        fontSize: 40,
        marginRight: 5,
        alignSelf: "flex-start"
    }
})


function parseDollars(value: string, allowCents: boolean = false): number | undefined {
    const parts: string[] = value.split("").filter(c => NUMBER_CHARS.includes(c));
    if (parts.length === 0) return undefined;
    if (allowCents) {
        if (parts.length === 1) {
            value = `0.0${parts[0]}`;

        } else if (parts.length === 2) {
            value = `0.${parts[0]}${parts[1]}`;

        } else {
            value = `${parts.slice(0, -2).join("")}.${parts.slice(-2).join("")}`;
        }
    } else {
        value = parts.join("");
    }
    return Number.parseFloat(value);
}
