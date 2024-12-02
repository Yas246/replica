export interface Contact {
  fullName: string;
  phones: {
    original: string;
    secondary: string;
  }[];
}

export interface VCFData {
  contacts: Contact[];
  rawContent: string;
}
