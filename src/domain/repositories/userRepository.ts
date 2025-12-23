import { UUID } from "crypto";
import { UserDto } from "../models/dtos/userDto";

export interface UserRepository {
  createUser(user: UserDto.CreateRequest): Promise<UserDto.Response>;
  findUserById(id: UUID): Promise<UserDto.Response | null>;
  findUserByEmail(email: string): Promise<UserDto.Response | null>;
  findUserByName(name: string, tag: string): Promise<UserDto.Response | null>;
}
