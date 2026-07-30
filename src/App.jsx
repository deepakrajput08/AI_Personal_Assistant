import React, { useEffect, useRef, useState } from "react";
import img from "./ai-generated-7963061_640.jpg";

const App = () => {
  const [transcript, setTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [information, setInformation] = useState("");
  const [voices, setVoices] = useState([]);

  const recognitionRef = useRef(null);

  // -----------------------------
  // Load Speech Recognition
  // -----------------------------
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech Recognition is not supported in this browser.");
      return;
    }

    recognitionRef.current = new SpeechRecognition();

    recognitionRef.current.lang = "en-US";
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;

    recognitionRef.current.onresult = (event) => {
      const spokenText = event.results[0][0].transcript
        .toLowerCase()
        .trim();

      console.log("Recognized:", spokenText);

      setTranscript(spokenText);
      handleVoiceCommand(spokenText);
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current.onerror = (event) => {
      console.log(event.error);
      setIsListening(false);
    };
  }, []);

  // -----------------------------
  // Load Voices
  // -----------------------------
  useEffect(() => {
    const loadVoices = () => {
      const allVoices = window.speechSynthesis.getVoices();
      setVoices(allVoices);
    };

    loadVoices();

    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  // -----------------------------
  // Start Listening
  // -----------------------------
  const startListening = () => {
    if (!recognitionRef.current) return;

    setInformation("");
    setTranscript("");

    recognitionRef.current.start();
    setIsListening(true);
  };

  // -----------------------------
  // Speak Function
  // -----------------------------
  const speakText = (text) => {
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    const voice =
      voices.find(
        (v) =>
          v.lang.startsWith("en") &&
          v.name.toLowerCase().includes("male")
      ) ||
      voices.find((v) => v.lang.startsWith("en")) ||
      voices[0];

    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    } else {
      utterance.lang = "en-US";
    }

    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;

    window.speechSynthesis.speak(utterance);
  };

  // -----------------------------
  // Wikipedia API
  // -----------------------------
  const fetchPersonData = async (person) => {
    try {
      const response = await fetch(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
          person
        )}`
      );

      if (!response.ok) {
        throw new Error("API Error");
      }

      const data = await response.json();

      if (data?.title && data?.extract) {
        return {
          name: data.title,
          extract: data.extract.split(".")[0],
        };
      }

      return null;
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  // -----------------------------
  // Google Search
  // -----------------------------
  const performGoogleSearch = (query) => {
    const url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    window.open(url, "_blank");
  };

  // -----------------------------
  // Voice Commands
  // -----------------------------
  const handleVoiceCommand = async (command) => {
    command = command
      .toLowerCase()
      .replace(/[.,!?]/g, "")
      .trim();

    console.log(command);

    // Greeting
    if (
      command.includes("hey jarvis") ||
      command.includes("hello jarvis") ||
      command.includes("hi jarvis")
    ) {
      const response = "Hello Sir, I am Jarvis. How can I help you today?";

      setInformation(response);
      speakText(response);
      return;
    }

    // Name
    if (command.includes("what is your name")) {
      const response =
        "I am Jarvis, your AI voice assistant created by Web Dev Deepak Rajput.";

      setInformation(response);
      speakText(response);
      return;
    }

    // Creator
    if (
      command.includes("who created you") ||
      command.includes("who made you")
    ) {
      const response =
        "I was created by Web Dev Deepak Rajput.";

      setInformation(response);
      speakText(response);
      return;
    }

    // Age
    if (command.includes("what is your age")) {
      const response =
        "I don't have an age. I am an AI assistant.";

      setInformation(response);
      speakText(response);
      return;
    }
        // -----------------------------
    // Open Websites
    // -----------------------------
    if (command.startsWith("open ")) {
      const site = command.replace("open ", "").trim();

      const websites = {
        youtube: "https://www.youtube.com",
        google: "https://www.google.com",
        facebook: "https://www.facebook.com",
        instagram: "https://www.instagram.com",
        twitter: "https://twitter.com",
        github: "https://github.com",
        linkedin: "https://www.linkedin.com",
        whatsapp: "https://web.whatsapp.com",
        gmail: "https://mail.google.com",
        netflix: "https://www.netflix.com",
      };

      if (websites[site]) {
        speakText(`Opening ${site}`);
        setInformation(`Opening ${site}`);
        window.open(websites[site], "_blank");
      } else {
        const response = `Sorry, I don't know how to open ${site}.`;

        speakText(response);
        setInformation(response);
      }

      return;
    }

    // -----------------------------
    // Current Time
    // -----------------------------
    if (
      command.includes("what time is it") ||
      command.includes("tell me the time") ||
      command.includes("current time")
    ) {
      const time = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      const response = `The current time is ${time}`;

      setInformation(response);
      speakText(response);
      return;
    }

    // -----------------------------
    // Current Date
    // -----------------------------
    if (
      command.includes("what is today's date") ||
      command.includes("today date") ||
      command.includes("what is the date")
    ) {
      const date = new Date().toLocaleDateString(undefined, {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      const response = `Today is ${date}`;

      setInformation(response);
      speakText(response);
      return;
    }

    // -----------------------------
    // Famous People
    // -----------------------------
    const famousPeople = [
      "bill gates",
      "elon musk",
      "mark zuckerberg",
      "jeff bezos",
      "steve jobs",
      "barack obama",
      "warren buffett",
      "sundar pichai",
      "satya nadella",
      "mukesh ambani",
      "virat kohli",
      "sachin tendulkar",
      "ms dhoni",
      "narendra modi",
      "cristiano ronaldo",
      "lionel messi",
      "brian lara",
    ];

    const person = famousPeople.find((item) =>
      command.includes(item)
    );

    if (person) {
      const data = await fetchPersonData(person);

      if (data) {
        const response = `${data.name}. ${data.extract}`;

        setInformation(response);
        speakText(response);

        setTimeout(() => {
          performGoogleSearch(person);
        }, 1500);
      } else {
        const response =
          "Sorry, I couldn't find information about that person.";

        setInformation(response);
        speakText(response);

        performGoogleSearch(person);
      }

      return;
    }

    // -----------------------------
    // Google Search Commands
    // -----------------------------
    if (
      command.startsWith("search ") ||
      command.startsWith("who is ") ||
      command.startsWith("what is ") ||
      command.startsWith("where is ")
    ) {
      const response = `Searching Google for ${command}`;

      setInformation(response);
      speakText(response);

      setTimeout(() => {
        performGoogleSearch(command);
      }, 1000);

      return;
    }

    // -----------------------------
    // Default Fallback
    // -----------------------------
    const response = `Searching Google for ${command}`;

    setInformation(response);
    speakText(response);

    setTimeout(() => {
      performGoogleSearch(command);
    }, 1000);
  };
    return (
    <div className="voice-assistant">
      <img
        src={img}
        alt="Jarvis AI"
        className="ai-image"
      />

      <h1>Jarvis Voice Assistant</h1>

      <button
        className="btn"
        onClick={startListening}
        disabled={isListening}
      >
        {isListening ? "🎤 Listening..." : "🎙️ Start Listening"}
      </button>

      <div className="result-box">
        <h3>You Said</h3>
        <p>{transcript || "Waiting for your voice..."}</p>

        <h3>Jarvis Response</h3>
        <p>{information || "Ready to help you."}</p>
      </div>
    </div>
  );
};

export default App;
