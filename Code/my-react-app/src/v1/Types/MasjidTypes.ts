// Masjid Types

export interface MasjidLocation {
  coordinates: number[];
  type: string;
}

export interface ExternalLinkInput {
  name: string;
  url: string;
}

export interface MasjidOption {
  _id: string;
  masjidName: string;
  address: string;
  contact: string;
}

export interface TempUserInput {
  fullName?: string;
  email?: string;
}

export interface MasjidSearch {
  _id: string;
  masjidName: string;
  location: MasjidLocation;
}

export interface SearchMasjidsData {
  searchMasjids: MasjidSearch[];
}
