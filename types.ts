
export enum LawSystem {
  LABOR = 'نظام العمل',
  CORPORATE = 'نظام الشركات',
  CIVIL = 'نظام المعاملات المدنية',
  CRIMINAL = 'نظام الإجراءات الجزائية',
  SHARIA = 'نظام المرافعات الشرعية',
  PERSONAL = 'نظام الأحوال الشخصية الجديد',
}

export type AppTheme = 'dark' | 'light-green';

export interface LegalQuery {
  system: LawSystem | string;
  details: string;
}

export interface AnalysisResponse {
  text: string;
  sources?: string[];
}
