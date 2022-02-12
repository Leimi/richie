interface IconProps {
  name: Icon;
  /**
   * Optional title, will be announced by screen readers
   * and set as `title` attribute for mouse users
   *
   * If omitted, the icon is considered decorative and
   * ignored by screen readers
   */
  title?: string;
}

export const Icon = ({ name, title }: IconProps) => {
  const attributes = {
    className: "icon",
    ...(title
      ? {
        role: "img",
        ["aria-label"]: title,
        title
      }
      : {
        ["aria-hidden"]: true
      }
    )
  }

  return (
    <svg {...attributes}>
      <use href={`#${name}`} />
    </svg>
  );
};


// icons from src/richie/apps/core/templates/richie/icons.html
type Icon =
  "icon-calendar" |
  "icon-barcode" |
  "icon-chevron-down" |
  "icon-clock" |
  "icon-pace" |
  "icon-duration" |
  "icon-cross" |
  "icon-envelope" |
  "icon-facebook" |
  "icon-filter" |
  "icon-linkedin" |
  "icon-login" |
  "icon-magnifying-glass" |
  "icon-org" |
  "icon-quote" |
  "icon-search-fail" |
  "icon-stopwatch" |
  "icon-twitter" |
  "icon-arrow-right" |
  "icon-check" |
  "icon-info-rounded" |
  "icon-warning"
