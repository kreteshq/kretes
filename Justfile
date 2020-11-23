upgrade:
  ncu -x graphql
  cd template/base && ncu -u
  cd template/react && ncu -u
