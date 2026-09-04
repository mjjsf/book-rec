/**
 * The 393 x 852 device frame every screen in the Figma file is drawn in
 * (e.g. 283:77). On a narrow viewport it collapses to the real viewport.
 */
export function PhoneFrame({ children }: { children: React.ReactNode }) {
  return <div className="phone-frame">{children}</div>;
}
