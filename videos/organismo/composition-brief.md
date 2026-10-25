# Hyperframes Composition Brief: Observatorio

## Objective
Create a short launch-style brag video for the Observatorio, aimed at someone who represents a business organization.

## Output
- Composition directory: `videos/organismo/composition/`
- Rendered video: `videos/organismo/organismo.mp4`
- Format: landscape — 1920x1080
- Duration: 24 seconds

## Source Material
- Project root: `/Users/alvarocastillo/dev/levantamiento`
- Primary files read: `src/app/globals.css`, `src/app/layout.tsx`, `src/components/site/header.tsx`, `src/components/site/header-ctas.tsx`, `src/components/onboarding/organismo-form.tsx`, `src/app/onboarding/supabase-screen.tsx`, `src/components/organismo/home.tsx`, `src/components/organismo/copy-link.tsx`, `src/components/organismo/link-cards.tsx`, `src/components/organismo/crm-card-body.tsx`, `src/components/organismo/pending-actions.tsx`
- Product name: Observatorio
- Tagline / strongest claim: Quiero invitar
- Key UI or visual moment to recreate: header secondary button, organismo brand form, link generator, pending CRM card
- Copy that must appear verbatim:
  - Quiero invitar
  - La marca de tu organismo
  - Nombre del organismo
  - Color
  - Logo
  - PNG o JPG · hasta 2 MB
  - Terminar perfil
  - Sector
  - Sesión
  - Generar enlace
  - Enlace generado.
  - Copiar
  - Aperturas
  - Pendiente
  - Aceptar
  - Rechazar
  - Observatorio
  - La invitación espera a que el organismo la acepte.

## Creative Direction
- Tone preset: polished
- Creative direction: serio, elegante, una idea por escena, crossfade de 0.7 s
- Interpretation: holds largos, tipografía Archivo/Raleway, un acento rosa
- Angle: la invitación la arma una persona y se queda pendiente hasta que el organismo acepta
- Hook: el botón «Quiero invitar» como único texto grande
- Outro / punchline: Observatorio / La invitación espera a que el organismo la acepte.
- Avoid:
  - Generic SaaS language
  - Abstract filler visuals
  - Unrelated visual redesign
  - A WhatsApp send animation. The app does not send WhatsApp.

## LOOK
Light product surface. White #ffffff, navy text #16284f, pink accent #e8186a. Archivo for the name, Raleway for the interface. Slow crossfades, no punch-in typography.

## Visual Identity
- Background: #ffffff
- Text: #16284f
- Accent: #e8186a
- Display font: Archivo
- Body font: Raleway
- Visual references from the project: secondary outline button, white form fields, elevated cards, navy #16284f

## Storyboard
Use the storyboard in `videos/organismo/brag-plan.md` as the creative contract.

Scene summary:
1. Quiero invitar — 3s — header, only large text is «Quiero invitar»
2. La marca — 6s — three fields and «Terminar perfil»
3. El enlace — 7s — generate link, toast, URL, Aperturas 0→1
4. Pendiente — 8s — CRM card, cursor on Aceptar, still end card

## Audio
- Audio role: warm bed
- Audio arc: narration leads; music stays under it; SFX only on the click, the toast, and the count
- Music: happy-beats-business-moves-vol-12-by-ende-dot-app.mp3
- Music treatment: volume 0.14 under the voice; ease out in the final second
- Music cue guidance: bundled preset vol-12. Lock 8.74, 13.11, and 22.93. Field reveals on 4.39, 5.34, 6.56.
- Audio-reactive treatment: subtle halo behind the hook button if extraction is available; otherwise skip and do not block the render
- Audio-coupled moments:
  - scene 2 — three fields in sequence
  - scene 3 — click, toast, counter
  - scene 4 — cursor to Aceptar
- SFX selection guidance: low HF only. click_003 for the button, impactSoft_medium_001 for the toast, click_005 for the count
- SFX analysis guidance: `.agents/skills/brag/assets/sfx/sfx-analysis.md`
- Exact SFX choice: the three files above
- Audio files: copy music and SFX into `videos/organismo/composition/assets/`
- Voice: Kokoro `ef_dora`, four wavs, one sentence per scene. Do not read the on-screen labels.

## Hyperframes Instructions
Follow the current Hyperframes composition contract. Skip storyline, SPEC.md, usage, history, feedback, and REVIEW.md. `lint`, `validate`, and `inspect` are the gate. Landscape 1920x1080, duration 24 seconds. Show the real UI copy listed above. Keep text readable. Do not publish.
