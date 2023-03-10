import { Badge } from "react-native-ui-lib";
import { View } from "./View";
import { useMemo } from "react";
import { COLORS } from "../common/styles";

interface TransactionStatusProps {
    loading: boolean;
    success: boolean | undefined;
    error: any | undefined;
    defaultContent: JSX.Element;
    loadingContent: JSX.Element;
    successContent: JSX.Element;
    errorContent: JSX.Element;
}


export function TransactionStatus(props: TransactionStatusProps): JSX.Element {
    const badgeColor: string | undefined = useMemo(() => {
        if (props.loading) return COLORS.grayLight;
        if (props.success) return COLORS.secondaryMedium;
        return "transparent";
    }, [props.loading, props.success, props.error]);

    const badgeLabel: string | undefined = useMemo(() => {
        if (props.success) return "✓";
        if (props.loading) return "✓";
        return undefined;
    }, [props.loading, props.success, props.error]);

    const badgeLabelColor: string | undefined = useMemo(() => {
        if (props.error) return COLORS.error;
        if (props.loading) return COLORS.whiteish;
        if (props.success) return COLORS.whiteish
        return COLORS.grayMedium;
    }, [props.loading, props.success, props.error]);

    const renderBadge: boolean = (badgeLabel != null) || (badgeColor != null);

    const content: JSX.Element = useMemo(() => {
        if (props.error) return props.errorContent;
        if (props.loading) return props.loadingContent;
        if (props.success) return props.successContent;
        return props.defaultContent;
    }, [
        props.loadingContent,
        props.successContent,
        props.errorContent,
        props.defaultContent
    ]);

    return (
        <View row gap-sm center>
            {renderBadge && (
                <Badge
                    backgroundColor={badgeColor}
                    label={badgeLabel}
                    labelStyle={{ color: badgeLabelColor }}
                />
            )}
            {content}
        </View>
    );
}
