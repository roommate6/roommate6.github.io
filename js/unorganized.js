const projects = [
  {
    pathToMediaFolder: "assets/media_packs/desktop_2026_1",
    title: "Random Images From My Desktop",
    startDate: "2026",
    description: "I don't have copyrights for all images.\n\nSome of the images are downloads from the internet.\n\nAlso, there are some AI gen images."
  },
];

const projectsList = document.getElementById("projectsList");

renderProjects(projectsList, projects);
