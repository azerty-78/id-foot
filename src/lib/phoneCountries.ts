export type PhoneCountry = {
  dial: string;
  label: string;
  localLength: number;
  groups: number[];
};

export const PHONE_COUNTRIES: PhoneCountry[] = [
  { dial: "+237", label: "Cameroun", localLength: 9, groups: [3, 3, 3] },
  { dial: "+241", label: "Gabon", localLength: 8, groups: [2, 2, 2, 2] },
  { dial: "+242", label: "Congo", localLength: 9, groups: [3, 3, 3] },
  { dial: "+243", label: "RDC", localLength: 9, groups: [3, 3, 3] },
  { dial: "+225", label: "Côte d'Ivoire", localLength: 10, groups: [2, 2, 2, 2, 2] },
  { dial: "+221", label: "Sénégal", localLength: 9, groups: [3, 3, 3] },
  { dial: "+234", label: "Nigeria", localLength: 10, groups: [3, 3, 4] },
  { dial: "+212", label: "Maroc", localLength: 9, groups: [3, 3, 3] },
  { dial: "+213", label: "Algérie", localLength: 9, groups: [3, 3, 3] },
  { dial: "+33", label: "France", localLength: 9, groups: [1, 2, 2, 2, 2] },
  { dial: "+32", label: "Belgique", localLength: 9, groups: [3, 2, 2, 2] },
  { dial: "+1", label: "États-Unis / Canada", localLength: 10, groups: [3, 3, 4] },
  { dial: "+44", label: "Royaume-Uni", localLength: 10, groups: [4, 3, 3] },
  { dial: "+49", label: "Allemagne", localLength: 10, groups: [3, 3, 4] },
  { dial: "+34", label: "Espagne", localLength: 9, groups: [3, 3, 3] },
  { dial: "+351", label: "Portugal", localLength: 9, groups: [3, 3, 3] },
];

export const DEFAULT_PHONE_DIAL = "+237";

export function getPhoneCountry(dial: string): PhoneCountry {
  return PHONE_COUNTRIES.find((c) => c.dial === dial) ?? PHONE_COUNTRIES[0];
}

export function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

export function formatLocalPhone(dial: string, raw: string): string {
  const country = getPhoneCountry(dial);
  const digits = digitsOnly(raw).slice(0, country.localLength);
  if (digits.length === 0) return "";

  const parts: string[] = [];
  let offset = 0;

  for (const size of country.groups) {
    if (offset >= digits.length) break;
    parts.push(digits.slice(offset, offset + size));
    offset += size;
  }

  if (offset < digits.length) {
    parts.push(digits.slice(offset));
  }

  return parts.join(" ");
}

export function composePhoneNumber(dial: string, localFormatted: string): string {
  const local = digitsOnly(localFormatted);
  if (!local) return "";
  return `${dial} ${formatLocalPhone(dial, local)}`.trim();
}

export function parsePhoneNumber(full: string | null | undefined): {
  dial: string;
  local: string;
} {
  if (!full?.trim()) {
    return { dial: DEFAULT_PHONE_DIAL, local: "" };
  }

  const normalized = full.trim();
  const sorted = [...PHONE_COUNTRIES].sort(
    (a, b) => b.dial.length - a.dial.length,
  );

  for (const country of sorted) {
    if (normalized.startsWith(country.dial)) {
      const local = digitsOnly(normalized.slice(country.dial.length));
      return {
        dial: country.dial,
        local: formatLocalPhone(country.dial, local),
      };
    }
  }

  const digits = digitsOnly(normalized);
  if (digits.startsWith("237") && digits.length > 3) {
    return {
      dial: "+237",
      local: formatLocalPhone("+237", digits.slice(3)),
    };
  }

  return {
    dial: DEFAULT_PHONE_DIAL,
    local: formatLocalPhone(DEFAULT_PHONE_DIAL, digits),
  };
}
