import React from 'react';
import { View } from 'react-native';

interface Props {
    size: number
}

const Spacer = (props: Props) => {
  return <View style={{ height: props.size }} />;
};

export default Spacer;
