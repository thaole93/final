import { decode } from 'jsonwebtoken'

import { JwtPayload } from './JwtPayload'

export function parseUserId(jwtToken: string): string {
  const decodedJwt = decode(jwtToken) as JwtPayload
  const sub = decodedJwt.sub;
  if (sub == null) return null;
  const items = sub.split('|');
  return items[1];
}
