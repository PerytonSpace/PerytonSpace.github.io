import type { ReactNode } from "react";

/** Pictorial section icons for the collapsed nav rail. */

type IconProps = {
  className?: string;
};

function iconProps(className?: string) {
  return {
    className,
    width: 24,
    height: 24,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.75,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    focusable: false,
  };
}

function HomeIcon({ className }: IconProps) {
  return (
    <svg {...iconProps(className)}>
      <path d="M4 10.8 12 4l8 6.8V20a1 1 0 0 1-1 1h-5.2v-6.2H9.2V21H5a1 1 0 0 1-1-1z" />
    </svg>
  );
}

function LaunchIcon({ className }: IconProps) {
  return (
    <svg {...iconProps(className)}>
      <path d="M14.2 3.8c1.8 1.1 4.6 4.3 4.2 7.4-.3 2.2-2 3.7-3.4 4.6l-2.2-2.2" />
      <path d="M9.8 20.2c-1.8-1.1-4.6-4.3-4.2-7.4.3-2.2 2-3.7 3.4-4.6l2.2 2.2" />
      <path d="m9.6 14.4 4.8-4.8" />
      <path d="M8.2 17.6 6 21" />
      <path d="M14.8 6.8 18 4.2" />
      <circle cx="13.6" cy="8.2" r="1.05" />
    </svg>
  );
}

function MissionsIcon({ className }: IconProps) {
  return (
    <svg {...iconProps(className)}>
      <circle cx="12" cy="12" r="4.1" />
      <ellipse
        cx="12"
        cy="12"
        rx="9.2"
        ry="3.35"
        transform="rotate(-28 12 12)"
      />
    </svg>
  );
}

function StagWorksIcon({ className }: IconProps) {
  return (
    <svg {...iconProps(className)}>
      <path d="M15.2 4.6a3.3 3.3 0 0 0-4.5 4.5L4.8 14.9a2 2 0 0 0 2.8 2.8l5.8-5.9a3.3 3.3 0 0 0 4.5-4.5L15.4 9.8l-2.7-2.7z" />
    </svg>
  );
}

function TeamIcon({ className }: IconProps) {
  return (
    <svg {...iconProps(className)}>
      <circle cx="9" cy="8.2" r="2.4" />
      <path d="M4.4 18.6v-1.1c0-2.4 2-4.1 4.6-4.1s4.6 1.7 4.6 4.1v1.1" />
      <circle cx="16.2" cy="8.6" r="2" />
      <path d="M19.8 18.6v-.8c0-1.9-1.5-3.3-3.6-3.3-.5 0-1 .1-1.4.2" />
    </svg>
  );
}

function AboutIcon({ className }: IconProps) {
  return (
    <svg {...iconProps(className)}>
      <circle cx="12" cy="12" r="8.2" />
      <path d="M12 11.2v5.2" />
      <circle cx="12" cy="8.2" r="0.7" fill="currentColor" stroke="none" />
    </svg>
  );
}

function MemberIcon({ className }: IconProps) {
  return (
    <svg {...iconProps(className)}>
      <rect x="3.6" y="6.2" width="16.8" height="11.6" rx="1.4" />
      <circle cx="9" cy="11.4" r="1.8" />
      <path d="M6.6 15.4c.4-1.2 1.3-1.8 2.4-1.8s2 .6 2.4 1.8" />
      <path d="M13.4 10.4h4.4M13.4 13.2h3.2" />
    </svg>
  );
}

function ContactIcon({ className }: IconProps) {
  return (
    <svg {...iconProps(className)}>
      <rect x="3.5" y="6" width="17" height="12" rx="1.4" />
      <path d="m4.2 7.4 7.8 5.4 7.8-5.4" />
    </svg>
  );
}

const ICONS: Record<string, (props: IconProps) => ReactNode> = {
  Home: HomeIcon,
  Launch: LaunchIcon,
  Missions: MissionsIcon,
  StagWorks: StagWorksIcon,
  "Our Team": TeamIcon,
  About: AboutIcon,
  "Member Zone": MemberIcon,
  Contact: ContactIcon,
};

export function NavIcon({ label }: { label: string }) {
  const Icon = ICONS[label];
  if (!Icon) return null;
  return <Icon />;
}
