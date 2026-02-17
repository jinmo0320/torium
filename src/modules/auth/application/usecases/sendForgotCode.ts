import { AuthDeps } from "../auth.service";
import {
  generateVerificationCode,
  validateEmail,
} from "src/modules/auth/domain/auth.logic";

import { DomainError } from "src/shared/errors/error";
import { ErrorCodes } from "src/shared/errors/errorCodes";
import { SendCodeResDto } from "../auth.dto";
import { Timer } from "src/shared/utils/timer";

/**
 * 비밀번호 찾기 인증코드 이메일 전송
 * @param   email
 * @errors  EMAIL_NOT_REGISTERED, WRONG_EMAIL_FORMAT
 * @returns 인증코드 생성 시각과 만료 시각
 */
type SendForgotCodeUsecase = (email: string) => Promise<SendCodeResDto>;

export const createSendForgotCode =
  ({
    userRepository,
    authRepository,
    EmailSender,
  }: AuthDeps): SendForgotCodeUsecase =>
  async (email) => {
    /* [Error] input validation */
    if (!validateEmail(email))
      throw new DomainError(
        ErrorCodes.AUTH.WRONG_EMAIL_FORMAT,
        "The email format is incorrect.",
      );

    /* [Error] 가입되지 않은 이메일 */
    if (!(await userRepository.findUserByEmail(email)))
      throw new DomainError(
        ErrorCodes.AUTH.EMAIL_NOT_REGISTERED,
        "You cannot retrieve your password with an unregistered email address.",
      );

    /* 0. 인증코드 생성 */
    const code = generateVerificationCode();
    /* 1. 이메일 전송 */
    await EmailSender.sendMail(email, code);
    /* 2. 인증 정보 초기화 및 코드 저장 */
    await authRepository.setEmailUnverified(email);
    await authRepository.saveVerificationCode(email, code);
    /* 3. 응답 반환 */
    return {
      createdAt: Timer.getTimestampKST(),
      expiredAt: Timer.getTimestampKST(5),
    };
  };
