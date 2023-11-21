import {StyleSheet, useColorScheme} from 'react-native'

export function theme(mode: boolean) 
{
    //fetch color scheme.json from http://10.42.0.1:3000/theme
    fetch('http://10.42.0.1:3000/theme', {
        method: 'PUT',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            theme: mode ? 'dark' : 'light'
        })
    }).then((response) => response.json()).then((json) => {
        color.color = json.color
    }).catch((error) => {
        console.error(error)
    })
	color.background = color.mode ? '#000' : '#fff'
	color.disabled = !color.mode ? '#e6e7e8' : '#1c1c22' //light grey, dark grey
    switch (color.color) {
        case 0:
            color.text = color.mode ? '#fff' : '#000'
            break
        case 1:
            color.text = color.mode ? '#00c6b3' : '#0013c6'
            break
        case 2:
            color.text = color.mode ? '#00f410' : '#026d15'
            break
        case 3:
            color.text = color.mode ? '#ff1414' : '#9e0000'
            break
        default:
            color.text = color.mode ? '#fff' : '#000'
            break
    }
}

export const color = {
	mode: false
}
