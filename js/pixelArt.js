const projects = [
  {
    pathToMediaFolder: "assets/media_packs/pixel_art_random",
    title: "Random Pixel Art",
    description: "All rights reserved for this self made Pixel Art. Not AI generated."
  },
];

const projectsList = document.getElementById("projectsList");

renderProjects(projectsList, projects);
