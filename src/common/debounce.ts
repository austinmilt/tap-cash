import { useCallback, useEffect, useState } from "react";


export function useStateWithDebounce<T>(
    callback: (value: T) => void,
    intervalMs: number
): [T | undefined, (value: T) => void] {
    const [currentValue, setCurrentValue] = useState<T>();

    const setValue: (value: T) => void = useCallback(value => {
        if (value !== currentValue) {
            setCurrentValue(value);
        }
    }, [currentValue]);


    // call the callback `intervalMs` after the value stops changing
    useEffect(() => {
        const timeoutId: NodeJS.Timeout = setTimeout(() => {
            if (currentValue != null) {
                callback(currentValue);
            }
        }, intervalMs);

        return () => {
            clearTimeout(timeoutId);
        }
    }, [currentValue]);


    return [currentValue, setValue];
}
