import { buildApiUrl, getAuthHeaders, safeJson } from "@/lib/api";
import type { MemberMe } from "@/components/auth/AuthContext";

export async function fetchMe(): Promise<{
  ok: boolean;
  me: MemberMe | null;
  errorMessage: string | null;
}> {
  try {
    if (typeof window !== "undefined") {
      const apiKey = localStorage.getItem("buyerApiKey")?.trim();
      const accessToken = localStorage.getItem("accessToken")?.trim();
      if (!apiKey && !accessToken) {
        return { ok: false, me: null, errorMessage: null };
      }
    }
    const response = await fetch(buildApiUrl("/api/v1/members/me"), {
      method: "GET",
      headers: getAuthHeaders(),
      credentials: "omit",
    });
    if (!response.ok) {
      return { ok: false, me: null, errorMessage: "인증이 필요합니다." };
    }
    const json = await safeJson<MemberMe>(response);
    if (!json) {
      return { ok: false, me: null, errorMessage: "응답 파싱에 실패했습니다." };
    }
    return { ok: true, me: json, errorMessage: null };
  } catch {
    return { ok: false, me: null, errorMessage: "네트워크 오류가 발생했습니다." };
  }
}
