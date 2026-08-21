# Disposable Local Browser Acceptance Notes

## 2026-08-21 — initial host-routing observation

The disposable server started successfully against the isolated `equiprofile_acceptance` MariaDB database on port 3001. A browser request to `http://localhost:3001/academy` returned the Management document title and a blank body. This is expected from hostname-based multi-site routing when the request Host is `localhost`; it is not evidence of an Academy application failure. The next acceptance step must route `academy.localhost` and `shop.localhost` to the local server so the correct site bundle is selected.

## 2026-08-21 — Academy-selected development bundle

Restarting the disposable server with `VITE_SITE=academy` produced the canonical document title, confirming the correct Academy template is selected. The viewport nevertheless remained blank and the browser console reported no error. This leaves a local development asset/mount-path defect to resolve before browser acceptance can be marked complete; the server and isolated database both remained healthy.

## 2026-08-21 — Academy DOM acceptance result

After the local CORS allowlist update, the browser console confirmed React loaded and the canonical Academy route mounted a complete page. The rendered root was visible, 1,274px wide and 5,038.75px high, and contained the Academy navigation, landing hero, pathway/level evidence, learning-process cards, and public actions. The sandbox screenshot still displayed as white despite that verified DOM state; this is treated as a screenshot-rendering limitation rather than a false claim of visual acceptance. Browser DOM and accessibility-content acceptance is recorded as passed; production-device visual verification remains a deployment-stage prerequisite.

## 2026-08-21 — authenticated student acceptance checkpoint

A synthetic verified user was registered and signed in entirely within the disposable database. Selecting the Academy Student experience opened the Student Dashboard successfully. The UI displayed the live curriculum-derived recommendation **Basic Tack Identification**, the beginning level state, **0 / 32** beginner topics completed, pathway/progress actions, and a lesson-opening control. This confirms the authenticated student shell, trusted curriculum retrieval, and live zero-progress state are operational in the local acceptance environment.

## 2026-08-21 — trusted completion acceptance result

The synthetic student opened the live **Parts of the Horse** lesson, including objectives, expanded instructional content, safety note, practical application, common mistakes, five knowledge checks, and lesson-aware Tutor prompts. The browser selected all five answers, received the explanatory **5 / 5** result, and only then showed **Completed** after the explicit `Complete with Score` action. This exercises the trusted answer-key and server-side completion workflow; no browser-supplied score was treated as authoritative.

## 2026-08-21 — Academy-owner route diagnosis in progress

After creating the synthetic local-only organization and `school_owner` membership, the disposable server was switched to the Management bundle and `/academy-dashboard` returned the Management document with React bootstrap logs. The initial viewport was blank with no console error. This is recorded as an in-progress route/render diagnosis rather than a passing owner acceptance result.

## 2026-08-21 — Academy-owner acceptance result

The Management route map was corrected to expose existing protected `/student-dashboard`, `/teacher-dashboard`, and `/academy-dashboard` components. The synthetic `school_owner` then opened the Academy Dashboard successfully and saw the local organisation name, plan, teacher/student capacity, member records, and invitation control. The owner created a synthetic Teacher invitation; the live dashboard updated Pending Invites from **0** to **1**. SMTP remained intentionally disabled, so the invitation is retained only in the disposable database for the next account-matched acceptance step.

## 2026-08-21 — secure invitation and teacher acceptance result

A second synthetic account was registered with the exact email used by the owner’s local Teacher invitation, verified through its local token, and opened `/academy-invite`. The new canonical invite page preserved the login contract, displayed the signed-in email and the server-enforced email-match boundary, then accepted the invitation. The browser redirected to `/teacher-dashboard`, which rendered the Instructor Portal with live teacher identity and teaching controls for students, groups, assignments, lessons, resources, reviews, progress, reports, and account settings. This confirms the owner-to-teacher provisioning flow and closes the previously missing browser invitation route.

## 2026-08-21 — 390 px mobile capture diagnostic

A local Chromium capture was run at a genuine **390 × 844** emulated viewport against `academy.localhost:3002`. It reached the Academy document, Vite client, entry module, Academy application modules and stylesheet. The run exposed a real non-production CORS omission for `http://academy.localhost:3002`; that origin was added to the local allow-list, and the normal disposable login endpoint then returned 200. The current headless capture still leaves `#root` empty despite successful asset delivery, so this is **not recorded as a passing mobile UI result**. DevTools resource and console diagnostics are preserved in `docs/academy/acceptance-mobile/` for follow-up. Desktop Academy DOM acceptance and authenticated student/teacher/owner checks remain separately evidenced above.

## 2026-08-21 — 390 px built-bundle Academy acceptance result

The local **built production bundle** was served only from the disposable database on `academy.localhost:3003` and captured in Chromium at a genuine **390 × 844** CSS viewport. The earlier Vite-headless blank-root condition was isolated to the development transport; the compiled bundle mounted normally. The capture exercised the public Academy home, synthetic authenticated Student Dashboard, **Learning Path** catalogue, **Horse Care Foundations** pathway list, and the **Parts of the Horse** lesson detail. All five rendered with responsive mobile navigation/controls and no horizontal-layout failure in the 390 px screenshots. The lesson detail included its full instructional content, key points, quiz entry point, Tutor prompts and next-lesson control. Evidence files are retained under `docs/academy/acceptance-mobile/`.

## 2026-08-21 — 768 px tablet built-bundle Academy acceptance result

The same disposable built bundle was captured at a **768 × 1024** CSS viewport. The public home, authenticated Student Dashboard, Learning Path catalogue, Horse Care Foundations pathway list and Parts of the Horse lesson detail all rendered and navigated successfully. The lesson retained full content, quiz entry, Tutor prompt controls and next-lesson control at tablet width. Separate tablet evidence is retained in `docs/academy/acceptance-tablet/`. This is local browser acceptance only; real-device/mobile-network installation remains an external device-validation activity.
