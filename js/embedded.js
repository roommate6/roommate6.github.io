const embeddedProjects = [
  {
    medias: [
      "assets/images/pic1_1.webp",
      "assets/images/pic1_2.webp",
      "assets/images/pic1_3.webp",
      "assets/images/pic1_4.webp",
      "assets/images/pic1_5.webp",
      "assets/images/pic1_6.webp",
      "assets/videos/pic1_1.mp4",
    ],
    title: "PIC Microcontroller Hydraulic Press Controller",
    startDate: "2025-01",
    endDate: "2025-02",
    description:
      "This project is a complete embedded control system for a hydraulic press, developed using a PIC microcontroller and programmed in **C** with **MPLAB X IDE**. The goal was to design a reliable, user-friendly, and safety-focused controller capable of operating in both manual and automatic modes while allowing configurable press parameters.\n\n## Features\n\n- **Manual Mode** – Direct control of the hydraulic press for testing and maintenance.\n- **Automatic Mode** – Executes a complete press cycle based on user-defined timing parameters.\n- **Configuration Mode** – Allows the operator to customize the pressing and return durations using four push buttons.\n- **Non-Volatile Memory Storage** – Custom timing values are saved in the PIC's internal EEPROM, ensuring they are retained even after power loss.\n- **LED Status Indicators** – Multiple LEDs provide clear visual feedback for operating mode, system status, and active operations.\n- **Safety Monitoring** – Dedicated sensors continuously monitor the system. If an unsafe condition is detected, the current operation is immediately halted to protect both the equipment and the operator.\n- **Debounced Button Inputs** – All four push buttons are software-debounced to ensure reliable and accurate user input without false triggering.\n\n## Software Implementation\nThe firmware was written entirely in **C** using **MPLAB X IDE**. The application is structured as a state machine, allowing smooth transitions between manual, automatic, and configuration modes while maintaining predictable behavior.\n\nKey software techniques include:\n\n- Software button debouncing\n- EEPROM read/write routines for parameter storage\n- Timer-based control of press and return cycles\n- State machine architecture\n- Sensor-based safety interlocks\n- LED status management\n\n## Learning Outcomes\nThis project provided practical experience in embedded systems development, including real-time control, finite state machine design, EEPROM memory management, digital input processing, safety-critical programming, and industrial automation concepts. It demonstrates how a PIC microcontroller can be used to build a robust and configurable controller for industrial applications while prioritizing reliability and operator safety.",
  },
];

const embeddedProjectsList = document.getElementById("embeddedProjectsList");

function renderMedia(mediaPath) {
  const extension = (mediaPath.split(".").pop() || "").toLowerCase();
  const fileName = mediaPath.split("/").pop() || "media";

  const isVideo = ["mp4", "webm", "ogg"].includes(extension);
  const isImage = ["png", "jpg", "jpeg", "gif", "svg", "webp"].includes(
    extension,
  );

  if (isVideo) {
    return `
      <a class="embedded-project-media-link" href="${mediaPath}" target="_blank" rel="noopener noreferrer">
        <video class="embedded-project-media" src="${mediaPath}" controls preload="metadata"></video>
      </a>
    `;
  }

  if (isImage) {
    return `
      <a class="embedded-project-media-link" href="${mediaPath}" target="_blank" rel="noopener noreferrer">
        <img class="embedded-project-media" src="${mediaPath}" alt="${fileName}" />
      </a>
    `;
  }

  return `
    <a class="embedded-project-media-link" href="${mediaPath}" target="_blank" rel="noopener noreferrer">
      <div class="embedded-project-media embedded-project-media-fallback">${fileName}</div>
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

  const paragraphs = escaped
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
        return `<ul class="embedded-project-description-list">${htmlLines.join("")}</ul>`;
      }

      return htmlLines.join("");
    })
    .join("");
}

function renderProjects() {
  if (!embeddedProjectsList) {
    return;
  }

  const cards = embeddedProjects
    .map((project) => {
      const mediasMarkup =
        project.medias && project.medias.length > 0
          ? `<div class="embedded-project-media-row">${project.medias.map(renderMedia).join("")}</div>`
          : "";

      const dateRange = [project.startDate, project.endDate]
        .filter(Boolean)
        .join(" — ");

      return `
        <article class="embedded-project-card">
          ${mediasMarkup}
          <h2 class="embedded-project-title">${project.title}</h2>
          ${dateRange ? `<div class="embedded-project-dates">${dateRange}</div>` : ""}
          ${project.description ? `<div class="embedded-project-description">${formatDescription(project.description)}</div>` : ""}
        </article>
      `;
    })
    .join("");

  embeddedProjectsList.innerHTML = cards;
}

renderProjects();
