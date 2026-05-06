import { randomUUID } from 'node:crypto';

import { type IdGeneratorPort } from '../../application/ports/outbound/id-generator.port';

export class CryptoIdGenerator implements IdGeneratorPort {
  generate(): string {
    return randomUUID();
  }
}

