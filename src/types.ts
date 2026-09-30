export type PathogenType =
  | 'Fungal'
  | 'Bacterial'
  | 'Viral'
  | 'Pest/Insect'
  | 'Nutritional Deficiency'
  | 'Environmental Stress'
  | 'Healthy'
  | 'Unknown';

export interface OrganicRemedy {
  name: string;
  materialsNeeded: string[];
  preparationMethod: string;
  applicationSchedule: string;
  estimatedCostRating: 'Very Low / Free' | 'Low' | 'Moderate';
  benefitRationale: string;
}

export interface ChemicalControl {
  name: string;
  activeIngredient?: string;
  dosage: string;
  waitingPeriodDays: number;
  targetPestStage: string;
  applicationMethod: string;
}

export interface DiseaseInfo {
  name: string;
  pathogenType: PathogenType;
  scientificName: string;
  severityScore: 1 | 2 | 3 | 4 | 5;
  severityLabel: string;
  affectedPlantParts: string[];
  symptomsObserved: string[];
}

export interface ApacAdvisory {
  regionalContext: string;
  weatherRiskFactor: string;
  spreadRisk: 'Low' | 'Moderate' | 'High' | 'Severe';
}

export interface PlantDiagnosis {
  id: string;
  timestamp: number;
  isIdentifiable: boolean;
  unclearReason?: string;
  plantSpecies: string;
  confidence: number;
  diseaseOrPest: DiseaseInfo;
  assessmentSummary: string;
  organicRemedies: OrganicRemedy[];
  chemicalControls: ChemicalControl[];
  safetyWarnings: string[];
  preventiveMeasures: string[];
  apacRegionalAdvisory: ApacAdvisory;
  farmerLanguage?: string;
  localLanguageSummary?: string;
  inputImage?: string; // base64 or sample url
  farmerNotes?: string;
  diagnosticEngine?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'agronomist' | 'assistant';
  text: string;
  timestamp: number;
}

export interface SampleCropCase {
  id: string;
  plant: string;
  disease: string;
  pathogenType: PathogenType;
  severity: 1 | 2 | 3 | 4 | 5;
  description: string;
  imageUrl: string;
  farmerNotes: string;
  region: string;
}

export type AppPage = 'dashboard' | 'voice-notes' | 'diagnosis-data';

export interface FieldVoiceNote {
  id: string;
  timestamp: number;
  cropName: string;
  transcript: string;
  englishTranslation?: string;
  notes: string;
  weatherCondition?: string;
  symptomTags: string[];
  attachedImage?: string;
}

