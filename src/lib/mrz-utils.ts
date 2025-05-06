/**
 * MRZ (Machine Readable Zone) Utility Functions
 *
 * A comprehensive set of functions for generating and validating MRZ codes
 * for passport and travel documents according to ICAO standards.
 */

/**
 * Formats a string for MRZ by replacing spaces and special characters with '<'
 * and padding or truncating to the specified length
 *
 * @param input - The input string to format
 * @param length - The desired length (0 for no padding/truncation)
 * @returns The formatted string
 */
export function formatMRZString(input: string, length: number): string {
  // Replace spaces and special characters with '<'
  const formatted = input?.replace(/[^\w]/g, "<").replace(/\s/g, "<");

  // If length is 0, return as is, otherwise pad or truncate
  return length === 0
    ? formatted
    : formatted?.padEnd(length, "<").substring(0, length);
}

/**
 * Calculates the check digit for an MRZ string
 *
 * @param input - The input string to calculate the check digit for
 * @returns The check digit as a string
 */
export function calculateMRZCheckDigit(input: string): string {
  // Character weights for check digit calculation
  const weights = [7, 3, 1];

  let sum = 0;

  // Calculate weighted sum
  for (let i = 0; i < input?.length; i++) {
    const char = input.charAt(i);
    let value: number;

    if (char >= "0" && char <= "9") {
      value = Number.parseInt(char, 10);
    } else if (char >= "A" && char <= "Z") {
      value = char.charCodeAt(0) - "A".charCodeAt(0) + 10;
    } else if (char === "<") {
      value = 0;
    } else {
      value = 0; // Default for any other character
    }

    sum += value * weights[i % 3];
  }

  // Return the remainder when divided by 10
  return (sum % 10).toString();
}

/**
 * Converts a Date object to MRZ date format (YYMMDD)
 *
 * @param date - The Date object to convert
 * @returns The date in MRZ format (YYMMDD)
 */
export function dateToMRZFormat(date: Date): string {
  // Get last two digits of year
  const year = date.getFullYear() % 100;

  // Get month and day, zero-padded
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");

  // Combine in YYMMDD format
  return `${year.toString().padStart(2, "0")}${month}${day}`;
}

/**
 * Converts a timestamp (milliseconds since epoch) to MRZ date format (YYMMDD)
 *
 * @param timestamp - The timestamp in milliseconds
 * @returns The date in MRZ format (YYMMDD)
 */
export function timestampToMRZFormat(timestamp: number): string {
  return dateToMRZFormat(new Date(timestamp));
}

/**
 * Converts a date string (YYYY-MM-DD) to MRZ date format (YYMMDD)
 *
 * @param dateString - The date string in YYYY-MM-DD format
 * @returns The date in MRZ format (YYMMDD)
 */
export function dateStringToMRZFormat(dateString: string): string {
  return dateToMRZFormat(new Date(dateString));
}

/**
 * Converts an MRZ date format (YYMMDD) to a Date object
 *
 * @param mrzDate - The date in MRZ format (YYMMDD)
 * @returns A Date object
 */
export function mrzFormatToDate(mrzDate: string): Date {
  if (mrzDate.length !== 6) {
    throw new Error("MRZ date must be exactly 6 characters in YYMMDD format");
  }

  const yearStr = mrzDate.substring(0, 2);
  const monthStr = mrzDate.substring(2, 4);
  const dayStr = mrzDate.substring(4, 6);

  // Convert to numbers
  const year = Number.parseInt(yearStr, 10);
  const month = Number.parseInt(monthStr, 10) - 1; // JavaScript months are 0-indexed
  const day = Number.parseInt(dayStr, 10);

  // Determine century (assume 20xx for years less than 50, 19xx otherwise)
  const fullYear = year < 50 ? 2000 + year : 1900 + year;

  return new Date(fullYear, month, day);
}

/**
 * Interface for passport data used to generate MRZ
 */
export interface PassportData {
  passportNumber: string;
  passportType: string;
  surname: string;
  givenName: string;
  nationality: string;
  birthDate: string | Date | number; // Can be YYMMDD string, Date object, or timestamp
  gender: string;
  expiryDate: string | Date | number; // Can be YYMMDD string, Date object, or timestamp
  personalNumber: string;
  issuingCountry: string;
}

/**
 * Generates the MRZ for a passport document
 *
 * @param data - The passport data
 * @returns An object containing the two MRZ lines
 */
