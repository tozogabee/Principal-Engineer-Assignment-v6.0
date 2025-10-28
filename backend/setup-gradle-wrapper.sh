#!/usr/bin/env bash
set -euo pipefail
echo "Generating Gradle wrapper (8.8)..."
gradle wrapper --gradle-version 8.8
echo "Done. Use ./gradlew bootRun"
