import ws from 'k6/ws';
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options={vus:5,duration:'30s'};

export default function(){
  const res=http.get('http://localhost:8080/actuator/health');
  check(res,{ 'health is 200': r=>r.status===200 });
  const url='ws://localhost:8080/ws';
  const response=ws.connect(url, {}, function(socket){
    socket.on('open',()=>{ socket.send('ping') });
    socket.on('message',()=>{});
    socket.setTimeout(()=>socket.close(),2000);
  });
  check(response,{ 'status is 101': r=>r&&r.status===101 });
  sleep(1);
}
