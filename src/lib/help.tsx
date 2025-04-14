// utils/codeGenerators.js
import JsBarcode from "jsbarcode";
import QRCode from "qrcode";
import jsPDF from "jspdf";
import { format } from "date-fns";
import { generatePassportMRZ } from "./mrz-utils";
export const generateBarcode = (text: any) => {
  const canvas = document.createElement("canvas");
  JsBarcode(canvas, text, { format: "CODE128", displayValue: false });
  return <img src={canvas.toDataURL()} alt="Barcode" />;
};

export const generateQRCode = async (text: any) => {
  const dataUrl = await QRCode.toDataURL(text, {
    margin: 0,
    // color: {
    //   dark: "#000000",
    //   light: "#0000",
    // },
  });

  return dataUrl;
};

export const generateBarcodeUrl = (text: string) => {
  const canvas = document.createElement("canvas");
  JsBarcode(canvas, text, {
    format: "CODE128",
    height: 80,
    width: 4,
    background: "transparent",
  });
  return canvas.toDataURL("image/png");
};

const formatDualLangDate = (date: Date): string => {
  const monthsEN = [
    "JAN",
    "FEB",
    "MAR",
    "APR",
    "MAY",
    "JUN",
    "JUL",
    "AUG",
    "SEP",
    "OCT",
    "NOV",
    "DEC",
  ];
  const monthsFR = [
    "JANV",
    "FÉVR",
    "MARS",
    "AVR",
    "MAI",
    "JUIN",
    "JUIL",
    "AOÛT",
    "SEPT",
    "OCT",
    "NOV",
    "DÉC",
  ];

  const day = String(date.getDate()).padStart(2, "0");
  const monthIndex = date.getMonth();
  const year = date.getFullYear();

  return `${day} ${monthsEN[monthIndex]} /${monthsFR[monthIndex]} ${year}`;
};

