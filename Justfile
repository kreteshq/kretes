upgrade:
  ncu -u -x yargs,@vue/compiler-sfc
  cd template/base && ncu -u
  cd template/react && ncu -u
  pnpm up
