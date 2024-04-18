#!/bin/bash

script_dir=`dirname $0`
src_dir=${script_dir}/../src
src_deno_dir=${script_dir}/../src_deno

npm run format && \
  cp -p ${src_deno_dir}/README.md deno_README.md && \
  rm -rf ${src_deno_dir}/* && \
  cp -pr ${src_dir}/* ${src_deno_dir}/ && \
  mv ./deno_README.md ${src_deno_dir}/README.md && \
  cd ${script_dir} && \
  ruby ./deno_source_formatter.rb && \
  cd - && \
  cd ${src_deno_dir} && \
  deno fmt && \
  deno lint && \
  deno check ./mod.ts
