import { createContext, useContext, } from "react"
import { Circle, CircleEnvironments, SubscriptionRequest } from "@circle-fin/circle-sdk";

const CircleContext = createContext({});

interface CircleWorkSpace {
  circle?: Circle
}

const CircleProvider = ({ children }: any) => {

  // Initialize API driver
  const circle: Circle = new Circle(
    '<your-api-key>',
    CircleEnvironments.sandbox      // TO DO MAKE THIS DYNAMIC BASED ON EV
  );

  const workspace: CircleWorkSpace = {
    circle: circle
  }

  return (
    <CircleContext.Provider value={workspace}>
      {children}
    </CircleContext.Provider>
  )
}

const useCircle = (): CircleWorkSpace => {
  return useContext(CircleContext);
}

export { CircleProvider, useCircle }