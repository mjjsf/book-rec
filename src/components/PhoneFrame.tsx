"use client";

import { useEffect, useState } from "react";

/**
 * Presents the app the way the published Figma prototype does: the 393x852
 * frame (283:77) inside a phone, scaled down to fit the window.
 *
 * The prototype link carries `scaling=scale-down&content-scaling=fixed`, which
 * means two specific things:
 *  - scale-down: shrink to fit, never enlarge past 1;
 *  - content-scaling fixed: the content scales as a unit rather than reflowing.
 *
 * So this applies one transform to the whole device and never touches an
 * element size. Every coordinate transcribed from Figma stays exactly as
 * designed, at any window size.
 */

/** The Figma frame, which is also an iPhone 14/15 Pro screen. */
const SCREEN_WIDTH = 393;
const SCREEN_HEIGHT = 852;
/** Bezel thickness around the screen; keep in step with `--bezel` in the CSS. */
const BEZEL = 12;
/** Breathing room so the device never touches the window edge. */
const MARGIN = 24;

const DEVICE_WIDTH = SCREEN_WIDTH + BEZEL * 2;
const DEVICE_HEIGHT = SCREEN_HEIGHT + BEZEL * 2;

/** Below this the viewport is already phone-sized, so the chrome comes off. */
const MOBILE_BREAKPOINT = 440;

export function PhoneFrame({ children }: { children: React.ReactNode }) {
  // Start at 1 so the prerendered HTML is the unscaled design; the first
  // client effect corrects it. There is no `window` during the static export.
  const [scale, setScale] = useState(1);
  const [bare, setBare] = useState(false);

  useEffect(() => {
    const measure = () => {
      const { innerWidth, innerHeight } = window;
      if (innerWidth <= MOBILE_BREAKPOINT) {
        setBare(true);
        setScale(1);
        return;
      }
      setBare(false);
      setScale(
        Math.min(
          1,
          (innerWidth - MARGIN * 2) / DEVICE_WIDTH,
          (innerHeight - MARGIN * 2) / DEVICE_HEIGHT,
        ),
      );
    };

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  if (bare) {
    return <div className="phone-frame">{children}</div>;
  }

  return (
    // The outer box carries the *scaled* size. A transform alone does not
    // change layout size, so without this the page would still reserve the
    // full 417x876 and show scrollbars at small scales.
    <div
      style={{
        width: DEVICE_WIDTH * scale,
        height: DEVICE_HEIGHT * scale,
      }}
    >
      {/*
        * The device keeps its natural size and is scaled from its top-left
        * corner into the box above. Letting it inherit the parent's already
        * scaled width would shrink it a second time and push it out of the
        * viewport.
        */}
      <div
        className="device"
        style={{
          width: DEVICE_WIDTH,
          height: DEVICE_HEIGHT,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        <div className="phone-frame">{children}</div>
      </div>
    </div>
  );
}
