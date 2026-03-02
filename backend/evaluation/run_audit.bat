@echo off
setlocal

set "SCRIPT_DIR=%~dp0"
for %%I in ("%SCRIPT_DIR%..") do set "BACKEND_DIR=%%~fI"
cd /d "%BACKEND_DIR%"

if "%~1"=="" (
  set "REPORT_PATH=evaluation\audit-report.json"
) else (
  set "REPORT_PATH=%~1"
)

echo [audit] Running evaluation tests with external judges...
echo [audit] Report path: %REPORT_PATH%

uv run pytest -q evaluation --run-audit --audit-report-json "%REPORT_PATH%"
set "EXIT_CODE=%ERRORLEVEL%"

if "%EXIT_CODE%"=="0" (
  echo [audit] Completed successfully.
) else (
  echo [audit] Failed with exit code %EXIT_CODE%.
)

exit /b %EXIT_CODE%
