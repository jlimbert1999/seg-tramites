import { Controller, Get, ParseIntPipe, Query } from '@nestjs/common';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { validResources } from 'src/auth/interfaces/valid-resources.interface';
import { OutboxService } from '../services';

@Controller('outbox')
@Auth(validResources.outbox)
export class OutboxController {
  constructor(private readonly outboxService: OutboxService) {}
}
