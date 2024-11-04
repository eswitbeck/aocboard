import { twMerge } from 'tailwind-merge';

export default function Stars({
  stars
}: {
  stars: {
    star_1: boolean,
    star_2: boolean
  }
}) {
  return (
    <div className="flex items-end gap-2 ml-8">
      <span className={twMerge(
        "text-3xl",
        stars.star_1
          ? "hue-rotate-90 brightness-125 grayscale"
          : "filter brightness-50 contrast-200 grayscale"
      )}>
        ⭐
      </span>
      <span className={twMerge(
        "text-3xl",
        stars.star_2
          ? "hue-rotate-45 brightness-110"
          : "filter brightness-50 contrast-200 grayscale"
      )}>
        ⭐
      </span>
    </div>
  );
}
