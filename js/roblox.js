const projects = [
  {
    pathToMediaFolder: "assets/media_packs/farm_with_squishy_dumplings",
    title: "Farm with Squishy Dumplings",
    startDate: "2026-03",
    description:
      "My second attempt of making a Roblox game. This is a Casual game I made with Lnor. Visit the game: https://www.roblox.com/games/134348150059910/Farm-with-Squishy-Dumplings",
  },
  {
    pathToMediaFolder: "assets/media_packs/battle_quest",
    title: "Battle-Quest",
    startDate: "2025-01",
    endDate: "2026-01",
    description:
      "My first attempt of making a Roblox game. This is a MMORPG game I made with Lnor. We had a maximum of 20CCU and we reached 10k+ visits with this one. Visit the game: https://www.roblox.com/games/73662712161646/Battle-Quest",
  },
];

const projectsList = document.getElementById("projectsList");

renderProjects(projectsList, projects);
