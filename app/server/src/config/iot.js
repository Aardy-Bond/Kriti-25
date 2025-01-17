import mqtt from 'mqtt'

const mqttOptions = {
    host:process.env.MQTT_BROKER_HOSTNAME,
    port:process.env.MQTT_BROKER_PORT,
    protocol:'mqtts',
    username:process.env.MQTT_BROKER_USERNAME,
    password:process.env.MQTT_BROKER_PASSWORD,
    rejectedUnauthorized:true
}
const mqttClient = mqtt.connect(mqttOptions);

export default mqttClient;