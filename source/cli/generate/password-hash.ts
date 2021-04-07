// Copyright Zaiste. All rights reserved.
// Licensed under the Apache License, Version 2.0

import { hash } from 'argon2';

export const handler = async ({ password }: { password: string }) => {
  const output = await hash(password);
  console.log(output);
};

export const command = 'password-hash <password>';
