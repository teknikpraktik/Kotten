export const FINISH_MESSAGES: string[] = [
  'Bra jobbat, du ser stark ut!',
  'Grymt jobbat!',
  'Du ser stark ut!',
  'Snyggt genomfört!',
  'Så ska det se ut!',
  'Du är en klippa!',
  'Riktigt bra kämpat!',
  'Starkare för varje dag!',
  'Du gör skillnad, ett pass i taget!',
  'Fantastiskt jobbat idag!',
  'Vilken kämpe du är!',
  'Du reste dig och körde – heja dig!',
  'Kroppen tackar dig!',
  'Ett steg starkare!',
  'Toppen, du klarade det!',
  'Du är på rätt väg!',
  'Imponerande, fortsätt så!',
  'Guld värt, det där!',
  'Du kan vara stolt idag!',
  'Precis så bygger man styrka!',
  'Bra rutin, bra jobbat!',
  'Du gav allt – klockrent!',
  'Starkt av dig!',
  'Ännu ett pass i ryggen!',
  'Du är seg på rätt sätt!',
  'Vilken form du är i!',
  'Heja dig, det där satt!',
  'Du fixade det galant!',
  'Stabilt jobbat idag!',
  'Din framtida jag tackar dig!',
  'Full poäng för idag!',
  'Du är omöjlig att stoppa!'
];

let lastIndex = -1;

export function getRandomFinishMessage(): string {
  if (FINISH_MESSAGES.length <= 1) {
    return FINISH_MESSAGES[0] ?? '';
  }

  let index = Math.floor(Math.random() * FINISH_MESSAGES.length);
  if (index === lastIndex) {
    index = (index + 1) % FINISH_MESSAGES.length;
  }
  lastIndex = index;
  return FINISH_MESSAGES[index];
}
