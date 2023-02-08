import { NavScreen, Navigation } from "../../common/navigation";
import { RecipientInput } from "./RecipientInput";
import { AmountInput } from "./AmountInput";
import { ConfirmSend } from "./ConfirmSend";
import { Sending } from "./Sending";
import { Wizard, WizardStepStates } from "react-native-ui-lib";
import { useState } from "react";
import { View } from "../../components/View";

//TODO https://reactnavigation.org/docs/typescript

interface Props {
    navigation: Navigation
}


//TODO implement theming so the wizard has the correct color scheme.
export function Send(props: Props): JSX.Element {
    const [activeStep, setActiveStep] = useState<number>(0);
    //TODO change to useReducer
    const [stepStates, setStepStates] = useState<{[step: string]: WizardStepStates}>({
        recipient: Wizard.States.ENABLED,
        amount: Wizard.States.DISABLED,
        confirm: Wizard.States.DISABLED,
        sending: Wizard.States.DISABLED
    });
    const [recipient, setRecipient] = useState<string | undefined>();
    const [amount, setAmount] = useState<number | undefined>();

    return <View useSafeArea flexG>
        <Wizard activeIndex={activeStep} onActiveIndexChanged={(i: number) => setActiveStep(i)}>
            <Wizard.Step state={stepStates.recipient} label="Recipient"/>
            <Wizard.Step state={stepStates.amount} label="Amount"/>
            <Wizard.Step state={stepStates.confirm} label="Confirm"/>
            <Wizard.Step state={stepStates.sending} label="Send"/>
        </Wizard>
        {(activeStep === 0) && (
            <RecipientInput
                onCompleted={ (recipient: string) => {
                    setRecipient(recipient);
                    stepStates.recipient = Wizard.States.COMPLETED;
                    stepStates.amount = Wizard.States.ENABLED;
                    setStepStates(stepStates);
                    setActiveStep(activeStep + 1);
                }}
                onCancel={() => props.navigation.navigate(NavScreen.HOME)}
            />
        )}
        {(activeStep === 1) && (
            <AmountInput
                onCompleted={ (amount: number) => {
                    setAmount(amount);
                    stepStates.amount = Wizard.States.COMPLETED;
                    stepStates.confirm = Wizard.States.ENABLED;
                    setStepStates(stepStates);
                    setActiveStep(activeStep + 1);
                }}
                onCancel={() => props.navigation.navigate(NavScreen.HOME)}
            />
        )}
        {(activeStep === 2) && (
            <ConfirmSend
                recipient={recipient!}
                amount={amount!}
                onCompleted={ () => {
                    stepStates.confirm = Wizard.States.COMPLETED;
                    stepStates.sending = Wizard.States.ENABLED;
                    setStepStates(stepStates);
                    setActiveStep(activeStep + 1);
                }}
                onCancel={() => props.navigation.navigate(NavScreen.HOME)}
            />
        )}
        {(activeStep === 3) && (
            <Sending
                recipient={recipient!}
                amount={amount!}
                onClose={ () => {
                    stepStates.sending = Wizard.States.COMPLETED;
                    setStepStates(stepStates);
                    props.navigation.navigate(NavScreen.HOME)
                }}
            />
        )}
    </View>
}
