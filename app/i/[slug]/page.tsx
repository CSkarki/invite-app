import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import InviteView from "@/components/InviteView";
import type { Invitation } from "@/types";

interface PublicInvitePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PublicInvitePageProps): Promise<Metadata> {
  const { slug } = await params;
  const invitation = await prisma.invitation.findFirst({
    where: { slug: slug.toLowerCase(), published: true },
    select: { eventName: true, message: true, imageUrl: true, eventDate: true },
  });
  if (!invitation) {
    return { title: "Invitation Not Found" };
  }
  const description =
    invitation.message ||
    (invitation.eventDate
      ? `You're invited to ${invitation.eventName} on ${new Date(invitation.eventDate).toLocaleDateString()}`
      : `You're invited to ${invitation.eventName}`);
  return {
    title: invitation.eventName,
    description,
    openGraph: {
      title: invitation.eventName,
      description,
      ...(invitation.imageUrl ? { images: [{ url: invitation.imageUrl }] } : {}),
    },
  };
}

export default async function PublicInvitePage({ params }: PublicInvitePageProps) {
  const { slug } = await params;
  if (!slug) notFound();
  const invitation = await prisma.invitation.findFirst({
    where: { slug: slug.toLowerCase(), published: true },
  });
  if (!invitation) notFound();
  return <InviteView invitation={invitation as unknown as Invitation} />;
}
