export const KIT_TYPE_OPTIONS = [
  { value: "C-ELISA", label: "C-ELISA (Competitive)" },
  { value: "E-ELISA", label: "E-ELISA (Sandwich)" },
  { value: "Easy Step ELISA", label: "Easy Step ELISA" },
  { value: "Microsample ELISA", label: "Microsample ELISA" },
];

export interface Certificate {
  id?: string;
  lotNo: string;
  certificateType: string;
  date: string;
  catalogNo: string;
  fileName: string;
  fileUrl: string;
}

export interface Antibody {
  id: string;
  catalogNo: string;
  productName: string;
  host: string;
  clonality: string;
  applications: string[];
  reactivity: string[];
  dilution: string;
  immunogen: string;
  observedBand: string;
  geneId: string;
  uniprotId: string;
  image: string;
  datasheets: string[];
  productSpecificInfo: string[];
  targetInfo: string;
  certificates?: Certificate[];
}

export interface ElisaKit {
  id: string;
  bipCode: string;
  catalogNo: string;
  productName: string;
  reactivity: string;
  size: string;
  productType: string;
  species: string;
  alternativeNames: string[];
  assayType: string;
  sensitivity: string;
  standard: string;
  detectionRange: string;
  sampleType: string;
  measurement: string;
  assayLength: string;
  sampleVolume: string;
  detectionWavelength: string;
  leadTime: string;
  image: string;
  datasheets: string[];
  researchArea: string[];
  testPrinciple: string;
  targetName: string;
  abbreviation: string;
  protocolLink: string;
  uniprotId: string;
  certificates?: Certificate[];
}

export interface NewsItem {
  id: string;
  date: string;
  category: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  imagePage: string;
}
