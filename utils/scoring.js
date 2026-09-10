export const MATCH_COST = 200;

export const getDebt = (p) => (p.played ?? 0) * MATCH_COST - (p.paid ?? 0);

export const isCleanSheetEligible = (p) =>
  p.position === "Goalkeeper" || p.position === "Defender";

export const getPoints = (p, totalMatches) => {
  const played = p.played ?? 0;
  const goals = p.goals ?? 0;
  const assists = p.assists ?? 0;

  const attendance = totalMatches > 0 ? (p.played / totalMatches) * 100 : 0;
  const debt = getDebt(p);
  const zeroDebtBonus = debt <= 0 ? 2 : 0;
  const cleanSheetBonus = isCleanSheetEligible(p)
    ? (p.cleanSheets ?? 0) * 1
    : 0;
  const playerOfTheWeekBonus = (p.playerOfTheWeek ?? 0) * 4;
  return (
    goals * 3 +
    assists * 2 +
    attendance -
    (p.yellowCards ?? 0) * 1 -
    (p.redCards ?? 0) * 3 +
    zeroDebtBonus +
    cleanSheetBonus +
    playerOfTheWeekBonus
  );
};
