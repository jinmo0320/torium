/**
 * 이메일 검증
 * - 영문, 숫자, 특수기호
 * - @
 * - 도메인 주소 형식
 * @param email 이메일
 * @returns 이메일 형식을 지켰니
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

/**
 * 비밀번호 검증
 * - 영문자
 * - 숫자
 * - 특수문자 !@#$%^&*()_+={}[]|\:;"'<>,.?/-
 * - 8자 이상
 * @param password 비밀번호
 * @returns 비밀번호 형식을 지켰니
 */
export const validatePassword = (password: string): boolean => {
  const passwordRegex =
    /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*()_+={}\[\]|\\:;"'<>,.?/-]).{8,}$/;
  return passwordRegex.test(password);
};

/**
 * 이메일 인증 코드 생성
 * - 6자리 무작위 숫자
 * @returns 이메일 인증 코드
 */
export const generateVerificationCode = () =>
  Array.from({ length: 6 }, () => Math.floor(Math.random() * 10)).join("");
