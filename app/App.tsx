import React, { useEffect, useState } from 'react'
import { NavigationContainer, useFocusEffect } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'

import {
    Dimensions,
    Image,
    SafeAreaView,
    ScrollView,
    StatusBar,
    Text,
    TouchableHighlight,
    useColorScheme,
    View,
} from 'react-native'

import { Slider } from '@miblanchard/react-native-slider'

import { faChevronDown } from '@fortawesome/free-solid-svg-icons/faChevronDown'
import { faChevronUp } from '@fortawesome/free-solid-svg-icons/faChevronUp'
import { faChartLine } from '@fortawesome/free-solid-svg-icons/faChartLine'
import { faPalette } from '@fortawesome/free-solid-svg-icons/faPalette'
import { faStop } from '@fortawesome/free-solid-svg-icons/faStop'
import { faPlay } from '@fortawesome/free-solid-svg-icons/faPlay'
import { faPause } from '@fortawesome/free-solid-svg-icons/faPause'

import { color, theme } from './src/style'
import { Icon, Graph } from './src/elements'

type jsonresponse = {
    time: number[],
    rpm: {
        out: number[],
        reference: number[],
        error: number[],
        percent: number[][]
    },
    direction: {
        out: number[],
        reference: number[],
        error: number[],
        percent: number[][]
    },
    objects: {
        front: number[],
        back: number[],
        count: number[]
    },
    signal: number[]
}

const Stack = createNativeStackNavigator()

var fetching = 0