export const generateCardFronts = async (rider: any) => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) return null;

  const width = 1400;
  const height = 880;
  canvas.width = width;
  canvas.height = height;

  // Draw background image
  const background = new Image();
  background.crossOrigin = "anonymous";
  background.src = "/idcardfrontbg.jpg";
  await new Promise((resolve) => {
    background.onload = () => {
      ctx.drawImage(background, 0, 0, width, height);
      resolve(null);
    };
  });

  // Add title

  ctx.fillStyle = "black";
  ctx.font = "bold 40px Arial";
  ctx.fillText(rider?.surname?.toUpperCase(), 400, 330);

  ctx.fillStyle = "black";
  ctx.font = "bold 40px Arial";
  ctx.fillText(rider?.givenName?.toUpperCase(), 410, 444);

  // middle name
  if (rider?.middleName) {
    ctx.fillStyle = "black";
    ctx.font = "bold 40px Arial";
    ctx.fillText(rider?.middleName?.toUpperCase(), 410, 570);
  }

  // SEX

  ctx.fillStyle = "black";
  ctx.font = "bold 40px Arial";
  ctx.fillText(rider?.gender?.toUpperCase(), 410, 690);

  // DoB
  if (rider?.dateOfBirth) {
    ctx.fillStyle = "black";
    ctx.font = "bold 40px Arial";
    ctx.fillText(format(new Date(rider?.dateOfBirth), "dd/MM/yyyy"), 840, 450);
  }

  // Dir

  ctx.fillStyle = "black";
  ctx.font = "bold 30px Arial";
  ctx.fillText(rider?.district?.toUpperCase(), 405, 840);

  // park
  ctx.fillStyle = "black";
  ctx.font = "bold 40px Arial";
  ctx.fillText(rider?.park?.toUpperCase(), 840, 575);

  // Expir

  ctx.fillStyle = "black";
  ctx.font = "bold  40px Arial";
  ctx.fillText("DEC. 2025", 830, 840);

  // Add barcode ID text
  ctx.fillStyle = "black";
  ctx.font = "bold 40px Arial";
  ctx.fillText(rider?.id?.toUpperCase(), 830, 700);

  // Generate and draw QR code
  if (rider?.id || rider?.firstName || rider?.park) {
    const qrCodeData = await generateQRCode(rider?.id);
    const qrCode = new Image();
    qrCode.crossOrigin = "anonymous";
    qrCode.src = qrCodeData;
    await new Promise((resolve) => {
      qrCode.onload = () => {
        const qrSize = 170;
        ctx.drawImage(qrCode, 1150, 680, qrSize, qrSize);
        resolve(null);
      };
    });
  }

  if (rider?.photo) {
    // Add student's photo with aspect ratio preserved
    const photo = new Image();
    photo.crossOrigin = "anonymous";
    photo.src = rider.photo;
    await new Promise((resolve) => {
      photo.onload = () => {
        const x = 60; // X coordinate
        const y = 250; // Y coordinate
        const width = 300; // Width of the bounding box
        const height = 350; // Height of the bounding box
        const borderRadius = 20; // Radius for rounded corners

        // Calculate the scaling and positioning to simulate "object-fit: cover"
        const imageAspectRatio = photo.width / photo.height;
        const boxAspectRatio = width / height;
        let drawWidth, drawHeight, offsetX, offsetY;

        if (imageAspectRatio > boxAspectRatio) {
          // Image is wider than the box
          drawHeight = height;
          drawWidth = height * imageAspectRatio;
          offsetX = (width - drawWidth) / 2;
          offsetY = 0;
        } else {
          // Image is taller than or equal to the box
          drawWidth = width;
          drawHeight = width / imageAspectRatio;
          offsetX = 0;
          offsetY = 0;
        }

        ctx.save();

        // Create a rounded rectangle path
        ctx.beginPath();
        ctx.moveTo(x + borderRadius, y);
        ctx.lineTo(x + width - borderRadius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + borderRadius);
        ctx.lineTo(x + width, y + height - borderRadius);
        ctx.quadraticCurveTo(
          x + width,
          y + height,
          x + width - borderRadius,
          y + height
        );
        ctx.lineTo(x + borderRadius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - borderRadius);
        ctx.lineTo(x, y + borderRadius);
        ctx.quadraticCurveTo(x, y, x + borderRadius, y);
        ctx.closePath();
        ctx.clip();

        ctx.drawImage(photo, offsetX + x, offsetY + y, drawWidth, drawHeight);

        // Restore the original state
        ctx.restore();

        resolve(null);
      };
    });

    // Add watermark photo
    ctx.globalAlpha = 0.3;
    const watermarkWidth = 156;
    const watermarkHeight = 160;

    // Calculate the center of the watermark
    const centerX = 1200 + watermarkWidth / 2;
    const centerY = 220 + watermarkHeight / 2;
    const radius = watermarkWidth / 2;

    // Begin a new path and create a circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.closePath();

    // Set the clipping region to the circle
    ctx.clip();

    // Draw the watermark within the circular clip
    ctx.drawImage(photo, 1200, 220, watermarkWidth, watermarkHeight);

    ctx.globalAlpha = 1.0;
  }
  return canvas.toDataURL("image/png");
};

export const generateCardBack = async (student: any) => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) return null;

  const width = 1400;
  const height = 880;
  canvas.width = width;
  canvas.height = height;

  // Draw background
  const background = new Image();
  background.src = "/idback.jpg";
  await new Promise((resolve) => {
    background.onload = () => {
      ctx.drawImage(background, 0, 0, width, height);
      resolve(null);
    };
  });
  return canvas.toDataURL("image/png");
};

