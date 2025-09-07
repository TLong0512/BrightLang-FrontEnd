import { Range } from "./question-bank.model";

export interface RoadMap {
  id?: string;
  name?: string;
  questionPerDay?: number,
  timeRequired?: number,
  signupCount?: number,
  roadmapElements?: RoadMapElement[];
}
export interface PricingPlan {
  id?: string;
  title: string;
  price?: number;
  period: string;
  features: string[];
  buttonText: string;
  isPopular?: boolean;
}

export interface RoadMapElement {
  questionPerDay?: number;
  repeatDays?: number;
  range?: Range;
}
