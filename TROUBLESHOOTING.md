#### Step-by-step checklist to prove the setup is good. Each step has a clear “pass” signal.

0) Start infra (Apache Kafka + Postgres)
docker compose -f docker-compose.apache.yml up -d
docker ps


Pass: containers kafka and postgres are running.

1) Kafka sanity (topic, produce, consume)

List topics:

docker exec -it kafka bash -lc "/opt/kafka/bin/kafka-topics.sh --bootstrap-server localhost:9092 --list"


Create topic (idempotent):

docker exec -it kafka bash -lc "/opt/kafka/bin/kafka-topics.sh --bootstrap-server localhost:9092 --create --if-not-exists --topic telemetry --partitions 3 --replication-factor 1"


Produce two test messages:

docker exec -i kafka bash -lc 'printf "%s\n" "{\"deviceId\":\"dev-1\",\"seq\":1,\"type\":\"temp\",\"value\":42}" "{\"deviceId\":\"dev-1\",\"seq\":2,\"type\":\"hum\",\"value\":55}" | /opt/kafka/bin/kafka-console-producer.sh --bootstrap-server localhost:9092 --topic telemetry'


Consume them back:

docker exec -it kafka bash -lc "/opt/kafka/bin/kafka-console-consumer.sh --bootstrap-server localhost:9092 --topic telemetry --from-beginning --max-messages 2"


Pass: you see 2 JSON lines printed.

2) Backend up (Gradle wrapper)
cd .\backend
.\setup-gradle-wrapper.bat
$env:SPRING_PROFILES_ACTIVE="dev"
.\gradlew.bat bootRun


Pass: logs show Netty started on port 8080 (http) and app started.

Health endpoint:

curl http://localhost:8080/actuator/health


Pass: {"status":"UP"} (or similar).

3) WebSocket check

Open:
\ui\index.html


Click Connect (URL ws://localhost:8080/ws).
Pass: you see heartbeat:0, heartbeat:1, … appearing.

4) (Optional) Continuous Kafka flow from host

Install & run the generator:

cd ..\generator
npm install
node kafka-producer.js --broker=localhost:29092 --topic=telemetry --rate=50


Pass: the generator logs no errors; broker’s consumer shows messages when you run the consumer again.

5) (Optional) Consumer group proof (shows groups work)

Create a group and consume (commits offsets):

docker exec -it kafka bash -lc "/opt/kafka/bin/kafka-console-consumer.sh --bootstrap-server localhost:9092 --topic telemetry --group realtime-demo --from-beginning --timeout-ms 8000"


Describe the group:

docker exec -it kafka bash -lc "/opt/kafka/bin/kafka-consumer-groups.sh --bootstrap-server localhost:9092 --describe --group realtime-demo"


Pass: you see partitions with CURRENT-OFFSET / LOG-END-OFFSET / LAG.

6) Postgres sanity (optional)
docker exec -it postgres psql -U postgres -d urmine -c "SELECT 1;"


Pass: returns a row with 1.

Quick “if something fails” cheatsheet

kafka-console-consumer.sh: command not found → use the full path: /opt/kafka/bin/...

Group ... not found on --describe → create it first by consuming with --group (step 5).

Backend can’t reach Kafka → set env before bootRun:

$env:SPRING_KAFKA_BOOTSTRAP_SERVERS="localhost:29092"
$env:SPRING_KAFKA_CONSUMER_GROUP_ID="realtime-demo"
$env:SPRING_KAFKA_CONSUMER_AUTO_OFFSET_RESET="earliest"


No WS messages → ensure backend log says “Netty started on port 8080”, then reconnect in the HTML page.