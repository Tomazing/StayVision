# StayVision

StayVision's "Simulate Your Stay" feature enhances property browsing by allowing guests to experience a personalised stay simulation before booking.

**Demo Link:** [**https://stay-vision.vercel.app**](https://stay-vision.vercel.app)

**Backend Server:** [**https://stay-vision-backend.vercel.app**](https://stay-vision-backend.vercel.app)

## Why It Matters
Staying Experience Simulation transforms property browsing from static scrolling into an immersive, personalised journey. By letting guests “try before they buy,” it sparks excitement, builds trust and sets a new digital hospitality standard, while the expectation match ensures the experience keeps getting better.

<p align="center">
    <img src="https://github.com/Tomazing/StayVision/blob/main/frontend/src/assets/screenshot1.png?raw=true" alt="StayVision Simulation Interface" width="650">
    <br>
    <img src="https://github.com/Tomazing/StayVision/blob/main/frontend/src/assets/screenshot2.png?raw=true" alt="StayVision Simulation Interface" width="350">
    <img src="https://github.com/Tomazing/StayVision/blob/main/frontend/src/assets/screenshot3.png?raw=true" alt="StayVision Simulation Interface" width="300">
    <br>
    <em>Screenshots of the StayVision simulation interface demo</em>
</p>

## How It Works
1. **Property Selection**: Guests choose a property they are interested in.
2. **Personalised Simulation**: The AI generates a tailored stay simulation based on the property details and user preferences.
3. **Interactive Experience**: Guests can explore the simulation, ask questions, and receive personalised recommendations.
4. **Feedback Loop**: Guests can provide feedback on the simulation, which helps improve future simulations.

```mermaid
flowchart TD
  subgraph Backend["Backend"]
        LLM["OpenAI GPT Integration"]
        API["API Endpoints"]
        ProcessAnswers["Process User Responses"]
        CreateItinerary["Create JSON Itinerary"]
  end
  User(["User"]) --> Homepage["Browse Properties"]
  Homepage --> PropertyDetail["View Property Details"]
  PropertyDetail --> StartSim["Start Stay Simulation"]
  StartSim --> Question1["Initial Question"]
  Question1 --> Answer1["User Response"]
  Answer1 --> Questions2["Follow-up Questions"]
  Questions2 --> Answers2["User Responses"]
  Answers2 --> Generate["Generate Itinerary"]
  Generate --> Results["Display Personalized Results"]
  API --> LLM
  LLM --> ProcessAnswers
  ProcessAnswers --> CreateItinerary
  Answer1 -. API Call .-> API
  Answers2 -. API Call .-> API
  CreateItinerary -. JSON Data .-> Results
  Results --> Feedback["User Feedback"]
  Feedback --> Restart["Restart/Exit"]

  LLM:::backend
  API:::backend
  ProcessAnswers:::backend
  CreateItinerary:::backend
  User:::user
  Homepage:::frontend
  PropertyDetail:::frontend
  StartSim:::frontend
  Question1:::frontend
  Answer1:::user
  Questions2:::frontend
  Answers2:::user
  Generate:::backend
  Results:::frontend
  Feedback:::user
  Restart:::user

  %% High contrast colours for both light/dark backgrounds
  classDef user fill:#3e8e41,stroke:#fff,stroke-width:2px,color:#fff;
  classDef frontend fill:#236fa1,stroke:#fff,stroke-width:2px,color:#fff;
  classDef backend fill:#b36ae2,stroke:#fff,stroke-width:2px,color:#fff;
```

<p align="center">
  <br>
  <em>System Design Diagram</em>
  <br>
  <em><small>Can't see the diagram? <a href="https://github.com/Tomazing/StayVision/blob/main/frontend/src/assets/system_design.png?raw=true">View system design image</a></small></em>
</p>

## Tech Stack
- **Frontend**: React, TypeScript, Tailwind CSS, Vite
- **Backend**: Node.js, Express, OpenAI API
- **Deployment**: Vercel for frontend and backend