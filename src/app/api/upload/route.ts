import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const files: File[] = data.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
    }

    const uploadedFiles: string[] = [];

    // Ensure uploads directory exists
    const uploadsDir = join(process.cwd(), "public", "uploads");
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    for (const file of files) {
      if (!file) {
        continue;
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        return NextResponse.json(
          { error: "Only image files are allowed" },
          { status: 400 }
        );
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { error: `File ${file.name} is too large (max 5MB)` },
          { status: 400 }
        );
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Generate unique filename
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const fileExtension = file.name.split(".").pop() || "jpg";
      const filename = `field-visit-${timestamp}-${randomString}.${fileExtension}`;

      // Save file
      const filepath = join(uploadsDir, filename);
      await writeFile(filepath, buffer);

      console.log(`File saved successfully: ${filepath}`);

      // Store relative path for frontend use
      uploadedFiles.push(`/uploads/${filename}`);
    }

    console.log(
      `Upload API: ${uploadedFiles.length} files uploaded successfully`
    );

    return NextResponse.json({
      success: true,
      files: uploadedFiles,
      message: `${uploadedFiles.length} file(s) uploaded successfully`,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      {
        error: "Failed to upload files",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { pathname } = await request.json();

    if (!pathname || !pathname.startsWith("/uploads/")) {
      return NextResponse.json({ error: "Invalid file path" }, { status: 400 });
    }

    const fs = await import("fs/promises");
    const filePath = join(process.cwd(), "public", pathname);

    try {
      await fs.unlink(filePath);
      console.log(`File deleted successfully: ${filePath}`);
      return NextResponse.json({
        success: true,
        message: "File deleted successfully",
      });
    } catch (error) {
      // File might not exist, which is fine
      console.log(`File not found or already deleted: ${filePath}`);
      return NextResponse.json({
        success: true,
        message: "File not found or already deleted",
      });
    }
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json(
      {
        error: "Failed to delete file",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
