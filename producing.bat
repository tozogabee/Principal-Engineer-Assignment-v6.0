(echo {"deviceId":"dev-1","seq":1,"type":"temp","value":42} & ^
 echo {"deviceId":"dev-1","seq":2,"type":"hum","value":55}) | ^
docker exec -i kafka /opt/kafka/bin/kafka-console-producer.sh --bootstrap-server localhost:9092 --topic telemetry