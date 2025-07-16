import type { LoginDto } from "@/data/dto";
import type { ICredentialResponse } from "@/data/interfaces";
import type { SRO } from "@/data/sro";
import { apiPost } from "@/services/api";

export const AuthAPI = {
  async login(credentials: LoginDto) {
    const res = await apiPost<LoginDto, SRO<ICredentialResponse>>("/User/Login", credentials);
    return res.data.Data;
  }
}