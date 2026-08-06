// Logo mark rasmi KabinetCantik — bulatan corak-kayu (fail rasmi 2025).
export default function Logo({ className = "w-10 h-10" }: { className?: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src="/logo-mark.png" alt="KabinetCantik" className={`${className} object-contain`} />;
}
