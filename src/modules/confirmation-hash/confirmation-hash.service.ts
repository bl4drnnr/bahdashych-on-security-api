import { forwardRef, HttpException, Inject, Injectable } from '@nestjs/common';
import { ConfirmationHash } from '@models/confirmation-hash.model';
import { InjectModel } from '@nestjs/sequelize';
import { UsersService } from '@modules/users.service';
import { CryptographicService } from '@shared/cryptographic.service';
import { EmailService } from '@shared/email.service';
import { AuthService } from '@modules/auth.service';
import { CreateConfirmHashInterface } from '@interfaces/create-confirm-hash.interface';
import { Confirmation } from '@interfaces/confirmation-type.enum';
import { LastPassResetHashInterface } from '@interfaces/last-pass-reset-hash.interface';
import { RecoveryKeysNotSetDto } from '@dto/recovery-keys-not-set.dto';
import { MfaNotSetDto } from '@dto/mfa-not-set.dto';
import { ConfirmAccountInterface } from '@interfaces/confirm-account.interface';
import { AccountAlreadyConfirmedException } from '@exceptions/account-already-confirmed.exception';
import { ConfirmHashInterface } from '@interfaces/confirm-hash.interface';
import { GetByHashInterface } from '@interfaces/get-by-hash.interface';
import { HashNotFoundException } from '@exceptions/hash-not-found.exception';
import { AccountConfirmedDto } from '@dto/account-confirmed.dto';
import { ConfirmPasswordResetInterface } from '@interfaces/confirm-password-reset.interface';
import { TimeService } from '@shared/time.service';
import { LinkExpiredException } from '@exceptions/link-expired.exception';
import { PreviousPasswordException } from '@exceptions/previous-password.exception';
import { PasswordResetDto } from '@dto/password-reset.dto';

@Injectable()
export class ConfirmationHashService {
  constructor(
    private readonly timeService: TimeService,
    private readonly cryptographicService: CryptographicService,
    @Inject(forwardRef(() => EmailService))
    private readonly emailService: EmailService,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
    @InjectModel(ConfirmationHash)
    private readonly confirmationHashRepository: typeof ConfirmationHash
  ) {}

  async confirmAccount({ confirmationHash, trx }: ConfirmAccountInterface) {
    const { user, foundHash } = await this.getUserByConfirmationHash({
      confirmationHash,
      confirmationType: Confirmation.REGISTRATION,
      trx
    });

    const { isMfaSet, userSettings } = user;

    const isAccConfirmed = foundHash.confirmed;
    const isRecoverySetUp = userSettings.recoveryKeysFingerprint;

    if (isAccConfirmed && isMfaSet && isRecoverySetUp)
      throw new AccountAlreadyConfirmedException();

    if (isAccConfirmed && !isMfaSet) return new MfaNotSetDto();

    if (isAccConfirmed && !isRecoverySetUp) return new RecoveryKeysNotSetDto();

    await this.confirmHash({
      hashId: foundHash.id,
      trx
    });

    return new AccountConfirmedDto();
  }

  async confirmResetUserPassword({
    hash,
    payload,
    trx
  }: ConfirmPasswordResetInterface) {
    const { password, mfaCode, language } = payload;

    const { foundHash: forgotPasswordHash, user } =
      await this.getUserByConfirmationHash({
        confirmationHash: hash,
        confirmationType: Confirmation.FORGOT_PASSWORD,
        trx
      });

    if (!forgotPasswordHash) throw new HashNotFoundException();

    const {
      id: userId,
      userSettings,
      password: currentUserPassword,
      email,
      firstName,
      lastName
    } = user;

    const isWithinDay = this.timeService.isWithinTimeframe({
      time: forgotPasswordHash.createdAt,
      seconds: 86400
    });

    if (!isWithinDay) throw new LinkExpiredException();

    try {
      const mfaStatusResponse = await this.authService.checkUserMfaStatus({
        mfaCode,
        userSettings
      });

      if (mfaStatusResponse) return mfaStatusResponse;
    } catch (e: any) {
      throw new HttpException(e.response.message, e.status);
    }

    const hashedPassword = await this.cryptographicService.hashPassword({
      password
    });

    const isPreviousPassword = await this.cryptographicService.comparePasswords({
      dataToCompare: hashedPassword,
      hash: currentUserPassword
    });

    if (isPreviousPassword) throw new PreviousPasswordException();

    await this.usersService.updateUser({
      payload: { password: hashedPassword },
      userId,
      trx
    });

    await this.usersService.updateUserSettings({
      payload: { passwordChanged: new Date() },
      userId,
      trx
    });

    await this.emailService.sendResetPasswordCompleteEmail({
      userInfo: { firstName, lastName },
      to: email,
      language
    });

    await this.confirmHash({
      hashId: forgotPasswordHash.id,
      trx
    });

    return new PasswordResetDto();
  }

  async createConfirmationHash({
    payload,
    trx: transaction
  }: CreateConfirmHashInterface) {
    const { userId, confirmationType, confirmationHash } = payload;

    await this.confirmationHashRepository.create(
      {
        userId,
        confirmationHash,
        confirmationType
      },
      { transaction }
    );
  }

  async getUserLastPasswordResetHash({
    userId,
    trx: transaction
  }: LastPassResetHashInterface) {
    return this.confirmationHashRepository.findOne({
      rejectOnEmpty: undefined,
      where: {
        userId,
        confirmationType: Confirmation.FORGOT_PASSWORD
      },
      order: [['created_at', 'DESC']],
      transaction
    });
  }

  async confirmHash({ hashId: id, trx: transaction }: ConfirmHashInterface) {
    await this.confirmationHashRepository.update(
      {
        confirmed: true
      },
      { returning: false, where: { id }, transaction }
    );
  }

  async getUserByConfirmationHash({
    confirmationHash,
    confirmationType,
    trx: transaction
  }: GetByHashInterface) {
    const where: Partial<ConfirmationHash> = { confirmationHash };

    if (confirmationType) where.confirmationHash = confirmationHash;

    const foundHash = await this.confirmationHashRepository.findOne({
      where,
      transaction
    });

    if (!foundHash) throw new HashNotFoundException();

    const user = await this.usersService.getUserById({
      id: foundHash.userId
    });

    return { foundHash, user };
  }

  async getUserIdByConfirmationHash({
    confirmationHash,
    trx: transaction
  }: GetByHashInterface) {
    const foundHash = await this.confirmationHashRepository.findOne({
      rejectOnEmpty: undefined,
      where: { confirmationHash },
      transaction
    });

    if (!foundHash) throw new HashNotFoundException();

    return { userId: foundHash.userId };
  }
}