export const generateExCardFront = async (rider: any) => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) return null;

  const width = 880;
  const height = 1400;
  canvas.width = width;
  canvas.height = height;

  // Draw background image
  const background = new Image();
  background.crossOrigin = "anonymous";
  background.src = "/IdcardP.jpg";
  await new Promise((resolve) => {
    background.onload = () => {
      ctx.drawImage(background, 0, 0, width, height);
      resolve(null);
    };
  });

  // Add title

  ctx.fillStyle = "black";
  ctx.font = "bold 30px Arial";
  ctx.fillText(rider?.surName?.toUpperCase(), 35, 920);

  ctx.fillStyle = "black";
  ctx.font = "bold 30px Arial";
  ctx.fillText(rider?.firstName?.toUpperCase(), 430, 920);

  // middle name
  if (rider?.middleName) {
    ctx.fillStyle = "black";
    ctx.font = "bold 30px Arial";
    ctx.fillText(rider?.middleName?.toUpperCase(), 35, 1030);
  }

  // SEX

  ctx.fillStyle = "black";
  ctx.font = "bold 30px Arial";
  ctx.fillText(rider?.sex?.toUpperCase(), 430, 1020);

  // DoB
  if (rider?.dateOfBirth) {
    ctx.fillStyle = "black";
    ctx.font = "bold 30px Arial";
    ctx.fillText(format(new Date(rider?.dateOfBirth), "dd/MM/yyyy"), 430, 1125);
  }

  // Dir

  ctx.fillStyle = "black";
  ctx.font = "bold 30px Arial";
  ctx.fillText(rider?.designation?.toUpperCase(), 35, 1130);

  // park
  // ctx.fillStyle = "black";
  // ctx.font = "bold 30px Arial";
  // ctx.fillText(rider?.park?.toUpperCase(), 840, 575);

  // Expir

  ctx.fillStyle = "black";
  ctx.font = "bold  30px Arial";
  ctx.fillText("DEC. 2025", 40, 1240);

  // Add barcode ID text
  ctx.fillStyle = "black";
  ctx.font = "bold 30px Arial";
  ctx.fillText(rider?.id?.toUpperCase(), 430, 1240);

  // Generate and draw QR code
  if (rider?.id || rider?.firstName || rider?.park) {
    const qrCodeData = await generateQRCode(rider?.id);
    const qrCode = new Image();
    qrCode.crossOrigin = "anonymous";
    qrCode.src = qrCodeData;
    await new Promise((resolve) => {
      qrCode.onload = () => {
        const qrSize = 150;
        ctx.drawImage(qrCode, 680, 1100, qrSize, qrSize);
        resolve(null);
      };
    });
  }

  if (rider?.photo) {
    // Add student's photo with aspect ratio preserved
    const photo = new Image();
    photo.crossOrigin = "anonymous";
    photo.src = rider.photo;
    await new Promise((resolve) => {
      photo.onload = () => {
        const x = 310; // X coordinate
        const y = 460; // Y coordinate
        const width = 350; // Width of the bounding box
        const height = 350; // Height of the bounding box
        const borderRadius = 20; // Radius for rounded corners

        // Calculate the scaling and positioning to simulate "object-fit: cover"
        const imageAspectRatio = photo.width / photo.height;
        const boxAspectRatio = width / height;
        let drawWidth, drawHeight, offsetX, offsetY;

        if (imageAspectRatio > boxAspectRatio) {
          // Image is wider than the box
          drawHeight = height;
          drawWidth = height * imageAspectRatio;
          offsetX = (width - drawWidth) / 2;
          offsetY = 0;
        } else {
          // Image is taller than or equal to the box
          drawWidth = width;
          drawHeight = width / imageAspectRatio;
          offsetX = 0;
          offsetY = 0;
        }

        ctx.save();

        // Create a rounded rectangle path
        ctx.beginPath();
        ctx.moveTo(x + borderRadius, y);
        ctx.lineTo(x + width - borderRadius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + borderRadius);
        ctx.lineTo(x + width, y + height - borderRadius);
        ctx.quadraticCurveTo(
          x + width,
          y + height,
          x + width - borderRadius,
          y + height
        );
        ctx.lineTo(x + borderRadius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - borderRadius);
        ctx.lineTo(x, y + borderRadius);
        ctx.quadraticCurveTo(x, y, x + borderRadius, y);
        ctx.closePath();
        ctx.clip();

        ctx.drawImage(photo, offsetX + x, offsetY + y, drawWidth, drawHeight);

        // Restore the original state
        ctx.restore();

        resolve(null);
      };
    });

    // Add watermark photo
    ctx.globalAlpha = 0.3;
    const watermarkWidth = 156;
    const watermarkHeight = 160;

    // Calculate the center of the watermark
    const centerX = 60 + watermarkWidth / 2;
    const centerY = 420 + watermarkHeight / 2;
    const radius = watermarkWidth / 2;

    // Begin a new path and create a circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.closePath();

    // Set the clipping region to the circle
    ctx.clip();

    // Draw the watermark within the circular clip
    ctx.drawImage(photo, 60, 420, watermarkWidth, watermarkHeight);

    ctx.globalAlpha = 1.0;
  }
  return canvas.toDataURL("image/png");
};
export const generateExCardBack = async (student: any) => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) return null;

  const width = 1400;
  const height = 880;
  canvas.width = width;
  canvas.height = height;

  // Draw background
  const background = new Image();
  background.src = "/pback.jpg";
  await new Promise((resolve) => {
    background.onload = () => {
      ctx.drawImage(background, 0, 0, width, height);
      resolve(null);
    };
  });
  return canvas.toDataURL("image/png");
};

