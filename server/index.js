var express = require('express'),
    fs = require('fs'),
    bodyParser = require('body-parser'),
    app = express(),
    port = process.env.PORT || 3000,
    host = process.env.HOST || '10.42.0.1',
    color = 0

app.use(express.json())

app.get('/', function (req, res) {
    res.send('Hello World!')
})

app.get('/ping', function (req, res) {
    res.json({ message: 'pong' })
})

app.post('/device', function (req, res) {
    var device = req.body
    console.log(device.name)
    if (device.name == 'ESP32') {
        fs.readFile('../data/devices.json', 'utf8', function (err, data) {
            if (err) {
                console.log(err)
                res.send('error')
            } else {
                var infile = JSON.parse(data)
                infile['name'][0] = device.name
                infile['mac'][0] = device.mac
                infile['ip'][0] = device.ip
                infile['gateway'][0] = device.gateway
                infile['dns'][0] = device.dns
                infile['subnet'][0] = device.subnet
                infile['signal'][0] = device.signal
                fs.writeFile('../data/devices.json', JSON.stringify(infile), function (err) {
                    if (err) {
                        console.log(err)
                        res.send('error')
                    }
                })
            }
        })
    } else if (device.name == 'ESP32 Cam') {
        fs.readFile('../data/devices.json', 'utf8', function (err, data) {
            if (err) {
                console.log(err)
                res.send('error')
            } else {
                var infile = JSON.parse(data)
                infile['name'][1] = device.name
                infile['mac'][1] = device.mac
                infile['ip'][1] = device.ip
                infile['gateway'][1] = device.gateway
                infile['dns'][1] = device.dns
                infile['subnet'][1] = device.subnet
                infile['signal'][1] = device.signal
                fs.writeFile('../data/devices.json', JSON.stringify(infile), function (err) {
                    if (err) {
                        console.log(err)
                        res.send('error')
                    }
                })
            }
        })
    }
    res.send('ok')
})

app.get('/pause', function (req, res) {
    fs.readFile('../data/now.json', 'utf8', function (err, data) {
        if (err) {
            console.log(err)
            res.json({ message: 'error' })
        } else {
            var now = JSON.parse(data)
            now['mode'] = 'pause'
            fs.writeFile('../data/now.json', JSON.stringify(now), function (err) {
                if (err) {
                    console.log(err)
                    res.json({ message: 'error' })
                }
            })
        }
    })
    res.json({ message: 'sistema pausado' })
})

app.post('/init', function (req, res) {
    const rf = req.body
    console.log(rf)
    fs.readFile('../data/now.json', 'utf8', function (err, data) {
        if (err) {
            console.log(err)
            res.send('error')
        } else {
            var infile = JSON.parse(data)
            infile['rpm']['reference'] = rf.speed
            infile['direction']['reference'] = [rf.direction]
            infile['mode'] = 'run'
            fs.writeFile('../data/now.json', JSON.stringify(infile), function (err) {
                if (err) {
                    console.log(err)
                    res.send('error')
                }
            })
        }
    })
    fs.readFile('../data/history.json', 'utf8', function (err, data) {
        if (err) {
            console.log(err)
            res.send('error')
        } else {
            var infile = JSON.parse(data)
            infile['rpm']['reference'] = rf.speed
            infile['direction']['reference'] = [rf.direction]
            fs.writeFile('../data/history.json', JSON.stringify(infile), function (err) {
                if (err) {
                    console.log(err)
                    res.send('error')
                }
            })
        }
    })
    res.json({ message: 'sistema iniciado' })
})

