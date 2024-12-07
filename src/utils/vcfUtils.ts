import { Contact, VCFData } from "../types/Contact";

export const parseVCF = (content: string): VCFData => {
  const contacts: Contact[] = [];
  const vcardBlocks = content
    .split("BEGIN:VCARD")
    .filter((block) => block.trim())
    .map((block) => "BEGIN:VCARD" + block);

  vcardBlocks.forEach((block) => {
    const lines = block.split("\n").map((line) => line.trim());
    let fullName = "";
    const phones: { original: string; secondary: string }[] = [];

    lines.forEach((line) => {
      if (line.startsWith("FN:")) {
        fullName = line.substring(3);
      } else if (line.startsWith("TEL;")) {
        const originalPhone = line.split(":")[1];
        const secondaryPhone = createSecondaryPhone(originalPhone);
        phones.push({
          original: originalPhone,
          secondary: secondaryPhone || originalPhone,
        });
      }
    });

    if (fullName && phones.length > 0) {
      contacts.push({ fullName, phones });
    }
  });

  return { contacts, rawContent: content };
};

export const createSecondaryPhone = (phone: string): string => {
  // Liste des préfixes béninois (hors +229/00229)
  const beninPrefixes = [
    "40",
    "41",
    "42",
    "43",
    "44",
    "46",
    "50",
    "51",
    "52",
    "53",
    "54",
    "55",
    "56",
    "57",
    "58",
    "59",
    "60",
    "61",
    "62",
    "63",
    "64",
    "65",
    "66",
    "67",
    "68",
    "69",
    "90",
    "91",
    "94",
    "95",
    "96",
    "97",
    "98",
    "99",
  ];

  // Nettoyer le numéro de tous les caractères spéciaux
  const cleanPhone = phone.replace(/[-\s]/g, "");

  // Normaliser le format 00229 en +229
  const normalizedPhone = cleanPhone.startsWith("00229")
    ? cleanPhone.replace("00229", "+229")
    : cleanPhone;

  // Cas 1: Numéro commençant par +229
  if (normalizedPhone.startsWith("+229")) {
    const match = normalizedPhone.match(/^\+229(\d)(.*)$/);
    if (!match) return "";
    const [, firstDigit, rest] = match;

    return normalizedPhone.startsWith("+229")
      ? `+22901${firstDigit}${rest}`
      : `0022901${firstDigit}${rest}`;
  }

  // Cas 2: Numéro local béninois (commençant par l'un des préfixes)
  for (const prefix of beninPrefixes) {
    if (normalizedPhone.startsWith(prefix)) {
      const restOfNumber = normalizedPhone.substring(2);
      if (restOfNumber.length >= 6) {
        return `01${prefix}${restOfNumber}`;
      }
    }
  }

  // Si le numéro ne correspond à aucun format béninois, retourner une chaîne vide
  return "";
};

export const generateModifiedVCF = (vcfData: VCFData): string => {
  let modifiedContent = "";
  const vcardBlocks = vcfData.rawContent
    .split("BEGIN:VCARD")
    .filter((block) => block.trim())
    .map((block) => "BEGIN:VCARD" + block);

  vcardBlocks.forEach((block) => {
    if (block.trim()) {
      const lines = block.split("\n");
      const modifiedLines: string[] = [];
      let inVCard = false;

      lines.forEach((line) => {
        const trimmedLine = line.trim();

        // Gestion du début et fin de vCard
        if (trimmedLine === "BEGIN:VCARD") {
          inVCard = true;
          modifiedLines.push(line);
          return;
        }

        // Si c'est une ligne de téléphone, inverser l'ordre
        if (inVCard && trimmedLine.startsWith("TEL;")) {
          const originalPhone = trimmedLine.split(":")[1];
          const secondaryPhone = createSecondaryPhone(originalPhone);

          if (secondaryPhone && secondaryPhone !== originalPhone) {
            // Ajouter d'abord le numéro secondaire
            const telType = trimmedLine.split(":")[0];
            modifiedLines.push(`${telType}:${secondaryPhone}`);
            // Puis ajouter le numéro original avec ;OTHER
            modifiedLines.push(`${telType};OTHER:${originalPhone}`);
          } else {
            // Si pas de numéro secondaire, ajouter juste l'original
            modifiedLines.push(line);
          }
        } else {
          // Pour toutes les autres lignes, les ajouter normalement
          modifiedLines.push(line);
        }

        if (trimmedLine === "END:VCARD") {
          inVCard = false;
        }
      });

      modifiedContent += modifiedLines.join("\n") + "\n";
    }
  });

  return modifiedContent;
};
