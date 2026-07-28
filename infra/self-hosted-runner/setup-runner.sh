#!/usr/bin/env bash
set -euo pipefail

if [ -z "${1-}" ] || [ -z "${2-}" ]; then
  echo "Usage: $0 <REGISTRATION_TOKEN> <REPO_URL>"
  exit 1
fi

REG_TOKEN="$1"
REPO_URL="$2"
RUNNER_DIR="/opt/actions-runner"
cd "$RUNNER_DIR"

RUNNER_VERSION="2.305.0"

# Download runner if not present
if [ ! -f "./bin/runsvc.sh" ]; then
  echo "Downloading and extracting runner ${RUNNER_VERSION}..."
  curl -O -L https://github.com/actions/runner/releases/download/v${RUNNER_VERSION}/actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz
  tar xzf ./actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz
fi

./config.sh --unattended --url "$REPO_URL" --token "$REG_TOKEN"

# Install as a service
sudo ./svc.sh install
sudo ./svc.sh start

echo "Runner registered and started for $REPO_URL"
