import Link from "next/link";
import { BottomNav } from "./BottomNav";
import { PhoneFrame } from "./PhoneFrame";

/**
 * The Figma covers the recommendation feature only; the other nav
 * destinations exist so the bar is navigable rather than dead, and say so.
 */
export function PlaceholderScreen({ title }: { title: string }) {
  return (
    <PhoneFrame>
      <div className="absolute inset-x-0 top-0 h-[102px] bg-header-sand" />
      <div className="absolute inset-x-[32px] top-[186px] flex flex-col items-center gap-[16px] text-center">
        <h1 className="font-serif text-headline leading-[1.24] text-black">{title}</h1>
        <p className="text-body leading-[1.35] text-byline/70">
          This screen is outside the scope of the book-recommendation design.
        </p>
        <Link href="/" className="text-control underline underline-offset-4">
          Back to the assistant
        </Link>
      </div>
      <BottomNav />
    </PhoneFrame>
  );
}