app.get('/stop', function (req, res) {
    fs.writeFile('../data/now.json', JSON.stringify({
        time: 0,
        rpm: { out: 0, reference: 0, error: 0, percent: [0, 0] },
        direction: { out: 0, reference: 0, error: 0, percent: [0, 0] },
        objects: { front: 0, back: 0, count: 0 },
        signal: 0,
        mode: 'stop'
    }), function (err) {
        if (err) {
            console.log(err)
        }
    })
    fs.writeFile('../data/history.json', JSON.stringify({
        time: [0],
        rpm: { out: [0], reference: [0], error: [0], percent: [[0], [0]] },
        direction: { out: [0], reference: [0], error: [0], percent: [[0], [0]] },
        objects: { front: [0], back: [0], count: [0] },
        signal: [0]
    }), function (err) {
        if (err) {
            console.log(err)
        }
    })
    res.json({ message: 'sistema parado' })
})

app.post('/update', function (req, res) {
    var now = req.body
    console.log("Update...")
    fs.writeFile('../data/now.json', JSON.stringify(now), function (err) {
        if (err) {
            console.log(err)
            res.send('error')
        }
    })
    fs.readFile('../data/history.json', 'utf8', function (err, data) {
        if (err) {
            console.log(err)
            res.send('error')
        } else {
            var history = JSON.parse(data)

            history['time'].push(now.time[0]) // [0.05
            history['rpm']['out'].push(now.rpm.out[0])
            history['rpm']['reference'].push(now.rpm.reference[0])
            history['rpm']['error'].push(now.rpm.error[0])
            if (now.rpm.percent[0] == null) {
                now.rpm.percent[0] = 1
            } if (now.rpm.percent[1] == null) {
                now.rpm.percent[1] = 0
            } if (now.direction.percent[0] == null) {
                now.direction.percent[0] = 1
            } if (now.direction.percent[1] == null) {
                now.direction.percent[1] = 0
            }
            history['rpm']['percent'][0].push(now.rpm.percent[0]) // [2
            history['rpm']['percent'][1].push(now.rpm.percent[1]) // 28]
            history['direction']['out'].push(now.direction.out[0]) // [0
            history['direction']['reference'].push(now.direction.reference[0]) // 0]
            history['direction']['error'].push(now.direction.error[0]) // [0
            history['direction']['percent'][0].push(now.direction.percent[0]) // [0
            history['direction']['percent'][1].push(now.direction.percent[1]) // 0]
            history['objects']['front'].push(now.objects.front[0]) // [0
            history['objects']['back'].push(now.objects.back[0]) // 0]
            history['objects']['count'].push(now.objects.count[0]) // [0]
            if (now.signal[0] != null) {
                history['signal'].push(now.signal) // 100]
            }
            fs.writeFile('../data/history.json', JSON.stringify(history), function (err) {
                if (err) {
                    console.log(err)
                    res.send('error')
                } else {
                    res.send('ok')
                }
            })
        }
    })
})

app.get('/status', function (req, res) {
    fs.readFile('../data/now.json', 'utf8', function (err, data) {
        if (err) {
            console.log(err)
            res.json({ message: 'error' })
        } else {
            console.log("Status: sended")
            res.json(JSON.parse(data))
        }
    })
})

app.get('/history', function (req, res) {
    fs.readFile('../data/history.json', 'utf8', function (err, data) {
        if (err) {
            console.log(err)
            res.json({ message: 'error' })
        } else {
            console.log("History: sended")
            res.json(JSON.parse(data))
        }
    })
})

app.put('/theme', function (req, res) {
    fs.readFile('theme.json', 'utf8', function (err, data) {
        if (err) {
            console.log(err)
            res.json({ message: 'error' })
        } else {
            res.json(JSON.parse(data))
        }
    })
})

app.post('/theme', function (req, res) {
    var theme = req.body.theme
    color += 1
    if (color > 3) { color = 0 }
    console.log(`Theme: ${theme} Color: ${color}`)
    fs.writeFile('theme.json', JSON.stringify({ color: color }), function (err) {
        if (err) {
            console.log(err)
            res.json({ message: 'error' })
        }
    })
    res.json({ message: 'ok' })
})

app.listen(port, host, function () {
    console.log('Server running at http://%s:%s/', host, port)
})
