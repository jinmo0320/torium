import { AuthDeps } from "../auth.service";

import { CheckCodeReqDto } from "../auth.dto";
import { DomainError } from "src/shared/errors/error";
import { ErrorCodes } from "src/shared/errors/errorCodes";

/**
 * 인증코드 검증
 * @param   email
 * @param   code
 * @errors  EMAIL_VERIFICATION_FAILED
 */
type CheckVerificationCodeUsecase = ({
  email,
  code,
}: CheckCodeReqDto) => Promise<void>;

export const createCheckVerificationCode =
  ({ authRepository }: AuthDeps): CheckVerificationCodeUsecase =>
  async ({ email, code }) => {
    /* [Error] verification failed */
    const isVerified = await authRepository.checkVerificationCode(email, code);
    if (!isVerified) {
      throw new DomainError(
        ErrorCodes.AUTH.EMAIL_VERIFICATION_FAILED,
        "Email verification code is incorrect or expired.",
      );
    }

    /* 0. 코드 삭제 */
    await authRepository.deleteVerificationCode(email);
    /* 1. 인증 정보 저장 */
    await authRepository.setEmailVerified(email);
  };
