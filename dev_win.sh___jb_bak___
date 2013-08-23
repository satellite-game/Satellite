#!/bin/sh

# Change to the directory that contains the script
cd `dirname $0`

# Watch in the background
function watch() {
	grunt watch &
}

# Serve the client in the background
function server() {
    node app.js
}

# Perform build
grunt default

# Start server
server

# Start watching
watch

# Wait a second, then open the server
sleep 2
Start "http://localhost:1337"

# Kill child processes when the script is killed
trap 'kill $(jobs -p)' EXIT

# Wait to be killed
wait
