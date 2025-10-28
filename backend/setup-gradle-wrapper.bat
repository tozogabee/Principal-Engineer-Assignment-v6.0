@echo off
echo Generating Gradle wrapper (8.8)...
gradle wrapper --gradle-version 8.8
if %ERRORLEVEL% NEQ 0 (
  echo Failed to generate wrapper.
  exit /b 1
)
echo Done. Use .\gradlew bootRun
