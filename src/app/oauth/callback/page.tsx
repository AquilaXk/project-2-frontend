"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchMe } from "@/lib/auth";
import { Panel } from "@/components/ui/Panel";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { SkeletonLine } from "@/components/ui/SkeletonLine";

export default function OAuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const run = async () => {
      const apiKey = searchParams.get("apiKey")?.trim();
      const accessToken = searchParams.get("accessToken")?.trim();
      if (apiKey) {
        localStorage.setItem("buyerApiKey", apiKey);
      }
      if (accessToken) {
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("wsAccessToken", accessToken);
      }

      const result = await fetchMe();
      if (!isMounted) return;
      if (result.ok) {
        router.replace("/");
        return;
      }
      setErrorMessage(result.errorMessage || "로그인에 실패했습니다.");
    };
    run();
    return () => {
      isMounted = false;
    };
  }, [router, searchParams]);

  return (
    <div className="page">
      <main className="container">
        <Panel>
          <SkeletonLine width="40%" />
          <SkeletonLine width="70%" style={{ marginTop: 12 }} />
          {errorMessage ? (
            <div style={{ marginTop: 16 }}>
              <ErrorMessage message={errorMessage} />
            </div>
          ) : null}
        </Panel>
      </main>
    </div>
  );
}
