# API 변경점 요약

비교 대상:
- 기준: `2차 프로젝트/api-docs.json`
- 최신(추정): `2차 프로젝트/api-docs (1).json`

> 참고: 현재 저장소에 `docs/api-docs-latest.md`가 없어 파일명 기준으로 최신을 추정했습니다. 최신 스냅샷이 따로 있다면 알려 주세요.

## 엔드포인트 변경
- `GET /api/v1/posts`
  - 응답 스키마: `RsDataPagePostDto` -> `RsDataPagePostListResponse`
- `POST /api/v1/posts`
  - operationId: `write` -> `create`
  - 요청 스키마: `PostSaveRequest` -> `PostCreateRequest`
  - 응답 스키마: `RsDataPostDto` -> `RsDataPostIdResponse`
- `GET /api/v1/posts/{id}`
  - 응답 스키마: `RsDataPostDto` -> `RsDataPostDetailResponse`
- `DELETE /api/v1/posts/{id}`
  - 응답 스키마: `RsDataVoid` -> `RsDataPostIdResponse`
- `PATCH /api/v1/posts/{id}`
  - 요청 타입: `application/json` -> `multipart/form-data`
  - 요청 스키마: `PostSaveRequest` -> `PostUpdateRequest`
  - 응답 스키마: `RsDataVoid` -> `RsDataPostIdResponse`

## 스키마 변경
- `PostSaveRequest` 제거, `PostCreateRequest`/`PostUpdateRequest`로 분리
- `PostCreateRequest`
  - `price`가 필수 항목에서 제외됨 (필드 자체는 존재)
  - required: `categoryId`, `content`, `title`
- `PostUpdateRequest`
  - `keepImageUrls` 추가
  - required: `categoryId`, `content`, `title`
- 목록/상세 응답 분리
  - 목록: `PostListResponse` (thumbnailUrl 포함)
  - 상세: `PostDetailResponse` (sellerNickname 포함)
- 페이지 응답 변경
  - `PagePostDto` -> `PagePostListResponse`

## 프론트 영향도 요약
- 게시글 목록/상세 응답 타입 변경으로 DTO 매핑 업데이트 필요
- 게시글 생성/수정은 `multipart/form-data` 기준으로 요청 구성 필요
- 삭제/수정 응답이 `id + message` 형태로 바뀌어 처리 로직 수정 필요
