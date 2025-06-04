// Types for AWS Bedrock integration
export interface BedrockMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface BedrockResponse {
  content: string;
  error?: Error;
}

// Types for AWS Medical Comprehend integration
export interface MedicalEntity {
  text: string;
  category: string;
  type: string;
  score: number;
  beginOffset: number;
  endOffset: number;
}

export interface MedicalEntitiesResponse {
  entities: MedicalEntity[];
  error?: Error;
}

export interface PHIResponse {
  phi: MedicalEntity[];
  error?: Error;
}

// Environment variable types
export interface AwsConfig {
  bedrock: {
    region: string;
    modelId: string;
  };
  medicalComprehend: {
    region: string;
  };
}
