
export interface StrategyStep {
  id: number;
  title: string;
  description: string;
  tasks: string[];
}

export interface SEOPoint {
  category: string;
  details: string[];
}

export interface TreeData {
  name: string;
  children?: TreeData[];
}
