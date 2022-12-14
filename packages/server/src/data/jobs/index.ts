import { CreatureStats, PlayerJob } from '@game/shared-domain';

export const jobsData: Record<PlayerJob, () => CreatureStats> = {
  [PlayerJob.WIZARD]: () => ({
    hp: 100,
    maxHp: 100,
    mp: 100,
    maxMp: 100,
    mpRegenPerSecond: 5
  }),

  [PlayerJob.RANGER]: () => ({
    hp: 100,
    maxHp: 100,
    mp: 100,
    maxMp: 100,
    mpRegenPerSecond: 5
  }),

  [PlayerJob.ROGUE]: () => ({
    hp: 100,
    maxHp: 100,
    mp: 100,
    maxMp: 100,
    mpRegenPerSecond: 5
  }),

  [PlayerJob.BARBARIAN]: () => ({
    hp: 100,
    maxHp: 100,
    mp: 100,
    maxMp: 100,
    mpRegenPerSecond: 5
  })
};
