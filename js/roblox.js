const projects = [
  {
    pathToMediaFolder: "assets/media_packs/battle_quest",
    title: "Battle-Quest",
    startDate: "2025-01",
    endDate: "2026-01",
    description:
      "My first attempt of making a Roblox game. This is a MMORPG game I made with Lnor. We had a maximum of 20CCU and we reached 10k+ visits with this one.",
  },
];

const projectsList = document.getElementById("projectsList");

renderProjects(projectsList, projects);
