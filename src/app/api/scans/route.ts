import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSiteName, normalizeUrl } from "@/lib/scan-simulator";

export const dynamic = "force-dynamic";

export async function GET() {
  const scans = await prisma.scan.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      findings: true,
      vitals: true,
      pages: true,
    },
  });

  return NextResponse.json({
    scans,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const normalizedUrl = normalizeUrl(String(body.url ?? ""));

    const scan = await prisma.scan.create({
      data: {
        url: normalizedUrl,
        site: getSiteName(normalizedUrl),
        status: "running",
        progress: 3,
        scopeType: body.scopeType ?? "sitemap",
        crawlDepth: body.crawlDepth ?? "medium",
        selectedDevices: JSON.stringify(body.selectedDevices ?? []),
        selectedModules: JSON.stringify(body.enabledModules ?? []),
        selectedPages: JSON.stringify(body.selectedPages ?? []),
      },
    });

    return NextResponse.json(
      {
        scan,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Tarama başlatılamadı.";

    return NextResponse.json(
      {
        message,
      },
      {
        status: 400,
      },
    );
  }
}