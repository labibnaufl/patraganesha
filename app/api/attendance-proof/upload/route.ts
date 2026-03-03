import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { uploadProofImage } from "@/lib/cloudinary";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file || file.size === 0) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Format tidak didukung. Gunakan JPG, PNG, atau WebP." },
        { status: 400 },
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "Ukuran file terlalu besar. Maksimal 5MB." },
        { status: 400 },
      );
    }

    const result = await uploadProofImage(file, "patra/attendance-proofs");
    return NextResponse.json(result);
  } catch (error) {
    console.error("Proof upload error:", error);
    return NextResponse.json(
      { error: "Gagal mengunggah foto bukti." },
      { status: 500 },
    );
  }
}
