import {
	Dimensions,
	SafeAreaView,
    ScrollView,
	StatusBar,
	Text,
    useColorScheme,
	View,
} from 'react-native'

import { useIsFocused } from '@react-navigation/native'

import { faHouse } from '@fortawesome/free-solid-svg-icons'

import { color, theme} from '../style'
import { Icon, Graph } from '../elements'

export function JsonScreen({navigation}): JSX.Element {
    const JsonFocused = useIsFocused()
    color.mode = useColorScheme() === 'dark'
    theme(color.mode)
    return (
        <SafeAreaView>
            <StatusBar
                barStyle={color.mode ? 'light-content' : 'dark-content'}
                backgroundColor={color.background}
            />
            <View style={{
                backgroundColor: color.background,
                height: Dimensions.get('window').height,
                width: Dimensions.get('window').width,
            }}>
                <ScrollView
                    horizontal={true}
                    pagingEnabled={true}
                    showsHorizontalScrollIndicator={false}
                    nestedScrollEnabled = {true}
                    decelerationRate={0}
                    snapToInterval={Dimensions.get('window').width}
                    snapToAlignment={'center'}
                    style={{
                        width: Dimensions.get('window').width,
                        height: Dimensions.get('window').height,
                    }}>
                    <ScrollView
                        pagingEnabled={true}
                        nestedScrollEnabled = {true}
                        decelerationRate={"fast"}
                        snapToInterval={Dimensions.get('window').height}
                        snapToAlignment={'center'}
                        showsVerticalScrollIndicator={false}
                    >
                        <View style={{
                            width: Dimensions.get('window').width,
                            height: Dimensions.get('window').height,
                            backgroundColor: color.disabled,
                        }}>
                            <Graph
                                type={"bezier"}
                                datasets={{
                                    labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
                                    datasets: [{
                                        data: [30, 30, 30, 30, 30, 30, 30],
                                        strokeWidth: 4,
                                        color: () => '#888888',
                                    }, {
                                        data: [20, 45, 28, 80, 99, 43, 22],
                                        strokeWidth: 4,
                                    color: () => '#0d56df',
                                    }, {
                                        data: [10, 15, 2, 50, 69, 13, 8],
                                        strokeWidth: 4,
                                        color: () => '#dd0d56',
                                        }],
                                    legend: ['Referencia', 'Velocidad', 'Error']
                                }}
                            />
                        </View>
                        <View style={{
                            width: Dimensions.get('window').width,
                            height: Dimensions.get('window').height,
                            backgroundColor: color.disabled,
                        }}>
                            <Graph
                                rgb={[13, 86, 223]}
                                type={"progress"}
                                datasets={{
                                    data: [0.99],
                                    labels: ['Velocidad'],
                                }}
                            />
                            <Graph
                                rgb={[221, 13, 86]}
                                type={"progress"}
                                datasets={{
                                    data: [0.01],
                                    labels: ['Error'],
                                }}
                            />
                        </View>
                    </ScrollView>
                    <ScrollView
                        pagingEnabled={true}
                        nestedScrollEnabled = {true}
                        decelerationRate={"fast"}
                        snapToInterval={Dimensions.get('window').height}
                        snapToAlignment={'center'}
                        showsVerticalScrollIndicator={false}
                    >
                        <View style={{
                            width: Dimensions.get('window').width,
                            height: Dimensions.get('window').height,
                            backgroundColor: color.disabled,
                        }}>
                            <Graph
                                type={"bezier"}
                                datasets={{
                                    labels: ['January', 'February', 'March', 'April', 'May', 'June'],
                                    datasets: [{
                                        data: [30, 30, 30, 30, 30, 30, 30],
                                        strokeWidth: 4,
                                        color: () => '#888888',
                                    }, {
                                        data: [20, 45, 28, 80, 99, 43, 22],
                                        strokeWidth: 4,
                                    color: () => '#0d56df',
                                    }, {
                                        data: [10, 15, 2, 50, 69, 13, 8],
                                        strokeWidth: 4,
                                        color: () => '#dd0d56',
                                        }],
                                    legend: ['Referencia', 'Dirección', 'Error']
                                }}
                            />
                        </View>
                        <View style={{
                            width: Dimensions.get('window').width,
                            height: Dimensions.get('window').height,
                            backgroundColor: color.disabled,
                        }}>
                            <Graph
                                rgb={[13, 86, 223]}
                                type={"progress"}
                                datasets={{
                                    data: [0.99],
                                    labels: ['Dirección'],
                                }}
                            />
                            <Graph
                                rgb={[221, 13, 86]}
                                type={"progress"}
                                datasets={{
                                    data: [0.01],
                                    labels: ['Error'],
                                }}
                            />
                        </View>
                    </ScrollView>
                    <ScrollView
                        pagingEnabled={true}
                        nestedScrollEnabled = {true}
                        decelerationRate={"fast"}
                        snapToInterval={Dimensions.get('window').height}
                        snapToAlignment={'center'}
                        showsVerticalScrollIndicator={false}
                    >
                        <View style={{
                            width: Dimensions.get('window').width,
                            height: Dimensions.get('window').height,
                            backgroundColor: color.disabled,
                        }}>
                            <Graph
                                type={"bezier"}
                                datasets={{
                                    labels: ['January', 'February', 'March', 'April', 'May', 'June'],
                                    datasets: [{
                                        data: [1, 1, 1, 1, 1, 2, 2, 0, 0, 0],
                                        strokeWidth: 4,
                                        color: () => '#0d56df',
                                    }],
                                    legend: ['Objetos detectados']
                                }}
                            />
                        </View>
                        <View style={{
                            width: Dimensions.get('window').width,
                            height: Dimensions.get('window').height,
                            backgroundColor: color.disabled,
                        }}>
                            <Graph
                                type={"bezier"}
                                datasets={{
                                    labels: ['January', 'February', 'March', 'April', 'May', 'June'],
                                    datasets: [{
                                        data: [10, 15, 30, 45, 60, 75, 90, 0, 0, 0],
                                        strokeWidth: 4,
                                        color: () => '#0d56df',
                                    }, {
                                        data: [0, 0, 0, 0, 0, 10, 15, 0, 0, 0],
                                        strokeWidth: 4,
                                        color: () => '#dd0d56',
                                    }],
                                    legend: ['Distancia 1', 'Distancia 2']
                                }}
                            />
                        </View>
                    </ScrollView>
                </ScrollView>
            </View>
        </SafeAreaView>
    )
}