export function generatePassportMRZ(data: PassportData): {
  line1: string;
  line2: string;
} {
  // Process dates based on their type
  let formattedbirthDate: string;
  let formattedExpiryDate: string;

  // Handle date of birth
  if (typeof data?.birthDate === "string" && data?.birthDate.length === 6) {
    // Already in YYMMDD format
    formattedbirthDate = data?.birthDate;
  } else if (typeof data?.birthDate === "string") {
    // Date string (YYYY-MM-DD)
    formattedbirthDate = dateStringToMRZFormat(data?.birthDate);
  } else if (data?.birthDate instanceof Date) {
    // Date object
    formattedbirthDate = dateToMRZFormat(data?.birthDate);
  } else if (typeof data?.birthDate === "number") {
    // Timestamp
    formattedbirthDate = timestampToMRZFormat(data?.birthDate);
  } else {
    // throw new Error("Invalid date of birth format");
  }

  // Handle expiry date
  if (typeof data?.expiryDate === "string" && data?.expiryDate?.length === 6) {
    // Already in YYMMDD format
    formattedExpiryDate = data?.expiryDate;
  } else if (typeof data?.expiryDate === "string") {
    // Date string (YYYY-MM-DD)
    formattedExpiryDate = dateStringToMRZFormat(data?.expiryDate);
  } else if (data?.expiryDate instanceof Date) {
    // Date object
    formattedExpiryDate = dateToMRZFormat(data?.expiryDate);
  } else if (typeof data?.expiryDate === "number") {
    // Timestamp
    formattedExpiryDate = timestampToMRZFormat(data?.expiryDate);
  } else {
    // throw new Error("Invalid expiry date format");
  }

  // Format and pad the inputs
  const documentType = data?.passportType?.toUpperCase();
  const documentCode = documentType;

  // Format issuing country (3 characters)
  const formattedIssuingCountry = formatMRZString(
    // data.issuingCountry.toUpperCase(),
    "GMB",
    3
  );

  // Format name (39 characters total)
  const formattedSurname = formatMRZString(data?.surname?.toUpperCase(), 0);
  const formattedgivenName = formatMRZString(data?.givenName?.toUpperCase(), 0);
  const formattedName = (formattedSurname + "<<" + formattedgivenName).padEnd(
    39,
    "<"
  );

  // Format passport number (9 characters)
  const formattedPassportNumber = formatMRZString(
    data?.passportNumber?.toUpperCase(),
    9
  );

  // Calculate check digit for passport number
  const passportNumberCheckDigit = calculateMRZCheckDigit(
    formattedPassportNumber
  );

  // Format nationality (3 characters)
  const formattedNationality = formatMRZString("GMB", 3);

  // Calculate check digit for date of birth
  const birthDateCheckDigit = calculateMRZCheckDigit(formattedbirthDate!);

  // Format gender (1 character)
  const formattedGender = formatMRZString(data?.gender?.toUpperCase(), 1);

  // Calculate check digit for expiry dates
  const expiryDateCheckDigit = calculateMRZCheckDigit(formattedExpiryDate!);

  // Format personal number (14 characters) and calculate check digit
  const formattedPersonalNumber = formatMRZString(
    data?.personalNumber,

    14
  ).padEnd(14, "<");
  const personalNumberCheckDigit = calculateMRZCheckDigit(
    formattedPersonalNumber
  );

  // Construct the first line of MRZ
  const line1 = documentCode + formattedIssuingCountry + formattedName;

  // Construct the second line of MRZ
  let line2 =
    formattedPassportNumber +
    passportNumberCheckDigit +
    formattedNationality +
    formattedbirthDate! +
    birthDateCheckDigit +
    formattedGender +
    formattedExpiryDate! +
    expiryDateCheckDigit +
    formattedPersonalNumber +
    personalNumberCheckDigit;

  // Calculate the final check digit for the entire second line
  const finalCheckDigit = calculateMRZCheckDigit(
    formattedPassportNumber +
      passportNumberCheckDigit +
      formattedNationality +
      formattedbirthDate! +
      birthDateCheckDigit +
      formattedGender +
      formattedExpiryDate! +
      expiryDateCheckDigit +
      formattedPersonalNumber +
      personalNumberCheckDigit
  );

  line2 += finalCheckDigit;

  return { line1, line2 };
}

/**
 * Validates an MRZ by checking all check digits
 *
 * @param line1 - The first line of the MRZ
 * @param line2 - The second line of the MRZ
 * @returns An object with validation results
 */
