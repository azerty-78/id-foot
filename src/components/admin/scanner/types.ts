export type ValidatedPlayer = {
  id: string;
  nom: string;
  prenom: string;
  numero: number;
  poste: string;
  photo: string | null;
  qrToken: string;
  equipe: {
    nom: string;
    logo: string | null;
    competition: {
      nom: string;
      annee: number;
      lieu?: string | null;
    };
  };
};

export type ScanPhase = "scanning" | "loading" | "success" | "error";

export type RecentScan = ValidatedPlayer & {
  validatedAt: number;
};
