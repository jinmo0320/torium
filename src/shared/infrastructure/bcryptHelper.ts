import bcrypt from "bcrypt";
import { BcryptHelper } from "src/modules/auth/domain/auth.external";

export const createBcryptHelper = (): BcryptHelper => ({
  hashPassword: async (password: string): Promise<string> => {
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  },

  comparePassword: async (
    password: string,
    hashedPassword: string,
  ): Promise<boolean> => {
    return await bcrypt.compare(password, hashedPassword);
  },
});
