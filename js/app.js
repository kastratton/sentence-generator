(() => {
  "use strict";

  const lengthInput = document.querySelector("#length");
  const specialInput = document.querySelector("#special");
  const numbersInput = document.querySelector("#numbers");
  const generateButton = document.querySelector("#generate");
  const copyButton = document.querySelector("#copy");
  const output = document.querySelector("#output");
  const count = document.querySelector("#count");
  const status = document.querySelector("#status");
  const statusText = document.querySelector("#status-text");

  // Word banks and sentence patterns produce varied, grammatical English text.
  const subjects = [
    "The team", "A neighbour", "Our manager", "The new system", "Several customers",
    "A local business", "The project group", "The support team", "One colleague",
    "The delivery driver", "A young designer", "The office", "Their family",
    "The research group", "A friendly visitor", "The company", "The organisers"
  ];
  const verbs = [
    "reviewed", "noticed", "prepared", "shared", "discussed", "updated", "checked",
    "organised", "discovered", "explained", "compared", "finished", "planned",
    "arranged", "considered", "confirmed", "collected", "improved", "delivered"
  ];
  const objects = [
    "the latest figures", "a useful suggestion", "the weekly report", "some helpful feedback",
    "the final details", "a new approach", "the meeting notes", "the updated schedule",
    "a few important changes", "the customer request", "the next steps", "a simple solution",
    "the project plan", "the available options", "a short summary", "the latest results",
    "the booking details", "a practical example", "the first draft", "the remaining tasks"
  ];
  const endings = [
    "before the afternoon meeting", "without making a fuss", "after a quick conversation",
    "so everyone could stay informed", "when the weather finally cleared",
    "to make the process easier", "while there was still enough time",
    "and sent a copy to the group", "after checking the details carefully",
    "before making a final decision", "as part of the usual review",
    "with help from the rest of the team", "and made a note for later",
    "so the next step would be clear", "during a quiet moment in the office"
  ];
  const openers = [
    "Earlier that morning", "By the end of the week", "After a short delay",
    "For the time being", "At the next opportunity", "In the meantime",
    "On the way home", "Before anything else", "A little later", "As expected"
  ];
  const secondClauses = [
    "the details were easy to follow", "everyone had time to respond",
    "the result was better than expected", "the change made a real difference",
    "there was enough time to ask questions", "the final version looked much clearer",
    "the team agreed on a sensible plan", "the next step became obvious"
  ];
  const numberContexts = [
    () => `at ${randInt(1, 12)}:${String(randInt(0, 59)).padStart(2, "0")} ${pick(["am", "pm"])}`,
    () => `after ${randInt(2, 48)} hours`,
    () => `with ${randInt(2, 96)} items to review`,
    () => `on ${randInt(1, 28)} ${pick(["March", "April", "June", "August", "October", "November"])}`,
    () => `for just £${randInt(5, 850)}`
  ];
  const symbols = ["!", "?", "—", ":", ";", "…", " (for reference)", " #", " @", " %"];

  function pick(items) { return items[Math.floor(Math.random() * items.length)]; }
  function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
  function capitalise(text) { return text.charAt(0).toUpperCase() + text.slice(1); }

  function makeSentence() {
    const patterns = [
      () => `${pick(subjects)} ${pick(verbs)} ${pick(objects)} ${pick(endings)}.`,
      () => `${pick(openers)}, ${pick(subjects).toLowerCase()} ${pick(verbs)} ${pick(objects)}.`,
      () => `${pick(subjects)} ${pick(verbs)} ${pick(objects)}, and ${pick(secondClauses)}.`,
      () => `Although the original plan changed, ${pick(subjects).toLowerCase()} ${pick(verbs)} ${pick(objects)}.`,
      () => `${capitalise(pick(secondClauses))}, so ${pick(subjects).toLowerCase()} ${pick(verbs)} ${pick(objects)}.`
    ];
    let sentence = pick(patterns)();

    if (numbersInput.checked && Math.random() < 0.72) {
      const phrase = pick(numberContexts)();
      sentence = sentence.replace(/[.!?]$/, "");
      sentence += ` ${phrase}.`;
    }
    if (specialInput.checked && Math.random() < 0.78) {
      const mark = pick(["!", "?", " —", ":", ";"]);
      if (mark === " —") {
        sentence = sentence.replace(/[.!?]$/, ` — ${pick(["which was a relief", "as it turned out", "with good reason"])}.`);
      } else if (mark === ":" || mark === ";") {
        sentence = sentence.replace(/[.!?]$/, `${mark} ${pick(["the timing was ideal", "the reason was simple", "everyone was pleased"])}.`);
      } else {
        sentence = sentence.replace(/[.!?]$/, mark);
      }
    }
    return sentence;
  }

  function generateText(targetLength) {
    let text = "";
    let attempts = 0;
    // Build complete sentences first to keep the result readable.
    while (text.length < targetLength && attempts < 500) {
      const next = makeSentence();
      if (text.length === 0) text = next;
      else text += " " + next.charAt(0).toLowerCase() + next.slice(1);
      attempts++;
    }

    // Match the requested character count exactly. Trim at a word boundary where possible,
    // then fill any remaining space with a plausible continuation rather than random gibberish.
    if (text.length > targetLength) {
      let shortened = text.slice(0, targetLength);
      const lastSpace = shortened.lastIndexOf(" ");
      if (lastSpace > targetLength * 0.65) shortened = shortened.slice(0, lastSpace);
      shortened = shortened.replace(/[\s,;:—-]+$/, "");
      if (shortened.length > 0) text = shortened;
      if (text.length < targetLength) {
        const filler = " and the team agreed";
        while (text.length + filler.length <= targetLength) text += filler;
        text += " ".repeat(targetLength - text.length);
      }
    } else if (text.length < targetLength) {
      const filler = " and the team agreed";
      while (text.length + filler.length <= targetLength) text += filler;
      text += " ".repeat(targetLength - text.length);
    }
    return text.slice(0, targetLength);
  }

  function setStatus(message, isError = false) {
    statusText.textContent = message;
    status.classList.toggle("error", isError);
  }

  function generate() {
    const raw = Number.parseInt(lengthInput.value, 10);
    if (!Number.isFinite(raw) || raw < 10 || raw > 2000) {
      lengthInput.setAttribute("aria-invalid", "true");
      setStatus("Enter a length from 10 to 2,000", true);
      lengthInput.focus();
      return;
    }
    lengthInput.removeAttribute("aria-invalid");
    output.textContent = generateText(raw);
    count.textContent = `${output.textContent.length.toLocaleString("en-GB")} characters`;
    setStatus("Ready to use");
  }

  async function copyText() {
    const text = output.textContent;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const temp = document.createElement("textarea");
        temp.value = text;
        temp.setAttribute("readonly", "");
        temp.style.position = "fixed";
        temp.style.opacity = "0";
        document.body.appendChild(temp);
        temp.select();
        const copied = document.execCommand("copy");
        temp.remove();
        if (!copied) throw new Error("Clipboard copy was blocked");
      }
      copyButton.querySelector("span").textContent = "Copied!";
      setStatus("Copied to clipboard");
      window.setTimeout(() => {
        copyButton.querySelector("span").textContent = "Copy to clipboard";
        setStatus("Ready to use");
      }, 1800);
    } catch {
      setStatus("Copy blocked — select the text to copy", true);
      output.focus();
    }
  }

  generateButton.addEventListener("click", generate);
  copyButton.addEventListener("click", copyText);
  lengthInput.addEventListener("keydown", event => {
    if (event.key === "Enter") generate();
  });
  lengthInput.addEventListener("input", () => lengthInput.removeAttribute("aria-invalid"));

  generate();
})();