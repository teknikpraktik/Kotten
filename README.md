# Kotten

Kotten är en liten mobilanpassad träningsapp som guidar ett barn genom ett fast
dagligt pass med balansbräda och tåhävningar. Appen är byggd för att kunna
installeras som PWA på iPhone och andra mobiltelefoner.

## Teknik

- React, TypeScript och Vite
- vite-plugin-pwa för manifest och service worker
- Vanlig CSS
- localStorage för träningshistorik
- Vitest, ESLint och Prettier
- npm och versionshanterad `package-lock.json`

Appen har ingen backend, databas, inloggning, molnlagring eller externa
analystjänster.

## Installera

```bash
npm install
```

## Starta lokalt

```bash
npm run dev
```

Öppna den lokala Vite-adressen som skrivs ut i terminalen.

## Tester och kontroller

```bash
npm run format:check
npm run lint
npm run typecheck
npm run test:run
```

Under utveckling kan tester köras i watch-läge:

```bash
npm run test
```

## Produktionsbygge

```bash
npm run build
```

Byggresultatet hamnar i `dist`, vilket fungerar med Vercels standardinställningar
för Vite. För att förhandsgranska bygget lokalt:

```bash
npm run preview
```

## PWA-installation

Efter första lyckade laddningen cachelagras appens grundskal av service workern
och kan användas offline. På iPhone installeras appen via Safari med Dela och
Lägg till på hemskärmen. På Android och desktop visas installation när
webbläsaren bedömer att PWA:n är installerbar.

Service workern använder automatisk uppdatering via `vite-plugin-pwa`.

## Lokal historik

Genomförda pass sparas endast i webbläsarens `localStorage`. Ett datum räknas
bara en gång även om passet görs flera gånger samma dag. Streak räknas alltid
från historiken, inte från ett separat sparat streakvärde.

Om webbläsardata rensas försvinner historiken. Ett pågående pass återställs inte
om appen stängs helt.

## Kända begränsningar

- iPhone kan kräva att PWA:n öppnas via Safari och läggs till på hemskärmen för
  bästa fristående upplevelse.
- Web Speech API, vibration och Screen Wake Lock stöds olika mellan webbläsare.
  Kotten använder dem som progressiv förbättring och fungerar utan dem.
- Ljud kan blockeras av webbläsaren tills användaren har interagerat med appen.
- Wake Lock kan nekas eller släppas av systemet, särskilt vid låg batterinivå
  eller när appen går till bakgrunden.

## Deployment

Repositoryt är kopplat till GitHub:

```text
https://github.com/teknikpraktik/Kotten
```

Vercel kan importera GitHub-repositoryt och använda standardinställningar för
Vite:

- install command: `npm install`
- build command: `npm run build`
- output directory: `dist`

Inga miljövariabler eller serverspecifika funktioner krävs.
