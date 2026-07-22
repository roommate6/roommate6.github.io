const projects = [
  {
    pathToMediaFolder: "assets/media_packs/my_synths_2026_1",
    title: "My first synths ever made (Bitwig Studio)",
    startDate: "2026",
    description: "I made the sounds in Bitwig.",
  },
  {
    pathToMediaFolder: "assets/media_packs/reaper_toxic_flower_2026_1",
    title: "Reaper 2026 1",
    startDate: "2026",
    description: "Reaper project sounds for creating the attacks of Toxic Flower from Battle-Quest.",
  },
  {
    pathToMediaFolder: "assets/media_packs/eaglaxle_audio_2026_1",
    title: "EAGLAXLE Audios 2026 1",
    startDate: "2026",
    description: "The sounds are purchased from EAGLAXLE.",
  },
  {
    pathToMediaFolder: "assets/media_packs/audio_from_2026_1",
    title: "Audios 2026 1",
    startDate: "2026",
    description: "Random audio.",
  },
];

const projectsList = document.getElementById("projectsList");

renderProjects(projectsList, projects);