const now = new Date();
const timestamp =
  now.getFullYear() +
  "-" +
  (now.getMonth() + 1).toString().padStart(2, "0") +
  "-" +
  now.getDate().toString().padStart(2, "0") +
  "_" +
  now.getHours().toString().padStart(2, "0") +
  "-" +
  now.getMinutes().toString().padStart(2, "0") +
  "-" +
  now.getSeconds().toString().padStart(2, "0");

export const resizeImage = (
  file: File,
  maxWidth: number,
  maxHeight: number
) => {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          reject("Could not get canvas context");
          return;
        }

        // Calculate new dimensions
        let { width, height } = img;
        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          } else {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        // Convert canvas to a base64 string
        resolve(canvas.toDataURL("image/png"));
      };

      img.onerror = (err) => reject(err);
    };

    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
};

export const dataURLtoBlob = async (url: string): Promise<Blob> => {
  if (url.startsWith("data:")) {
    // It's a data URL, decode it manually
    const parts = url.split(",");
    const mimeMatch = parts[0].match(/:(.*?);/);
    if (!mimeMatch) throw new Error("Invalid data URL");

    const mime = mimeMatch[1];
    const binary = atob(parts[1]);
    const len = binary.length;
    const bytes = new Uint8Array(len);

    for (let i = 0; i < len; i++) {
      bytes[i] = binary.charCodeAt(i);
    }

    return new Blob([bytes], { type: mime });
  } else if (url.startsWith("blob:")) {
    // It's a Blob URL, fetch it
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch blob URL");
    return await response.blob();
  } else {
    throw new Error("Unsupported URL type");
  }
};

function formatDate(dateString: string): string {
  if (!dateString) return "";

  try {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = date
      .toLocaleString("en-US", { month: "short" })
      .toUpperCase();
    const year = date.getFullYear();

    return `${day} ${month} / ${day} ${month.slice(0, 3)}. ${year}`;
  } catch (error) {
    return dateString;
  }
}

// finctions
// passport generate

// Constants
const CANVAS_WIDTH = 1476;
const CANVAS_HEIGHT = 1040;

const FONTS = {
  HEADING: "bold 50px Helvetica",
  LABEL: "bold 18px Arial",
  VALUE: "bold 35px Consolas",
};

const COLORS = {
  TEXT: "black",
};

// Helpers
const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.src = src;
  });
};

const drawTextWithSpacing = (
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  spacing: number,
  font: string,
  color: string
) => {
  ctx.font = font;
  ctx.fillStyle = color;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    ctx.fillText(char, x, y);
    x += ctx.measureText(char).width + spacing;
  }
};

const drawLabelAndValue = (
  ctx: CanvasRenderingContext2D,
  label: string,
  value: string,
  x: number,
  y: number
) => {
  ctx.font = FONTS.LABEL;
  ctx.fillStyle = COLORS.TEXT;
  ctx.fillText(label.toUpperCase(), x, y);

  drawTextWithSpacing(
    ctx,
    value.toUpperCase(),
    x,
    y + 40,
    8,
    FONTS.VALUE,
    COLORS.TEXT
  );
};

