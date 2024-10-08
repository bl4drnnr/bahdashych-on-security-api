import { Body, Controller, Post, Query, UseGuards, UsePipes } from '@nestjs/common';
import { ValidationPipe } from '@pipes/validation.pipe';
import { GenerateRecoveryKeysDto } from '@dto/generate-recovery-keys.dto';
import { TrxDecorator } from '@decorators/transaction.decorator';
import { Transaction } from 'sequelize';
import { AuthGuard } from '@guards/auth.guard';
import { UserId } from '@decorators/user-id.decorator';
import { RecoverAccountDto } from '@dto/recover-account.dto';
import { RecoveryService } from '@modules/recovery.service';
import { LoginGenerateRecoveryKeysDto } from '@dto/login-generate-recovery-keys.dto';

@Controller('recovery')
export class RecoveryController {
  constructor(private readonly recoveryService: RecoveryService) {}

  @UsePipes(ValidationPipe)
  @Post('registration-generate-recovery-keys')
  registrationGenerateRecoveryKeys(
    @Query('confirmationHash') confirmationHash: string,
    @Body() payload: GenerateRecoveryKeysDto,
    @TrxDecorator() trx: Transaction
  ) {
    return this.recoveryService.registrationGenerateRecoveryKeys({
      confirmationHash,
      payload,
      trx
    });
  }

  @UsePipes(ValidationPipe)
  @Post('login-generate-recovery-keys')
  loginGenerateRecoveryKeys(
    @Body() payload: LoginGenerateRecoveryKeysDto,
    @TrxDecorator() trx: Transaction
  ) {
    return this.recoveryService.loginGenerateRecoveryKeys({
      payload,
      trx
    });
  }

  @UsePipes(ValidationPipe)
  @UseGuards(AuthGuard)
  @Post('generate-recovery-keys')
  generateRecoveryKeys(
    @Body() payload: GenerateRecoveryKeysDto,
    @UserId() userId: string,
    @TrxDecorator() trx: Transaction
  ) {
    return this.recoveryService.generateRecoveryKeys({
      payload,
      userId,
      trx
    });
  }

  @UsePipes(ValidationPipe)
  @Post('recover-account')
  recoverUserAccount(
    @Body() payload: RecoverAccountDto,
    @TrxDecorator() trx: Transaction
  ) {
    return this.recoveryService.recoverUserAccount({ payload, trx });
  }
}
