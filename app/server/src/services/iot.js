import mqttClient from "../config/iot.js";
import { BroadcastData } from "./socket.js";

mqttClient.on('connect', ()=>{
    console.log('Connected to MQTT broker');
    mqttClient.subscribe(`stroller/+/data`, (error)=>{
      if(!err) console.log(`Subscribed`);
      else console.error(`Subscription error:`, error);
    });
});
  
mqttClient.on('error', (error)=>{
    console.error(`MQTT Connection Error:${error}`);
});
  
mqttClient.on('message', (topic, message)=>{
    console.log(`Received message on topic ${topic}: ${message.toString()}`);
      try {
        const data = JSON.parse(message.toString());
        console.log('Processing incoming data:', data);
        if(data.carbonEmission !== undefined || data.company !== undefined) throw new Error('Insufficient Data');
        let latestData = {
            company:data.company,
            carbonEmission:data.carbonEmission,
        }
        console.log('Updated latest data:', latestData);
        BroadcastData({strollerId , data}); 
      } catch (error){
        console.error(`Failed to process incoming data:${error}`);
      }
});