const drawRoundedImage = (
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number
) => {
  const imgRatio = img.width / img.height;
  const boxRatio = w / h;

  let drawW: number, drawH: number, offsetX: number, offsetY: number;

  if (imgRatio > boxRatio) {
    drawH = h;
    drawW = h * imgRatio;
    offsetX = (w - drawW) / 2;
    offsetY = 0;
  } else {
    drawW = w;
    drawH = w / imgRatio;
    offsetX = 0;
    offsetY = 0;
  }

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + w, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y);
  ctx.lineTo(x + w, y);
  ctx.quadraticCurveTo(x + w, y + h, x + w, y + h);
  ctx.lineTo(x, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h);
  ctx.lineTo(x, y);
  ctx.quadraticCurveTo(x, y, x, y);
  ctx.closePath();
  ctx.clip();

  ctx.drawImage(img, offsetX + x, offsetY + y, drawW, drawH);
  ctx.restore();
};

const drawMRZLine = (
  ctx: CanvasRenderingContext2D,
  text: string,
  y: number,
  startX: number,
  endX: number,
  font: string,
  color: string
) => {
  ctx.font = font;
  ctx.fillStyle = color;

  const totalWidth = endX - startX;
  const charWidths = [...text].map((char) => ctx.measureText(char).width);
  const totalCharWidth = charWidths.reduce((a, b) => a + b, 0);
  const spacing = (totalWidth - totalCharWidth) / (text.length - 1);

  let x = startX;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    ctx.fillText(char, x, y);
    x += charWidths[i] + spacing;
  }
};

// Main
export const generateCardFront = async (
  passport: any
): Promise<string | null> => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;

  // Load assets
  const [background, photo, signature, issuingSignature] = await Promise.all([
    loadImage("/passbg.png"),
    passport?.photo ? loadImage(passport.photo) : null,
    passport?.signature ? loadImage(passport.signature) : null,
    loadImage("/sign.png"),
  ]);

  // Draw background
  ctx.drawImage(background, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Draw watermark photo (faded, right side)
  if (photo) {
    ctx.globalAlpha = 0.5;
    ctx.drawImage(photo, 1000, 200, 300, 330);
    ctx.globalAlpha = 1.0;
  }

  // Heading
  if (passport?.passportType === "PD") {
    ctx.font = "bold 40px Helvetica";
    ctx.fillStyle = COLORS.TEXT;
    ctx.fillText("DIPLOMATIC PASSPORT", CANVAS_WIDTH / 2 - 220, 80);
  }

  if (passport?.passportType === "PC") {
    ctx.font = FONTS.HEADING;
  }
  ctx.fillStyle = COLORS.TEXT;
  ctx.fillText("REPUBLIC OF THE GAMBIA", CANVAS_WIDTH / 2 - 270, 130);

  ctx.font = FONTS.LABEL;
  ctx.fillText("PASSPORT - PASSEPORT", 150, 180);

  // Draw passport fields
  drawLabelAndValue(ctx, "TYPE - TYPE", passport?.type || "PC", 500, 180);
  drawLabelAndValue(ctx, "COUNTRY - PAYS", "GMB", 700, 180);
  drawLabelAndValue(
    ctx,
    "PASSPORT NO. - NO DU PASSEPORT",
    passport?.passportNumber || "",
    1000,
    180
  );
  drawLabelAndValue(
    ctx,
    "PLACE OF BIRTH - LIEU DE NAISSANCE",
    passport?.placeOfBirth || "",
    1000,
    250
  );
  drawLabelAndValue(ctx, "SURNAME - NOM", passport?.surname || "", 500, 250);
  drawLabelAndValue(
    ctx,
    "GIVEN NAME(S) - PRÉNOM(S)",
    passport?.givenName || "",
    500,
    320
  );
  drawLabelAndValue(
    ctx,
    "NATIONALITY - NATIONALITÉ",
    passport?.nationality || "",
    500,
    390
  );

  drawLabelAndValue(
    ctx,
    "DATE OF BIRTH - DATE DE NAISSANCE",
    formatDualLangDate(new Date(passport?.birthDate)),
    500,
    460
  );
  drawLabelAndValue(ctx, "SEX - SEXE", passport?.gender || "", 500, 530);
  drawLabelAndValue(
    ctx,
    "DATE OF ISSUE - DATE DE DÉLIVRANCE",
    formatDualLangDate(new Date(passport?.issueDate)),
    500,
    600
  );
  drawLabelAndValue(
    ctx,
    "DATE OF EXPIRY - DATE D'EXPIRATION",
    formatDualLangDate(new Date(passport?.expiryDate)),
    500,
    670
  );

  if (passport?.passportType === "PD") {
    drawLabelAndValue(
      ctx,
      "MISSION - MISSION",
      passport?.mission || "",
      1000,
      460
    );
  }

  drawLabelAndValue(
    ctx,
    "AUTHORITY - AUTORITÉ",
    passport?.issuingAuthority || "",
    1000,
    530
  );
  // drawLabelAndValue(
  //   ctx,
  //   "ISSUING OFFICER",
  //   passport?.issuingAuthority || "",
  //   1000,
  //   600
  // );

  // drawLabelAndValue(
  //   ctx,
  //   "ISSUINGOFFICER",
  //   passport?.issuingAuthority || "",
  //   1000,
  //   600
  // );

  ctx.font = FONTS.LABEL;
  ctx.fillStyle = COLORS.TEXT;
  ctx.fillText("ISSUING OFFICER", 1000, 600);
  if (issuingSignature) {
    ctx.drawImage(issuingSignature, 1000, 580, 200, 100);
  }

  // drawLabelAndValue(
  //   ctx,
  //   "HOLDER SIGNATURE",
  //   signature && ctx.drawImage(signature, 1000, 200, 300, 330);

  //   1000,
  //   600
  // );
  ctx.font = FONTS.LABEL;
  ctx.fillStyle = COLORS.TEXT;
  ctx.fillText("HOLDER SIGNATURE", 1000, 670);
  if (signature) {
    ctx.drawImage(signature, 1000, 680, 300, 100);
  }

  // MRZ Lines
  const mrz = generatePassportMRZ(passport);
  // Use this:
  drawMRZLine(ctx, mrz.line1, 860, 40, 1436, "bold 40px Consolas", "black");

  // Same for line 2
  drawMRZLine(ctx, mrz.line2, 930, 40, 1436, "bold 40px Consolas", "black");

  // Draw main photo (left side, clipped)
  if (photo) {
    drawRoundedImage(ctx, photo, 40, 200, 420, 520);
  }

  return canvas.toDataURL("image/png");
};