export function validateMRZ(
  line1: string,
  line2: string
): {
  isValid: boolean;
  errors: string[];
  parsedData?: {
    documentType: string;
    issuingCountry: string;
    surname: string;
    givenName: string;
    passportNumber: string;
    nationality: string;
    birthDate: string;
    gender: string;
    expiryDate: string;
    personalNumber: string;
  };
} {
  const errors: string[] = [];

  // Check if lines have correct length
  if (line1.length !== 44) {
    errors.push(`Line 1 has incorrect length: ${line1.length}, expected 44`);
  }

  if (line2.length !== 44) {
    errors.push(`Line 2 has incorrect length: ${line2.length}, expected 44`);
  }

  // If lines don't have correct length, we can't parse the data
  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  // Parse data from MRZ
  const documentType = line1.substring(0, 1);
  const issuingCountry = line1.substring(2, 5);

  // Parse name (split by "<<")
  const nameField = line1.substring(5);
  const nameParts = nameField.split("<<");
  const surname = nameParts[0].replace(/</g, "");
  const givenName =
    nameParts.length > 1 ? nameParts[1].replace(/</g, " ").trim() : "";

  const passportNumber = line2.substring(0, 9).replace(/</g, "");
  const passportCheckDigit = line2.charAt(9);
  const nationality = line2.substring(10, 13);
  const birthDate = line2.substring(13, 19);
  const birthDateCheckDigit = line2.charAt(19);
  const gender = line2.charAt(20);
  const expiryDate = line2.substring(21, 27);
  const expiryDateCheckDigit = line2.charAt(27);
  const personalNumber = line2.substring(28, 42).replace(/</g, "");
  const personalNumberCheckDigit = line2.charAt(42);
  const finalCheckDigit = line2.charAt(43);

  // Validate check digits
  const calculatedPassportCheckDigit = calculateMRZCheckDigit(
    passportNumber.padEnd(9, "<")
  );
  if (passportCheckDigit !== calculatedPassportCheckDigit) {
    errors.push(
      `Passport number check digit is invalid: ${passportCheckDigit}, expected ${calculatedPassportCheckDigit}`
    );
  }

  const calculatedbirthDateCheckDigit = calculateMRZCheckDigit(birthDate);
  if (birthDateCheckDigit !== calculatedbirthDateCheckDigit) {
    errors.push(
      `Date of birth check digit is invalid: ${birthDateCheckDigit}, expected ${calculatedbirthDateCheckDigit}`
    );
  }

  const calculatedExpiryDateCheckDigit = calculateMRZCheckDigit(expiryDate);
  if (expiryDateCheckDigit !== calculatedExpiryDateCheckDigit) {
    errors.push(
      `Expiry date check digit is invalid: ${expiryDateCheckDigit}, expected ${calculatedExpiryDateCheckDigit}`
    );
  }

  const formattedPersonalNumber = personalNumber.padEnd(14, "<");
  const calculatedPersonalNumberCheckDigit = calculateMRZCheckDigit(
    formattedPersonalNumber
  );
  if (personalNumberCheckDigit !== calculatedPersonalNumberCheckDigit) {
    errors.push(
      `Personal number check digit is invalid: ${personalNumberCheckDigit}, expected ${calculatedPersonalNumberCheckDigit}`
    );
  }

  const dataForFinalCheck = line2.substring(0, 43);
  const calculatedFinalCheckDigit = calculateMRZCheckDigit(dataForFinalCheck);
  if (finalCheckDigit !== calculatedFinalCheckDigit) {
    errors.push(
      `Final check digit is invalid: ${finalCheckDigit}, expected ${calculatedFinalCheckDigit}`
    );
  }

  // Return validation result
  return {
    isValid: errors.length === 0,
    errors,
    parsedData: {
      documentType,
      issuingCountry,
      surname,
      givenName,
      passportNumber,
      nationality,
      birthDate,
      gender,
      expiryDate,
      personalNumber,
    },
  };
}

/**
 * Parses an MRZ and extracts the data
 *
 * @param line1 - The first line of the MRZ
 * @param line2 - The second line of the MRZ
 * @returns The parsed data or null if invalid
 */
export function parseMRZ(line1: string, line2: string) {
  const validation = validateMRZ(line1, line2);

  if (!validation.isValid) {
    return null;
  }

  return validation.parsedData;
}

/**
 * Generates a complete MRZ string (both lines) from passport data
 *
 * @param data - The passport data
 * @returns The complete MRZ string (both lines separated by a newline)
 */
export function generateMRZString(data: PassportData): string {
  const { line1, line2 } = generatePassportMRZ(data);
  return `${line1}\n${line2}`;
}
