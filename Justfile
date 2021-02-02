upgrade:
  ncu -u -x yargs
  cd template/base && ncu -u
  cd template/react && ncu -u
  pnpm up