export const saveBatchIDCards = async (idCards: string[]) => {
  const CARDS_PER_ROW = 2;
  const GAP = 20;
  const PADDING = 30;
  const CARD_WIDTH = CANVAS_WIDTH;
  const CARD_HEIGHT = CANVAS_HEIGHT;

  const rows = Math.ceil(idCards.length / CARDS_PER_ROW);

  const pageWidth =
    PADDING * 2 + CARDS_PER_ROW * CARD_WIDTH + (CARDS_PER_ROW - 1) * GAP;
  const pageHeight = PADDING * 2 + rows * CARD_HEIGHT + (rows - 1) * GAP;

  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "px",
    format: [pageWidth, pageHeight],
  });

  idCards.forEach((card, index) => {
    const row = Math.floor(index / CARDS_PER_ROW);
    const col = index % CARDS_PER_ROW;

    const x = PADDING + col * (CARD_WIDTH + GAP);
    const y = PADDING + row * (CARD_HEIGHT + GAP);

    pdf.addImage(card, "PNG", x, y, CARD_WIDTH, CARD_HEIGHT);
  });

  pdf.save("Batch_Passport_" + timestamp + ".pdf");
};

export const saveSingleIDCard = async (
  frontImage: string,
  passportdata: string
) => {
  const Passports = [frontImage];
  const CARDS_PER_ROW = 2;
  const GAP = 20;
  const PADDING = 30;
  const CARD_WIDTH = CANVAS_WIDTH;
  const CARD_HEIGHT = CANVAS_HEIGHT;

  const rows = Math.ceil(Passports.length / CARDS_PER_ROW);

  const pageWidth =
    PADDING * 2 + CARDS_PER_ROW * CARD_WIDTH + (CARDS_PER_ROW - 1) * GAP;
  const pageHeight = PADDING * 2 + rows * CARD_HEIGHT + (rows - 1) * GAP;

  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "px",
    format: [pageWidth, pageHeight],
  });

  Passports.forEach((card, index) => {
    const row = Math.floor(index / CARDS_PER_ROW);
    const col = index % CARDS_PER_ROW;

    const x = PADDING + col * (CARD_WIDTH + GAP);
    const y = PADDING + row * (CARD_HEIGHT + GAP);

    pdf.addImage(card, "PNG", x, y, CARD_WIDTH, CARD_HEIGHT);
  });

  pdf.save(passportdata + "Passport_Card.pdf");
};

