#!/bin/bash
BASE_URL="http://localhost:8080/api"

# Standard curl command with JSON headers
function api_request() {
  local method=$1
  local endpoint=$2
  local data=$3
  local token=$4
  
  local cmd="curl -s -X $method $BASE_URL$endpoint -H 'Content-Type: application/json'"
  if [ -n "$token" ]; then
    cmd="$cmd -H 'Authorization: Bearer $token'"
  fi
  if [ -n "$data" ]; then
    cmd="$cmd -d '$data'"
  fi
  
  eval $cmd
}

export -f api_request
export BASE_URL
