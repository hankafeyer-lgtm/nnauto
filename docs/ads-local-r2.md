# NNAuto Ads — local media upload (R2)

Campaign creatives use the existing object upload routes:

- `POST /api/objects/upload-image` (JPG / PNG / WebP)
- `POST /api/objects/upload-video` (MP4 / WebM)

Binary files are **not** stored in `ad_campaigns` — only public object URLs (`image_url`, `video_url`).

## Required env (local)

Already used by listing uploads:

```
CLOUDFLARE_R2_ACCOUNT_ID=
CLOUDFLARE_R2_ACCESS_KEY_ID=
CLOUDFLARE_R2_SECRET_ACCESS_KEY=
CLOUDFLARE_R2_BUCKET_NAME=
CLOUDFLARE_R2_ENDPOINT=
```

Optional public base URL if objects are served via CDN.

## If R2 is missing locally

- Wizard can still use a demo banner URL or paste an `https://` image URL.
- Do **not** point local `.env` at production secrets you do not own.
- Campaign create will reject empty media unless a URL is provided.

## LOCAL DEMO payment

`POST /api/ads/campaigns/:id/local-demo-pay` marks a campaign paid **without Stripe**.
It sets `stripe_session_id = local_demo_<id>` and moves status to `pending_approval`.
Disabled in production unless `ADS_LOCAL_DEMO=1`.
