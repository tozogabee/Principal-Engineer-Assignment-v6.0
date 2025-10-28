import { Kafka, Partitioners } from 'kafkajs';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

const argv = yargs(hideBin(process.argv))
  .option('broker',{type:'string',default:process.env.KAFKA_BROKER||'localhost:29092'})
  .option('topic',{type:'string',default:process.env.KAFKA_TOPIC||'telemetry'})
  .option('rate',{type:'number',default:50})
  .option('burst',{type:'number',default:0})
  .option('burstSeconds',{type:'number',default:0})
  .argv;

const kafka=new Kafka({brokers:[argv.broker]});
const producer=kafka.producer({createPartitioner:Partitioners.LegacyPartitioner});

function event(seq){
  const types=['temp','hum','vibration'];
  const type=types[Math.floor(Math.random()*types.length)];
  return { deviceId:'dev-'+(1+Math.floor(Math.random()*2000)), ts:new Date().toISOString(), type, value:Math.round((Math.random()*100+Number.EPSILON)*100)/100, seq };
}

async function run(){
  await producer.connect();
  console.log('Kafka producer connected to', argv.broker);
  let seq=1;
  const base=argv.rate, burst=argv.burst, ms=argv.burstSeconds*1000;
  const start=Date.now();
  const loop=async()=>{
    const elapsed=Date.now()-start;
    const rate=elapsed<=ms?base+burst:base;
    const interval=1000/Math.max(1,rate);
    const msg=event(seq++);
    const dup=Math.random()<0.01;
    const payload=[{value:JSON.stringify(msg)}];
    if(dup) payload.push({value:JSON.stringify({...msg})});
    try{
      await producer.send({topic:argv.topic,messages:payload});
    }catch(err){
      console.error('Send error:', err.message);
    }
    setTimeout(loop, interval);
  };
  loop();
}
run().catch(e=>{console.error(e);process.exit(1)});
