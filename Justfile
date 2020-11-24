upgrade:
  pnpm up
  ncu -u -x graphql
  cd template/base && ncu -u
  cd template/react && ncu -u
