upgrade:
  ncu -u 
  cd template/base && ncu -u
  cd template/react && ncu -u
  pnpm up
