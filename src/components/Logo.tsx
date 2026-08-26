// Logo mark — default KabinetCantik; boleh override untuk tenant.
export default function Logo({
  className = "w-10 h-10",
  src = "/logo-mark.png",
  alt = "KabinetCantik",
}: {
  className?: string;
  src?: string;
  alt?: string;
}) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} className={`${className} object-contain`} />;
}
