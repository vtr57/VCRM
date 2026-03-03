import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function BaseIcon(props: IconProps) {
  return (
    <svg
      aria-hidden="true"
      fill="currentColor"
      focusable="false"
      height="1em"
      viewBox="0 0 24 24"
      width="1em"
      {...props}
    />
  );
}

export function UserIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm0 2c-3.33 0-6 2.24-6 5a1 1 0 0 0 2 0c0-1.57 1.83-3 4-3s4 1.43 4 3a1 1 0 0 0 2 0c0-2.76-2.67-5-6-5Z" />
    </BaseIcon>
  );
}

export function BuildingIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M5 3a2 2 0 0 0-2 2v14a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V9.41a2 2 0 0 0-.59-1.41l-4.41-4.41A2 2 0 0 0 14.59 3Zm9 2.41L18.59 10H15a1 1 0 0 1-1-1ZM7 7h2v2H7Zm0 4h2v2H7Zm0 4h2v2H7Zm4-8h2v2h-2Zm0 4h2v2h-2Zm0 4h2v2h-2Z" />
    </BaseIcon>
  );
}

export function ContactCardIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M4 5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2Zm0 2h16v10H4Zm4 2a2 2 0 1 0 2 2 2 2 0 0 0-2-2Zm5 1h5v2h-5Zm0 4h4v2h-4Zm-5 .5c1.38 0 2.5.67 2.5 1.5H5.5C5.5 15.67 6.62 15 8 15Z" />
    </BaseIcon>
  );
}

export function MoneyBagIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M9 3a1 1 0 0 0 0 2h.38l.8 1.6A7.01 7.01 0 0 0 5 13c0 4.42 3.13 8 7 8s7-3.58 7-8a7.01 7.01 0 0 0-5.18-6.4l.8-1.6H15a1 1 0 1 0 0-2Zm3 6c-1.23 0-2.28.48-3 1.14a1 1 0 0 0 1.36 1.46A2.42 2.42 0 0 1 12 11c.91 0 1.5.43 1.5.9 0 .58-.34.81-1.86 1.18C10.3 13.4 9 14.08 9 16c0 1.44 1.09 2.55 2.5 2.88V19a1 1 0 0 0 2 0v-.11c1.19-.28 2.18-1.09 2.44-2.28a1 1 0 1 0-1.96-.42c-.08.38-.53.81-1.38.81-.8 0-1.6-.46-1.6-1 0-.56.35-.8 1.73-1.14C14.98 14.27 15.5 13.2 15.5 12c0-1.42-1.03-2.57-2.5-2.91V9a1 1 0 0 0-2 0Z" />
    </BaseIcon>
  );
}

export function TrashIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M9 3a1 1 0 0 0-.95.68L7.28 6H5a1 1 0 0 0 0 2h1v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V8h1a1 1 0 1 0 0-2h-2.28l-.77-2.32A1 1 0 0 0 15 3Zm.72 3 .34-1h3.88l.34 1ZM8 8h8v10H8Zm2 2a1 1 0 0 0-1 1v5a1 1 0 1 0 2 0v-5a1 1 0 0 0-1-1Zm4 0a1 1 0 0 0-1 1v5a1 1 0 1 0 2 0v-5a1 1 0 0 0-1-1Z" />
    </BaseIcon>
  );
}
