"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { buildApiUrl, parseRsData } from "@/lib/api";
import { useAuth } from "@/components/auth/AuthContext";

type AuctionDetail = {
  auctionId: number;
  name: string;
  description: string;
  startPrice: number | null;
  currentHighestBid: number | null;
  buyNowPrice?: number | null;
  bidCount: number;
  status: string;
  startAt: string;
  endAt: string;
  imageUrls: string[];
  seller: {
    id: number;
    nickname: string;
    reputationScore: number;
  };
  categoryName?: string;
};

const formatNumber = (value: number | null | undefined) => {
  if (value === null || value === undefined) return "-";
  return value.toLocaleString();
};

const resolveImageUrl = (url: string) => {
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  return buildApiUrl(url);
};

export default function AuctionDetailPage() {
  const params = useParams();
  const auth = useAuth();
  const [auction, setAuction] = useState<AuctionDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [bidAmount, setBidAmount] = useState("");

  const auctionId = useMemo(() => {
    const raw = params?.id;
    const value = Array.isArray(raw) ? raw[0] : raw;
    return value ? Number(value) : null;
  }, [params]);

  useEffect(() => {
    if (!auctionId) {
      setErrorMessage("잘못된 접근입니다.");
      setIsLoading(false);
      return;
    }
    let isMounted = true;
    const fetchDetail = async () => {
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const response = await fetch(buildApiUrl(`/api/auctions/${auctionId}`));
        const { rsData, errorMessage: apiError } =
          await parseRsData<AuctionDetail>(response);
        if (!isMounted) return;
        if (!response.ok || apiError || !rsData) {
          setAuction(null);
          if (response.status === 404) {
            setErrorMessage("존재하지 않는 경매입니다.");
          } else {
            setErrorMessage(apiError || "상세 정보를 불러오지 못했습니다.");
          }
          return;
        }
        setAuction(rsData.data);
      } catch {
        if (isMounted) {
          setErrorMessage("네트워크 오류가 발생했습니다.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    fetchDetail();
    return () => {
      isMounted = false;
    };
  }, [auctionId]);

  useEffect(() => {
    if (!auction) return;
    if (auction.currentHighestBid !== null && auction.currentHighestBid !== undefined) {
      setBidAmount(String(auction.currentHighestBid + 1000));
      return;
    }
    if (auction.startPrice !== null && auction.startPrice !== undefined) {
      setBidAmount(String(auction.startPrice));
    }
  }, [auction]);

  if (isLoading) {
    return (
      <div className="card">
        <div className="skeleton" style={{ width: "60%" }} />
        <div className="skeleton" style={{ width: "90%", marginTop: 12 }} />
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="card">
        <div className="error">{errorMessage}</div>
        <div className="actions" style={{ marginTop: 16 }}>
          <Link className="btn btn-ghost" href="/auctions">
            목록으로 이동
          </Link>
        </div>
      </div>
    );
  }

  if (!auction) {
    return <div className="empty">경매 정보를 찾을 수 없습니다.</div>;
  }

  const isSeller = auth?.me?.id === auction.seller.id;

  return (
    <div className="page">
      <section className="grid-2">
        <div className="card">
          <h2 style={{ marginTop: 0 }}>이미지</h2>
          {auction.imageUrls?.length ? (
            <div className="grid-2">
              {auction.imageUrls.map((url, index) => {
                const resolvedUrl = resolveImageUrl(url);
                return (
                  <div key={`${url}-${index}`} className="panel">
                    <img
                      alt={`경매 이미지 ${index + 1}`}
                      src={resolvedUrl}
                      style={{ width: "100%", borderRadius: 12 }}
                    />
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty">등록된 이미지가 없습니다.</div>
          )}
        </div>
        <div className="card">
          <div className="tag">{auction.status}</div>
          <h1 style={{ marginTop: 8 }}>{auction.name}</h1>
          <p>{auction.description}</p>
          <div className="muted">
            시작가 {formatNumber(auction.startPrice)}원 · 현재가{" "}
            {formatNumber(auction.currentHighestBid)}원
          </div>
          {auction.buyNowPrice !== null && auction.buyNowPrice !== undefined ? (
            <div className="muted">즉시구매 {formatNumber(auction.buyNowPrice)}원</div>
          ) : null}
          <div className="muted">
            입찰 {auction.bidCount}회 · 시작 {auction.startAt} · 종료{" "}
            {auction.endAt}
          </div>
          {!isSeller ? (
            <div className="panel" style={{ marginTop: 16 }}>
              <div className="field">
                <label className="label" htmlFor="bidAmount">
                  입찰가
                </label>
                <input
                  id="bidAmount"
                  className="input"
                  type="number"
                  min={0}
                  step={1000}
                  value={bidAmount}
                  onChange={(event) => setBidAmount(event.target.value)}
                />
              </div>
              <div className="actions" style={{ marginTop: 12 }}>
                <button className="btn btn-primary" type="button">
                  입찰하기
                </button>
              </div>
            </div>
          ) : null}
          {auction.categoryName ? (
            <div className="tag" style={{ marginTop: 8 }}>
              {auction.categoryName}
            </div>
          ) : null}
          <div style={{ marginTop: 16 }}>
            판매자: <strong>{auction.seller.nickname}</strong> (평판{" "}
            {auction.seller.reputationScore})
          </div>
          <div className="panel" style={{ marginTop: 16 }}>
            {auction.status === "OPEN"
              ? "진행 중인 경매입니다. 새로고침으로 최신 상태를 확인하세요."
              : "종료된 경매입니다."}
          </div>
        </div>
      </section>
    </div>
  );
}
