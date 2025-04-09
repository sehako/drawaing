export interface Ranking {
    memberId: number;
    characterImage: string;
    nickname: string;
    value: number;
    lastPlayedAt: string;
  }
export interface UserRanking {
    nickname: string;
    characterImage: string;
    rank: number;
    value: number;
  }