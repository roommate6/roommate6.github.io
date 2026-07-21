function renderMedia(mediaPath) {
  const extension = (mediaPath.split(".").pop() || "").toLowerCase();
  const fileName = mediaPath.split("/").pop() || "media";

  const isVideo = ["mp4", "webm", "ogg"].includes(extension);
  const isImage = ["png", "jpg", "jpeg", "gif", "svg", "webp"].includes(
    extension,
  );

  if (isVideo) {
    return `
      <a class="project-media-link" href="${mediaPath}" target="_blank" rel="noopener noreferrer">
        <video class="project-media" src="${mediaPath}" controls preload="metadata"></video>
      </a>
    `;
  }

  if (isImage) {
    return `
      <a class="project-media-link" href="${mediaPath}" target="_blank" rel="noopener noreferrer">
        <img class="project-media" src="${mediaPath}" alt="${fileName}" />
      </a>
    `;
  }

  return `
    <a class="project-media-link" href="${mediaPath}" target="_blank" rel="noopener noreferrer">
      <div class="project-media project-media-fallback">${fileName}</div>
    </a>
  `;
}

function formatDescription(description) {
  if (!description) {
    return "";
  }

  const escaped = String(description)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  const withLinks = escaped.replace(
    /(https?:\/\/[^\s]+)/g,
    '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>',
  );

  const paragraphs = withLinks
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return paragraphs
    .map((paragraph) => {
      const lines = paragraph
        .split(/\n/)
        .map((line) => line.trim())
        .filter(Boolean);

      const htmlLines = lines.map((line) => {
        const trimmed = line.trim();

        if (/^#{1,2}\s+/.test(trimmed)) {
          const level = trimmed.match(/^#{1,2}/)[0].length;
          const text = trimmed.replace(/^#{1,2}\s+/, "");
          const headingTag = level === 1 ? "h1" : "h2";
          return `<${headingTag}>${text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")}</${headingTag}>`;
        }

        if (trimmed.startsWith("- ")) {
          return `<li>${trimmed.slice(2).replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")}</li>`;
        }

        return `<p>${trimmed.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")}</p>`;
      });

      if (htmlLines.some((line) => line.startsWith("<li>"))) {
        return `<ul class="project-description-list">${htmlLines.join("")}</ul>`;
      }

      return htmlLines.join("");
    })
    .join("");
}

async function buildDirectoryMediaPaths(directoryPath) {
  if (typeof directoryPath !== "string" || directoryPath.trim() === "") {
    return [];
  }

  const normalizedDirectory = directoryPath.replace(/\/+$/, "");
  const manifestUrl = `${normalizedDirectory}/media.json`;

  try {
    const response = await fetch(manifestUrl, { cache: "no-store" });
    if (!response.ok) {
      return [];
    }

    const files = await response.json();
    if (!Array.isArray(files)) {
      return [];
    }

    return files
      .filter((file) => typeof file === "string" && file.trim() !== "")
      .map((file) => `${normalizedDirectory}/${file.replace(/^\/+/, "")}`);
  } catch (error) {
    return [];
  }
}

function initProjectMediaCarousels() {
  document.querySelectorAll(".project-media-carousel").forEach((carousel) => {
    const track = carousel.querySelector(".project-media-track");
    const slides = carousel.querySelectorAll(".project-media-slide");
    const prevButton = carousel.querySelector(".project-media-button.prev");
    const nextButton = carousel.querySelector(".project-media-button.next");

    if (!track || slides.length <= 3) {
      if (prevButton) prevButton.style.display = "none";
      if (nextButton) nextButton.style.display = "none";
      return;
    }

    let pageIndex = 0;
    const pageSize = 3;
    const maxPageIndex = Math.max(0, Math.ceil(slides.length / pageSize) - 1);

    const updateCarousel = () => {
      track.style.transform = `translateX(-${pageIndex * 100}%)`;

      if (prevButton) {
        prevButton.disabled = pageIndex === 0;
        prevButton.classList.toggle("is-disabled", pageIndex === 0);
      }

      if (nextButton) {
        nextButton.disabled = pageIndex >= maxPageIndex;
        nextButton.classList.toggle("is-disabled", pageIndex >= maxPageIndex);
      }
    };

    prevButton?.addEventListener("click", () => {
      if (pageIndex > 0) {
        pageIndex -= 1;
        updateCarousel();
      }
    });

    nextButton?.addEventListener("click", () => {
      if (pageIndex < maxPageIndex) {
        pageIndex += 1;
        updateCarousel();
      }
    });

    updateCarousel();
  });
}

async function renderProjects(htmlProjectsListElement, projects) {
  const cards = await Promise.all(
    projects.map(async (project) => {
      let normalizedMedias = [];
      if (project.pathToMediaFolder) {
        normalizedMedias = await buildDirectoryMediaPaths(
          project.pathToMediaFolder,
        );
      }
      if (project.medias) {
        normalizedMedias = [
          ...new Set([...normalizedMedias, ...project.medias]),
        ];
      }

      const mediasMarkup =
        normalizedMedias && normalizedMedias.length > 0
          ? `
            <div class="project-media-carousel">
              <div class="project-media-viewport">
                <div class="project-media-track">
                  ${normalizedMedias
                    .map(
                      (mediaPath) => `
                        <div class="project-media-slide">
                          ${renderMedia(mediaPath)}
                        </div>
                      `,
                    )
                    .join("")}
                </div>
              </div>
              <div class="project-media-controls">
                <button class="project-media-button prev" type="button" aria-label="Previous media">‹</button>
                <button class="project-media-button next" type="button" aria-label="Next media">›</button>
              </div>
            </div>
          `
          : "";

      const dateRange = [project.startDate, project.endDate]
        .filter(Boolean)
        .join(" — ");

      return `
        <article class="project-card">
          ${mediasMarkup}
          <h2 class="project-title">${project.title}</h2>
          ${dateRange ? `<div class="project-dates">${dateRange}</div>` : ""}
          ${project.description ? `<div class="project-description">${formatDescription(project.description)}</div>` : ""}
        </article>
      `;
    }),
  );

  htmlProjectsListElement.innerHTML = cards.join("");
  initProjectMediaCarousels();
}
