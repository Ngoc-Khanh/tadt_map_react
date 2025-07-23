import type { LoginDto } from "@/data/dto";
import type { ILoginCredentials } from "@/data/interfaces";
import type { SRO } from "@/data/sro";
import { apiPost } from "@/services/api";

export const AuthAPI = {
  async login(credentials: LoginDto) {
    const res = await apiPost<LoginDto, SRO<ILoginCredentials>>("/c360/auth/login-c360", credentials  );
    return res.data.data;
  }
}