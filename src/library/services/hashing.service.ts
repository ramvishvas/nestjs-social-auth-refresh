import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class HashingService {
  async hash(data: string | Buffer): Promise<string> {
    const saltRounds = await bcrypt.genSalt();
    return bcrypt.hash(data.toString(), saltRounds);
  }

  async compare(data: string | Buffer, encrypted: string): Promise<boolean> {
    return bcrypt.compare(data.toString(), encrypted);
  }
}
