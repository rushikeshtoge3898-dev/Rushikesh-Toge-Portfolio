# Security Specification & Threat Model

## 1. Data Invariants
1. Public unauthenticated visitors may ONLY read `site_settings/profile`, `site_settings/cms_config`, `site_assets/{assetId}`, and documents in `projects`, `certifications`, `skill_categories`, `education`, and `experiences` where `status == 'published'`.
2. Draft records (`status == 'draft'`), `site_settings/profile_draft`, `site_settings/cms_config_draft`, `site_settings/cms_config_prev`, and `/media_assets` metadata MUST NEVER be readable or writable by unauthenticated or non-admin users.
3. Contact messages (`/contact_messages/{messageId}`) are write-once for visitors on `create` with `isRead == false`, `createdAt == request.time`, and strict field/length bounds. Non-admins can NEVER `read`, `update`, or `delete` contact messages.
4. Admin mutations (`create`, `update`, `delete`) on portfolio collections, CMS configs, media assets, and reads/updates/deletes on `contact_messages` require `request.auth != null`, `request.auth.token.email_verified == true`, and verified admin identity (`request.auth.token.email == 'rushikeshtoge3898@gmail.com'` or `/admins/$(request.auth.uid)`).
5. All document IDs match `^[a-zA-Z0-9_\\-]+$` (`<= 128` chars), and all strings/lists have explicit `.size()` bounds.
6. Ghost/shadow fields are blocked on every write via `keys().hasAll(...) && keys().hasOnly(...)`.

## 2. Adversarial "Dirty Dozen" Payloads (Expected: PERMISSION_DENIED)
1. Unauthenticated `update`/`create`/`delete` on `/projects/careernest` or `/site_settings/cms_config`.
2. Signed-in non-admin user attempting to `create` `/projects/hack` or `/media_assets/hack`.
3. Admin email spoofed with `email_verified: false` attempting `update` on `/site_settings/profile` or `/site_settings/cms_config`.
4. Unauthenticated user attempting `get` on a `draft` project (`/projects/placeholder-1`), `site_settings/profile_draft`, `site_settings/cms_config_draft`, or `site_settings/cms_config_prev`.
5. Unauthenticated `list` on `/projects`, `/site_settings`, or `/media_assets` without admin privilege.
6. Unauthenticated user attempting `list` or `get` on `/contact_messages`.
7. Visitor submitting `/contact_messages` with `isRead: true` or extra ghost field `isAdmin: true`.
8. Visitor submitting `/contact_messages` with forged `createdAt` not equal to `request.time`.
9. Visitor submitting `/contact_messages` with a 10KB `message` string (> 4000 limit).
10. Non-admin user attempting to write `/admins/{uid}` or `/site_assets/profile_photo` to escalate privileges or deface assets.
11. Oversized document ID (`> 128` chars or invalid characters `../`) on `/projects/{id}`.
12. `update` on `/contact_messages/{id}` by admin injecting an extra field or changing `message`/`email` instead of only `isRead`.
