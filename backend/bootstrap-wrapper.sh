#!/usr/bin/env bash
set -euo pipefail
echo "Bootstrapping Gradle wrapper without loading the project..."
gradle -b bootstrap-wrapper.gradle wrapper
echo "Wrapper created. Now run: ./gradlew bootRun"
