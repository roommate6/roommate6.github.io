const projects = [
  {
    pathToMediaFolder: "assets/media_packs/embedded_pic_1",
    title: "PIC Microcontroller Hydraulic Press Controller",
    startDate: "2025-01",
    endDate: "2025-02",
    description:
      "This project is a complete embedded control system for a hydraulic press, developed using a PIC microcontroller and programmed in **C** with **MPLAB X IDE**. The goal was to design a reliable, user-friendly, and safety-focused controller capable of operating in both manual and automatic modes while allowing configurable press parameters.\n\n## Features\n\n- **Manual Mode** – Direct control of the hydraulic press for testing and maintenance.\n- **Automatic Mode** – Executes a complete press cycle based on user-defined timing parameters.\n- **Configuration Mode** – Allows the operator to customize the pressing and return durations using four push buttons.\n- **Non-Volatile Memory Storage** – Custom timing values are saved in the PIC's internal EEPROM, ensuring they are retained even after power loss.\n- **LED Status Indicators** – Multiple LEDs provide clear visual feedback for operating mode, system status, and active operations.\n- **Safety Monitoring** – Dedicated sensors continuously monitor the system. If an unsafe condition is detected, the current operation is immediately halted to protect both the equipment and the operator.\n- **Debounced Button Inputs** – All four push buttons are software-debounced to ensure reliable and accurate user input without false triggering.\n\n## Software Implementation\nThe firmware was written entirely in **C** using **MPLAB X IDE**. The application is structured as a state machine, allowing smooth transitions between manual, automatic, and configuration modes while maintaining predictable behavior.\n\nKey software techniques include:\n\n- Software button debouncing\n- EEPROM read/write routines for parameter storage\n- Timer-based control of press and return cycles\n- State machine architecture\n- Sensor-based safety interlocks\n- LED status management\n\n## Learning Outcomes\nThis project provided practical experience in embedded systems development, including real-time control, finite state machine design, EEPROM memory management, digital input processing, safety-critical programming, and industrial automation concepts. It demonstrates how a PIC microcontroller can be used to build a robust and configurable controller for industrial applications while prioritizing reliability and operator safety.",
  },
];

const projectsList = document.getElementById("projectsList");

renderProjects(projectsList, projects);
