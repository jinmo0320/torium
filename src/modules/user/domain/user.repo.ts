import { UUID } from "crypto";
import { User } from "../domain/user.entity";

export type UserRepository = {
  /**
   * 새로운 사용자를 생성
   * @param user 사용자 등록 정보 (이메일, 이름, 태그, 비밀번호)
   * @return 생성된 사용자 정보 (ID, 이메일, 이름, 태그)
   */
  createUser: (user: User.RegisterInput) => Promise<User.Info>;

  /**
   * 사용자 정보를 ID로 조회
   * @param id 사용자 ID
   * @return 사용자 정보 (ID, 이메일, 이름, 태그) 또는 null (사용자 없음)
   */
  findUserById: (id: UUID) => Promise<User.Info | null>;

  /**
   * 사용자 정보를 이메일로 조회
   * @param email 사용자 이메일
   * @return 사용자 정보 (ID, 이메일, 이름, 태그) 또는 null (사용자 없음)
   */
  findUserByEmail: (email: string) => Promise<User.Info | null>;

  /**
   * 사용자 정보를 이름과 태그로 조회
   * @param name 사용자 이름
   * @param tag 사용자 태그
   * @return 사용자 정보 (ID, 이메일, 이름, 태그) 또는 null (사용자 없음)
   */
  findUserByName: (name: string, tag: string) => Promise<User.Info | null>;

  /**
   * 사용자 비밀번호 정보를 조회
   * @param id 사용자 ID
   * @returns 비밀번호 정보 또는 null (사용자 없음)
   */
  getUserPassword: (id: UUID) => Promise<User.PasswordInfo | null>;

  /**
   * 사용자 비밀번호를 업데이트
   * @param id 사용자 ID
   * @param hashedPassword 해시된 비밀번호
   */
  updateUserPassword: (id: UUID, hashedPassword: string) => Promise<void>;

  /**
   * 사용자 투자 유형을 조회
   * @param userId 사용자 ID
   * @returns 투자 유형 또는 null
   */
  getRiskType: (userId: UUID) => Promise<User.RiskType | null>;

  /**
   * 사용자 투자 유형을 업데이트
   * @param userId 사용자 ID
   * @param riskType 업데이트할 투자 유형 (또는 null)
   */
  setRiskType: (userId: UUID, riskType: User.RiskType | null) => Promise<void>;
};
