import mqtt from 'mqtt';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

const argv=yargs(hideBin(process.argv))
  .option('url',{type:'string',default:process.env.MQTT_BROKER_URL||'mqtt://localhost:1883'})
  .option('topic',{type:'string',default:process.env.MQTT_TOPIC||'telemetry'})
  .option('rate',{type:'number',default:50})
  .option('burst',{type:'number',default:0})
  .option('burstSeconds',{type:'number',default:0})
  .argv;

function event(seq){
  const types=['temp','hum','vibration'];
  const type=types[Math.floor(Math.random()*types.length)];
  return { deviceId:'dev-'+(1+Math.floor(Math.random()*2000)), ts:new Date().toISOString(), type, value:Math.round((Math.random()*100+Number.EPSILON)*100)/100, seq };
}

const client=mqtt.connect(argv.url);
client.on('connect',()=>{
  console.log('MQTT connected to', argv.url);
  let seq=1;
  const base=argv.rate, burst=argv.burst, ms=argv.burstSeconds*1000;
  const start=Date.now();
  const loop=()=>{
    const elapsed=Date.now()-start;
    const rate=elapsed<=ms?base+burst:base;
    const interval=1000/Math.max(1,rate);
    const msg=event(seq++);
    const dup=Math.random()<0.01;
    client.publish(argv.topic, JSON.stringify(msg), {qos:1});
    if(dup) client.publish(argv.topic, JSON.stringify({...msg}), {qos:1});
    setTimeout(loop, interval);
  };
  loop();
});
