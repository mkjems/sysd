// Entrance motion for sysd. Load it in the <head> without defer, so the
// waiting state is in place before the first paint.
//
// Each [data-enter] section is set when it scrolls into view: its parts
// (.sysd-set, .sysd-drop, .sysd-shape and the children of
// .sysd-enter-children) are numbered in reading order, and CSS counts
// their delays in beats from that number.
{
  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!reduce && "IntersectionObserver" in window) {
    root.classList.add("sysd-motion");

    const parts = ":is(.sysd-set, .sysd-drop, .sysd-shape, .sysd-enter-children > :not(.sysd-enter-children))";

    // Sections that enter together are set one after another, six beats
    // apart. On load they also wait four beats for the construction lines.
    let firstBatch = true;

    const observer = new IntersectionObserver(
      (entries) => {
        let beats = firstBatch ? 4 : 0;
        firstBatch = false;
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          if (beats) entry.target.style.setProperty("--sysd-delay", `calc(${beats} * var(--sysd-beat))`);
          entry.target.setAttribute("data-entered", "");
          observer.unobserve(entry.target);
          beats += 6;
        }
      },
      { rootMargin: "0px 0px -12% 0px" },
    );

    document.addEventListener("DOMContentLoaded", () => {
      for (const section of document.querySelectorAll("[data-enter]")) {
        section.querySelectorAll(parts).forEach((part, i) => part.style.setProperty("--i", i + 1));
        observer.observe(section);
      }
    });
  }
}
