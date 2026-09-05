/**
 * A template, unlike a layout, remounts on every navigation — which is exactly
 * what a transition needs. It sits inside the layout, so the device frame above
 * it stays perfectly still while only the screen content cross-fades.
 */
export default function ScreenTransition({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="screen-enter size-full">{children}</div>;
}
