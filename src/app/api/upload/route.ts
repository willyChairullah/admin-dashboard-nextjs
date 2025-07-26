import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { IncomingForm, File } from "formidable";

// Disable the default body parser
export const config = {
  api: {
    bodyParser: false,
  },
};

// Ensure the upload directory exists
const uploadDir = path.join(process.cwd(), "public/uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Handle file upload (POST)
export async function POST(req: NextRequest) {
  const form = new IncomingForm({
    multiples: true,
    uploadDir,
    keepExtensions: true,
    filename: (name, ext, part) => `${Date.now()}-${part.originalFilename}`,
  });

  return new Promise((resolve) => {
    form.parse(req as any, (err, fields, files) => {
      if (err) {
        console.error("Upload error:", err);
        return resolve(
          NextResponse.json(
            { success: false, error: "Upload failed" },
            { status: 500 }
          )
        );
      }

      const uploadedFiles = Object.values(files).flat() as File[];

      const urls = uploadedFiles.map((file) => {
        const relativePath = `/uploads/${path.basename(file.filepath)}`;
        return relativePath;
      });

      resolve(
        NextResponse.json({ success: true, files: urls }, { status: 200 })
      );
    });
  });
}

// Handle file deletion (DELETE)
export async function DELETE(req: NextRequest) {
  const { pathname } = await req.json();

  if (!pathname) {
    return NextResponse.json(
      { success: false, error: "No file path provided" },
      { status: 400 }
    );
  }

  const filePath = path.join(
    process.cwd(),
    "public",
    pathname.replace(/^\/+/, "")
  );

  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { success: false, error: "File not found" },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete file" },
      { status: 500 }
    );
  }
}
