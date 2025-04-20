export interface PassportTypes {
  country: string;
  passportType: string;
  passportNumber: string;
  surname: string;
  givenName: string;
  nationality: string;
  birthDate: string;
  gender: string;
  issueDate: string;
  expiryDate: string;
  placeOfBirth: string;
  issuingAuthority: string;
  photoUrl?: string;
  signatureUrl?: string;
  signatureUrlIssuingOfficer?: string;
  department?: string;
  diplomaticRank?: string;
  mission?: string;
  nationalityCode: string;
  componentRef?: React.RefObject<HTMLDivElement | null>;
}

export interface Passport {
  _id: string;
  passportNumber: string;
  personalNumber: string;
  passportType: string;
  surname: string;
  givenName: string;
  nationality: string;
  birthDate: string;
  gender: string;
  issueDate: string;
  expiryDate: string;
  placeOfBirth: string;
  issuingAuthority: string;
  department: string;
  diplomaticRank: string;
  mission: string;
  photo: string;
  photoId: string;
  signature: string;
  signatureId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  isPrinted: boolean;
}
