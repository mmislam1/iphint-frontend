# Signup Questionnaire Backend Guide

The frontend now stores signup step-one answers in Redux until the user finishes the account signup form. On the final `POST /auth/register`, the request includes an optional `questionnaire` object.

## Incoming Register Payload

```json
{
  "name": "Jane Creator",
  "companyName": "Studio Name",
  "specificRole": "Photographer",
  "country": "KR",
  "phoneNumber": "+821012345678",
  "email": "jane@example.com",
  "password": "Strong-password1",
  "referralCode": "OPTIONAL",
  "questionnaire": {
    "activeField": "photography",
    "imageUseLocation": "social_media",
    "unauthorizedUseExperience": "yes_once_or_twice",
    "stolenWorkResponse": "request_removal",
    "discoverySource": "recommendation",
    "skipped": false,
    "completedAt": "2026-06-18T12:00:00.000Z"
  }
}
```

If the user presses `Skip`, the frontend sends:

```json
{
  "questionnaire": {
    "activeField": "",
    "imageUseLocation": "",
    "unauthorizedUseExperience": "",
    "stolenWorkResponse": "",
    "discoverySource": "",
    "skipped": true,
    "completedAt": "2026-06-18T12:00:00.000Z"
  }
}
```

## Collection

Create a separate collection named `questionnaire`.

Recommended document fields:

```ts
{
  _id: ObjectId,
  userId: ObjectId,
  activeField: string,
  imageUseLocation: string,
  unauthorizedUseExperience: string,
  stolenWorkResponse: string,
  discoverySource: string,
  skipped: boolean,
  completedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

Create the questionnaire document only after the user document is created, then store the new user's `_id` as `userId`. Add an index on `{ userId: 1 }`; make it unique if each user should only have one questionnaire.

## Accepted Option Codes

- `activeField`: `photography`, `illustration_design`, `ecommerce`, `model_agency`, `brand_marketing`, `other`
- `imageUseLocation`: `website_portfolio`, `social_media`, `ecommerce_platforms`, `marketplaces`, `ads_campaigns`, `other`
- `unauthorizedUseExperience`: `yes_often`, `yes_once_or_twice`, `not_sure`, `no`
- `stolenWorkResponse`: `request_removal`, `report_platform`, `ask_compensation`, `legal_action`, `not_sure`
- `discoverySource`: `search_engine`, `social_media`, `recommendation`, `community_event`, `ads`, `other`

## Register Flow

1. Validate normal account signup fields.
2. Create the user as the current register flow already does.
3. If `questionnaire` exists, validate the option codes and create a `questionnaire` document linked to the new user.
4. Continue the existing response behavior, including email verification or token return.

If the backend uses a strict DTO/schema for `/auth/register`, add `questionnaire` as an optional nested object so older clients without this field still work.