export const printBatchIDCards = async (idCards: string[]) => {
  const CARDS_PER_ROW = 2;
  const CARDS_PER_COLUMN = 2;
  const CARDS_PER_PAGE = CARDS_PER_ROW * CARDS_PER_COLUMN;

  const GAP = 20;
  const PADDING = 30;
  const CARD_WIDTH = CANVAS_WIDTH;
  const CARD_HEIGHT = CANVAS_HEIGHT;

  const pageWidth =
    PADDING * 2 + CARDS_PER_ROW * CARD_WIDTH + (CARDS_PER_ROW - 1) * GAP;
  const pageHeight =
    PADDING * 2 + CARDS_PER_COLUMN * CARD_HEIGHT + (CARDS_PER_COLUMN - 1) * GAP;

  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "px",
    format: [pageWidth, pageHeight],
  });

  idCards.forEach((card, index) => {
    const pageIndex = Math.floor(index / CARDS_PER_PAGE);
    const indexOnPage = index % CARDS_PER_PAGE;
    const row = Math.floor(indexOnPage / CARDS_PER_ROW);
    const col = indexOnPage % CARDS_PER_ROW;

    if (index > 0 && indexOnPage === 0) {
      pdf.addPage();
    }

    const x = PADDING + col * (CARD_WIDTH + GAP);
    const y = PADDING + row * (CARD_HEIGHT + GAP);

    pdf.addImage(card, "PNG", x, y, CARD_WIDTH, CARD_HEIGHT);
  });

  const pdfBlob = pdf.output("blob");
  const pdfUrl = URL.createObjectURL(pdfBlob);
  const newWindow = window.open(pdfUrl);

  if (newWindow) {
    newWindow.onload = () => {
      newWindow.print();
    };
  }
};

export const printSingleIDCard = async (frontImage: string) => {
  const idCards = [frontImage];
  const CARDS_PER_ROW = 2;
  const CARDS_PER_COLUMN = 2;
  const CARDS_PER_PAGE = CARDS_PER_ROW * CARDS_PER_COLUMN;

  const GAP = 20;
  const PADDING = 30;
  const CARD_WIDTH = CANVAS_WIDTH;
  const CARD_HEIGHT = CANVAS_HEIGHT;

  const pageWidth =
    PADDING * 2 + CARDS_PER_ROW * CARD_WIDTH + (CARDS_PER_ROW - 1) * GAP;
  const pageHeight =
    PADDING * 2 + CARDS_PER_COLUMN * CARD_HEIGHT + (CARDS_PER_COLUMN - 1) * GAP;

  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "px",
    format: [pageWidth, pageHeight],
  });

  idCards.forEach((card, index) => {
    const pageIndex = Math.floor(index / CARDS_PER_PAGE);
    const indexOnPage = index % CARDS_PER_PAGE;
    const row = Math.floor(indexOnPage / CARDS_PER_ROW);
    const col = indexOnPage % CARDS_PER_ROW;

    if (index > 0 && indexOnPage === 0) {
      pdf.addPage();
    }

    const x = PADDING + col * (CARD_WIDTH + GAP);
    const y = PADDING + row * (CARD_HEIGHT + GAP);

    pdf.addImage(card, "PNG", x, y, CARD_WIDTH, CARD_HEIGHT);
  });

  // Open PDF in a new tab and trigger print
  const pdfBlob = pdf.output("blob");
  const pdfUrl = URL.createObjectURL(pdfBlob);
  const newWindow = window.open(pdfUrl);

  if (newWindow) {
    newWindow.onload = () => {
      newWindow.print();
      // printWindow.document.close();
      // printWindow.focus();
      // printWindow.print();
      // printWindow.close();
    };
  }
};