function MainScreen({ navigation }): JSX.Element {
    const [direction, setDirection] = useState(0),
        [rpm, setrpm] = useState(0),
        [dir, setdir] = useState(0),
        [speed, setSpeed] = useState(0),
        [connection, setConnection] = useState(0),
        [objects, setObjects] = useState(0),
        [distance, setDistance] = useState(''),
        [light, setLight] = useState(0),
        [running, setRunning] = useState(false)
    color.mode = useColorScheme() === 'dark'
    theme(color.mode)

    useFocusEffect(
        React.useCallback(() => {
            fetching = 1
            return () => {
                fetching = 0
            }
        }, [])
    )

    const ping = async () => {
        try {
            if (fetching == 1) {
                const response = await fetch('http://10.42.0.1:3000/status')
                const json = await response.json()
                if (json != undefined) {
                    setrpm(parseInt(json.rpm.out))
                    setdir(parseInt(json.direction.out))
                    setConnection(json.signal)
                    setObjects(json.objects.count)
                    setDistance(json.objects.front.toString() + ', ' + json.objects.back.toString())
                } else {
                    setrpm(0)
                    setdir(0)
                    setConnection(0)
                    setObjects(0)
                    setDistance('0, 0')
                }
            }
        } catch (error) {
            console.error(error)
        } finally {
            if (fetching == 1) {
                setTimeout(ping, 50)
            }
            else {
                setTimeout(ping, 2000)
            }
        }
    }

    useEffect(() => {
        ping()
    }, [])

    return (
        <SafeAreaView>
            <StatusBar
                barStyle={color.mode ? 'light-content' : 'dark-content'}
                backgroundColor={color.background}
            />
            <View style={{
                backgroundColor: color.background,
                width: Dimensions.get('window').width,
                flexDirection: 'row',
            }}>
                <View style={{
                    backgroundColor: color.background,
                    height: Dimensions.get('window').height * 13 / 14,
                    width: Dimensions.get('window').width / 10,
                    justifyContent: 'center',
                    alignItems: 'center',
                }}>
                    <Icon
                        icon={faChevronUp}
                        look={color.background}
                        execute={() => { if (direction < 45) { setDirection(parseInt(direction) + 1) } }}
                        disabled={running}
                    />
                    <View style={{
                        width: Dimensions.get('window').height * 9 / 16,
                        height: Dimensions.get('window').height * 9 / 16,
                        marginTop: Dimensions.get('window').height * 1 / 32,
                        marginBottom: Dimensions.get('window').height * 1 / 32,
                        alignItems: 'center',
                        justifyContent: 'center',
                        transform: [{ rotate: '270deg' }],
                    }} >
                        <View style={{
                            height: Dimensions.get('window').height / 8,
                            width: Dimensions.get('window').height * 9 / 16,
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            <Slider
                                value={direction}
                                onValueChange={(value) => { setDirection(value) }}
                                minimumValue={-45}
                                maximumValue={45}
                                minimumTrackTintColor={color.text}
                                maximumTrackTintColor={color.text}
                                thumbTintColor={color.disabled}
                                disabled={running}
                                thumbStyle={{
                                    backgroundColor: color.text,
                                    height: Dimensions.get('window').height / 8,
                                    width: Dimensions.get('window').height / 12,
                                }}
                                trackStyle={{
                                    height: Dimensions.get('window').height / 8,
                                    width: Dimensions.get('window').height * 9 / 16,
                                }}
                                minimumTrackStyle={{ backgroundColor: color.disabled }}
                                maximumTrackStyle={{ backgroundColor: color.disabled }}
                                step={1}
                            />
                        </View>
                    </View>
                    <Icon
                        icon={faChevronDown}
                        look={color.background}
                        execute={() => { if (direction > -45) { setDirection(direction - 1) } }}
                        disabled={running}
                    />
                </View>
                <View style={{
                    height: Dimensions.get('window').height,
                    width: Dimensions.get('window').width * 4 / 5,
                }}>
                    <View style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                    }}>
                        <View style={{
                            width: Dimensions.get('window').width * 7 / 15,
                        }}>
                            <View style={{ height: 20 }} >
                                <Text style={{
                                    color: color.text,
                                    fontSize: Dimensions.get('window').height * 3 / 65,
                                    fontFamily: 'Iceland-Regular',
                                }}>Velocidad: {speed}</Text>
                            </View>
                            <View style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'center',
                                height: Dimensions.get('window').height * 3 / 13,
                            }}>
                                <Text style={{
                                    color: color.text,
                                    fontSize: Dimensions.get('window').height * 5 / 26,
                                    marginTop: -Dimensions.get('window').height * 1 / 52,
                                    fontFamily: 'Audiowide-Regular',
                                }}>{rpm}</Text>
                                <Text style={{
                                    color: color.text,
                                    fontSize: Dimensions.get('window').height * 1 / 13,
                                    fontFamily: 'Iceland-Regular',
                                }}> RPM</Text>
                            </View>
                        </View>
                        <View style={{
                            width: Dimensions.get('window').width * 5 / 15,
                        }}>
                            <View style={{ height: 20 }} >
                                <Text style={{
                                    color: color.text,
                                    fontSize: Dimensions.get('window').height * 3 / 65,
                                    fontFamily: 'Iceland-Regular',
                                }}>Dirección: {direction}</Text>
                            </View>
                            <View style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'center',
                                height: Dimensions.get('window').height * 3 / 13,
                            }}>
                                <Text style={{
                                    color: color.text,
                                    fontSize: Dimensions.get('window').height * 3 / 26,
                                    fontFamily: 'Audiowide-Regular',
                                }}>{dir}</Text>
                                <Text style={{
                                    color: color.text,
                                    fontSize: Dimensions.get('window').height * 1 / 13,
                                    fontFamily: 'Iceland-Regular',
                                }}> °</Text>
                            </View>
                        </View>
                    </View>
                    <View style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        width: Dimensions.get('window').width * 4 / 5,
                    }}>
                        <Image
                            source={require('./bold-and-brash.jpg')}
                            style={{
                                height: Dimensions.get('window').height * 9 / 14,
                                width: Dimensions.get('window').width * 9 / 20,
                            }} />
                        <View>
                            <View style={{ margin: Dimensions.get('window').height * 1 / 78 }} >
                                <Text style={{
                                    color: color.text,
                                    fontSize: Dimensions.get('window').height * 3 / 65,
                                    fontFamily: 'Iceland-Regular',
                                }}>Conexión</Text>
                                <View style={{
                                    backgroundColor: color.text,
                                    height: Dimensions.get('window').height * 1 / 104,
                                    width: Dimensions.get('window').width * 7 / 20,
                                }} />
                                <Text style={{
                                    color: color.text,
                                    fontSize: Dimensions.get('window').height * 1 / 13,
                                    fontFamily: 'Iceland-Regular',
                                }}>{connection} %</Text>
                            </View>
                            <View style={{ margin: Dimensions.get('window').height * 1 / 78 }} >
                                <Text style={{
                                    color: color.text,
                                    fontSize: Dimensions.get('window').height * 3 / 65,
                                    fontFamily: 'Iceland-Regular',
                                }}>Objetos detectados</Text>
                                <View style={{
                                    backgroundColor: color.text,
                                    height: Dimensions.get('window').height * 1 / 104,
                                    width: Dimensions.get('window').width * 7 / 20,
                                }} />
                                <Text style={{
                                    color: color.text,
                                    fontSize: Dimensions.get('window').height * 1 / 13,
                                    fontFamily: 'Iceland-Regular',
                                }}>{objects} ({distance} cm)</Text>
                            </View>
                            <View style={{ margin: Dimensions.get('window').height * 1 / 78 }} >
                                <Text style={{
                                    color: color.text,
                                    fontSize: Dimensions.get('window').height * 3 / 65,
                                    fontFamily: 'Iceland-Regular',
                                }}>Iluminación</Text>
                                <View style={{
                                    backgroundColor: color.text,
                                    height: Dimensions.get('window').height * 1 / 104,
                                    width: Dimensions.get('window').width * 7 / 20,
                                }} />
                                <Text style={{
                                    color: color.text,
                                    fontSize: Dimensions.get('window').height * 1 / 13,
                                    fontFamily: 'Iceland-Regular',
                                }}>{light} lux</Text>
                            </View>
                            <View style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                width: Dimensions.get('window').width * 7 / 20,
                            }}>
                                <Icon
                                    icon={faChartLine}
                                    look={color.background}
                                    execute={() => { navigation.navigate('Graph') }}
                                />
                                <Icon
                                    icon={faPalette}
                                    look={color.background}
                                    execute={() => {
                                        //send theme to server
                                        fetch('http://10.42.0.1:3000/theme', {
                                            method: 'POST',
                                            headers: {
                                                Accept: 'application/json',
                                                'Content-Type': 'application/json'
                                            },
                                            body: JSON.stringify({
                                                theme: color.mode ? 'dark' : 'light'
                                            })
                                        }).then((response) => response.json()).then((json) => {
                                        }).catch((error) => {
                                            console.error(error)
                                        })
                                    }}
                                />
                                <Icon
                                    icon={running ? faPause : faPlay}
                                    look={color.background}
                                    execute={() => {
                                        setRunning(running ? false : true)
                                        if (running) {
                                            fetch('http://10.42.0.1:3000/pause').then((response) => response.json()).then((json) => {
                                                console.log(json)
                                            }
                                            ).catch((error) => {
                                                console.error(error)
                                            })
                                        }
                                        else {
                                            fetch('http://10.42.0.1:3000/init', {
                                                method: 'POST',
                                                headers: {
                                                    Accept: 'application/json',
                                                    'Content-Type': 'application/json'
                                                },
                                                body: JSON.stringify({
                                                    speed: speed,
                                                    direction: direction
                                                })
                                            }).then((response) => response.json()).then((json) => {
                                                console.log(json)
                                            }
                                            ).catch((error) => {
                                                console.error(error)
                                            })
                                        }
                                    }}
                                />
                                <Icon
                                    icon={faStop}
                                    look={color.background}
                                    execute={() => {
                                        setRunning(false)
                                        setSpeed(0)
                                        setDirection(0)
                                        //fetch 10.42.01:3000/ping json
                                        /*    setConnection(100)
                                            setConnection(1)
                                        */
                                        fetch('http://10.42.0.1:3000/stop').then((response) => response.json()).then((json) => {
                                            console.log(json)
                                        }).catch((error) => {
                                            console.error(error)
                                        })
                                    }}
                                />
                            </View>
                        </View>
                    </View>
                </View>
                <View style={{
                    backgroundColor: color.background,
                    height: Dimensions.get('window').height * 13 / 14,
                    width: Dimensions.get('window').width / 10,
                    justifyContent: 'center',
                    alignItems: 'center',
                }}>
                    <Icon
                        icon={faChevronUp}
                        look={color.background}
                        execute={() => { if (speed < 90) { setSpeed(parseInt(speed) + 1) } }}
                        disabled={running}
                    />
                    <View style={{
                        width: Dimensions.get('window').height * 9 / 16,
                        height: Dimensions.get('window').height * 9 / 16,
                        marginTop: Dimensions.get('window').height * 1 / 32,
                        marginBottom: Dimensions.get('window').height * 1 / 32,
                        alignItems: 'center',
                        justifyContent: 'center',
                        transform: [{ rotate: '270deg' }],
                    }} >
                        <View style={{
                            height: Dimensions.get('window').height / 8,
                            width: Dimensions.get('window').height * 9 / 16,
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            <Slider
                                disabled={running}
                                value={speed}
                                onValueChange={(value) => { setSpeed(value) }}
                                minimumValue={-90}
                                maximumValue={90}
                                minimumTrackTintColor={color.text}
                                maximumTrackTintColor={color.text}
                                thumbTintColor={color.disabled}
                                thumbStyle={{
                                    backgroundColor: color.text,
                                    height: Dimensions.get('window').height / 8,
                                    width: Dimensions.get('window').height / 12,
                                }}
                                trackStyle={{
                                    height: Dimensions.get('window').height / 8,
                                    width: Dimensions.get('window').height * 9 / 16,
                                }}
                                minimumTrackStyle={{ backgroundColor: color.disabled }}
                                maximumTrackStyle={{ backgroundColor: color.disabled }}
                                step={1}
                            />
                        </View>
                    </View>
                    <Icon
                        icon={faChevronDown}
                        look={color.background}
                        execute={() => { if (speed > -90) { setSpeed(speed - 1) } }}
                        disabled={running}
                    />
                </View>
            </View>
        </SafeAreaView>
    )
}

