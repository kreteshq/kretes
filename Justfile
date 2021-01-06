upgrade:
  ncu -u -x graphql,yargs,@vue/compiler-sfc
  cd template/base && ncu -u
  cd template/react && ncu -u
  pnpm up
