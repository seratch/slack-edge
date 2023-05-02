#!/bin/bash
rm -rf build/ && \
  npm i && \
  npm run build:clean && \
  npm publish