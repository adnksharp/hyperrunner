import React from 'react'
import {
    Alert,
	Dimensions,
    Pressable,
	Text,
    TouchableHighlight,
	View,
} from 'react-native'

import {
  LineChart,
  BarChart,
  PieChart,
  ProgressChart,
  ContributionGraph,
  StackedBarChart
} from "react-native-chart-kit";

import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'

import { color} from './style'

type IconProps = {
    icon: any,
    look: string,
    title?: string,
    message?: string,
    navigation?: any,
    execute?: any,
    disabled?: boolean,
}

type ChartProps = {
    datasets: any,
    type: string,
    rgb?: number[],
}

export const Icon =(props: IconProps): JSX.Element => {
    return (
        <Pressable
            disabled={props.disabled}
            onPress={ () => {
                if (props.execute) {
                    props.execute()
                }
            }}
            style={{
                backgroundColor: color.text,
                borderRadius: Dimensions.get("window").height / 24,
                height: Dimensions.get("window").height / 8,
                width: Dimensions.get("window").height / 8,
                justifyContent: 'center',
                alignItems: 'center',
                margin: Dimensions.get("window").height / 100,
            }}
            >
            <FontAwesomeIcon icon={props.icon} size={25} color={props.look}/>
        </Pressable>
    )
}

export const Graph = (props: ChartProps): JSX.Element => {
    if (props.type == "line" || props.type == "bezier") {
    return (
    <LineChart
        bezier
        data = {props.datasets}
        fromZero = {true}
        width={Dimensions.get("window").width - 20}
        height={Dimensions.get("window").height - 90}
        chartConfig={{
            backgroundColor: color.background,
            backgroundGradientFrom: color.background,
            backgroundGradientTo: color.background,
            color: (opacity = 1) => color.text,
        }}
        style={{
            padding: 10,
            borderRadius: 10,
        }}
    />
    )
    } else if (props.type == "progress") {
    return (
    <ProgressChart
        data = {props.datasets}
        width={Dimensions.get("window").width - 20}
        height={(Dimensions.get("window").height - 50) / 2}
        strokeWidth={32}
        radius={55}
        formatXLabel={(value) => `${value}`}
        chartConfig={{
            backgroundGradientFrom: color.background,
            backgroundGradientTo: color.background,
            color: (opacity = 1) => `rgba(${props.rgb[0]}, ${props.rgb[1]}, ${props.rgb[2]}, ${opacity})`,
            labelFontSize: 30,
        }}
        style={{
            padding: 10,
            borderRadius: 10,
        }}
    />
    )
    }
}
