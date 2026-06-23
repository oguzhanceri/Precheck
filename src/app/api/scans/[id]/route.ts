import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getScanWithProgress } from "@/lib/scan-simulator";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  const scan = await getScanWithProgress(id);

  if (!scan) {
    return NextResponse.json(
      {
        message: "Tarama bulunamadı.",
      },
      {
        status: 404,
      },
    );
  }

  return NextResponse.json({
    scan,
  });
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const body = await request.json();

  const scan = await prisma.scan.update({
    where: {
      id,
    },
    data: {
      ...(typeof body.status === "string" ? { status: body.status } : {}),
      ...(typeof body.progress === "number" ? { progress: body.progress } : {}),
      ...(body.status === "cancelled" ? { completedAt: new Date() } : {}),
    },
    include: {
      findings: true,
      vitals: true,
      pages: true,
    },
  });

  return NextResponse.json({
    scan,
  });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  await prisma.scan.delete({
    where: {
      id,
    },
  });

  return NextResponse.json({
    ok: true,
  });
}