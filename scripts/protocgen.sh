#!/usr/bin/env bash

set -eo pipefail

proto_dirs=$(find ./proto -path -prune -o -name '*.proto' -print0 | xargs -0 -n1 dirname | sort | uniq)
# echo $proto_dirs;
for dir in $proto_dirs; do
  protoc \
  -I "./proto" \
  --js_out=import_style=commonjs,binary:./src/types\
  $(find "${dir}" -maxdepth 1 -name '*.proto')

  # command to generate gRPC gateway (*.pb.gw.go in respective modules) files
  # protoc \
  # -I "proto" \
  # -I "third_party/proto" \
  # --js_out=logtostderr=true:. \
  # $(find "${dir}" -maxdepth 1 -name '*.proto')

done

# generate codec/testdata proto code
# protoc -I "proto" -I "third_party/proto" -I "testutil/testdata" --gocosmos_out=plugins=interfacetype+grpc,\
# Mgoogle/protobuf/any.proto=github.com/cosmos/cosmos-sdk/codec/types:. ./testutil/testdata/proto.proto

# move proto files to the right places
# cp -r github.com/cosmos/cosmos-sdk/* ./
# rm -rf github.com
