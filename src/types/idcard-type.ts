export interface Riders {
  id: string;
  surName: string;
  firstName: string;
  middleName?: string;
  sex: "Male" | "Female";
  district: string;
  dateOfBirth: string;
  park: string;
  photo: string;
  userId: string;
  type: string;
  designation?: string;
  isPrinted?: boolean;
}
export interface Rider {
  passportType: string;
  passportNumber: string;
  personalNumber: string;
  surname: string;
  givenName: string;
  nationality: string;
  birthDate: string;
  gender: string;
  issueDate: string;
  expiryDate: string;
  placeOfBirth: string;
  issuingAuthority: string;
  photo: string;
  signature?: string;
  signatureUrlIssuingOfficer?: string;
  department?: string;
  diplomaticRank?: string;
  mission?: string;
  isPrinted?: boolean;
}
