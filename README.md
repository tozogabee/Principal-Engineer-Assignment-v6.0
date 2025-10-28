# Principal-Realtime-Assessment (v5.6)

This repo includes Docker infra (Postgres, Kafka, MQTT), a Spring Boot 3 WebFlux app shell, a minimal WS UI, Node.js generators, a k6 smoke script, and a **review-exercise** module for code review.

## Requirements
- Java **17+** (tested with OpenJDK **21**)
- Docker & Docker Compose
- Node.js **18+** (for generators)
- System Gradle not required (wrapper provided via bootstrap)

**Ports:** Postgres 5432, Kafka 9092 (internal) & **29092 (external for host)**, MQTT 1883, Backend 8080.

## Quick Start

## Infra
```
cp .env.example .env
docker compose -f docker-compose.apache.yml up -d
```

## Build system (Gradle wrapper)
Prefer using the provided wrapper setup scripts (no system Gradle required):
- Windows: `backend\setup-gradle-wrapper.bat`
- macOS/Linux: `backend/setup-gradle-wrapper.sh`

## Bootstrap Gradle wrapper (no project parsing)
```
cd backend
./bootstrap-wrapper.sh
# or on Windows:
bootstrap-wrapper.bat
```

## Run backend
```
./gradlew clean bootRun
```
Ensure **Java 21** is installed and on PATH.

# Health:
```
curl -i http://localhost:8080/actuator/health
```

## Open UI
Open `ui/index.html`, click **Connect** to `ws://localhost:8080/ws`

## Generators

Kafka (host -> external listener: localhost:29092)
```
cd generator
npm install
# Host apps and generators connect via localhost:29092
node kafka-producer.js --broker=localhost:29092 --topic=telemetry --rate=50 --burst=500 --burstSeconds=120
```

MQTT
```
cd generator
npm install
node mqtt-producer.js --url=mqtt://localhost:1883 --topic=telemetry --rate=50 --burst=500 --burstSeconds=120
```

## Optional k6
```
cd load
docker run --rm -i --network host -v "$PWD:/scripts" grafana/k6 run /scripts/k6.js
```

## Security profile
```
SPRING_PROFILES_ACTIVE=secure ./gradlew bootRun
```

## Candidate Deliverables (summary)
**Processing requirement**
- Broadcast processed events on the WebSocket channel to all connected clients.

**Deliverables**
- Architecture doc (≤ 6 pages): dataflow; partitioning & keys; backpressure; idempotency & ordering; DB schema/indexes; auth; observability; SLOs & risks.
- Working vertical slice: ingest → process → persist → broadcast. Include scripts/commands to run end-to-end.
- Load/perf report: methodology; sustained vs burst behavior; p50/p95/p99 latencies; throughput; CPU; heap/GC (graphs or tables).
- Tests: meaningful unit tests and integration tests (prefer Testcontainers).
- Security proof: enable a secure profile with JWT validation (and outline mTLS plan between services).
- Live demo with recruiter: present your solution and walk through the architecture and a short load demo.
- Code review: written review of the provided review-exercise module with concrete fixes and rationale.