function JsonScreen({ navigation }): JSX.Element {
    const [served, setServed] = useState<jsonresponse>({
        time: [],
        rpm: {
            out: [0],
            reference: [0],
            error: [0],
            percent: [[0.0], [0]]
        },
        direction: {
            out: [0],
            reference: [0],
            error: [0],
            percent: [[0], [0]]
        },
        objects: {
            front: [0],
            back: [0],
            count: [0]
        },
        signal: [0]
    })

    useFocusEffect(
        React.useCallback(() => {
            fetching = 2
            return () => {
                fetching = 0
            }
        }, [])
    )

    const pong = async () => {
        try {
            if (fetching == 2) {
                const response = await fetch('http://10.42.0.1:3000/history')
                const json = await response.json()
                setServed(json)
                if (served.rpm.out == undefined) {
                    setServed({
                        time: [],
                        rpm: {
                            out: [0],
                            reference: [0],
                            error: [0],
                            percent: [[0.0], [0]]
                        },
                        direction: {
                            out: [0],
                            reference: [0],
                            error: [0],
                            percent: [[0], [0]]
                        },
                        objects: {
                            front: [0],
                            back: [0],
                            count: [0]
                        },
                        signal: [0]
                    })
                }
            }
        } catch (error) {
            console.error(error)
        } finally {
            if (fetching == 2) {
                setTimeout(pong, 50)
            }
            else {
                setTimeout(pong, 2000)
            }
        }
    }

    useEffect(() => {
        pong()
    }, [])
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
                    nestedScrollEnabled={true}
                    decelerationRate={0.65}
                    snapToInterval={Dimensions.get('window').width}
                    snapToAlignment={'center'}
                    style={{
                        width: Dimensions.get('window').width,
                        height: Dimensions.get('window').height,
                    }}>
                    <ScrollView
                        pagingEnabled={true}
                        nestedScrollEnabled={true}
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
                                    labels: served.time,
                                    datasets: [{
                                        data: served.rpm.reference,
                                        strokeWidth: 4,
                                        color: () => '#888888',
                                    }, {
                                        data: served.rpm.out,
                                        strokeWidth: 4,
                                        color: () => '#0d56df',
                                    }, {
                                        data: served.rpm.error,
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
                                    data: [served.rpm.percent[0][served.rpm.percent[0].length - 1]],
                                    labels: ['Velocidad'],
                                }}
                            />
                            <Graph
                                rgb={[221, 13, 86]}
                                type={"progress"}
                                datasets={{
                                    data: [served.rpm.percent[1][served.rpm.percent[1].length - 1]],
                                    labels: ['Error'],
                                }}
                            />
                        </View>
                    </ScrollView>
                    <ScrollView
                        pagingEnabled={true}
                        nestedScrollEnabled={true}
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
                                    labels: served.time,
                                    datasets: [{
                                        data: served.direction.reference,
                                        strokeWidth: 4,
                                        color: () => '#888888',
                                    }, {
                                        data: served.direction.out,
                                        strokeWidth: 4,
                                        color: () => '#0d56df',
                                    }, {
                                        data: served.direction.error,
                                        strokeWidth: 4,
                                        color: () => '#dd0d56',
                                    }],
                                    legend: ['Referencia', 'Direccion', 'Error']
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
                                    data: [served.direction.percent[0][served.direction.percent[0].length - 1]],
                                    labels: ['Direccion'],
                                }}
                            />
                            <Graph
                                rgb={[221, 13, 86]}
                                type={"progress"}
                                datasets={{
                                    data: [served.direction.percent[1][served.direction.percent[1].length - 1]],
                                    labels: ['Error'],
                                }}
                            />
                        </View>
                    </ScrollView>
                    <ScrollView
                        pagingEnabled={true}
                        nestedScrollEnabled={true}
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
                                    labels: served.time,
                                    datasets: [{
                                        data: served.objects.count,
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
                                    labels: served.time,
                                    datasets: [{
                                        data: served.objects.front,
                                        strokeWidth: 4,
                                        color: () => '#0d56df',
                                    }, {
                                        data: served.objects.back,
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

function App(): JSX.Element {
    return (
        <NavigationContainer>
            <Stack.Navigator>
                <Stack.Screen
                    name="Main"
                    component={MainScreen}
                    headerMode="none"
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="Graph"
                    component={JsonScreen}
                    headerMode="none"
                    options={{ headerShown: false }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    )
}

export default App
