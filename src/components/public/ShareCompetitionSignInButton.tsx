"use client";

import { Share2 } from "lucide-react";
import { OutlineButton } from "@/components/admin/ui";
import { useToast } from "@/components/providers/ToastProvider";
import { shareCompetitionSignInLink } from "@/lib/competitionSignInShare";

type ShareCompetitionSignInButtonProps = {
  nom: string;
  slug: string;
  className?: string;
};

export function ShareCompetitionSignInButton({
  nom,
  slug,
  className = "",
}: ShareCompetitionSignInButtonProps) {
  const { showToast } = useToast();

  return (
    <OutlineButton
      type="button"
      icon={Share2}
      size="sm"
      className={className}
      aria-label={`Partager le lien de connexion pour ${nom}`}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        void shareCompetitionSignInLink({ nom, slug }, showToast);
      }}
    >
      Partager le lien
    </OutlineButton>
  );
}
