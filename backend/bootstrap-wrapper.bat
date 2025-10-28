@echo off
echo Bootstrapping Gradle wrapper without loading the project...
gradle -b bootstrap-wrapper.gradle wrapper
if %ERRORLEVEL% NEQ 0 (
  echo Failed to create wrapper.
  exit /b 1
)
echo Wrapper created. Now run: .\gradlew bootRun
