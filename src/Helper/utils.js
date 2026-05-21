import warningSound from "../assets/sounds/warning.mp3";
import removeSound from "../assets/sounds/remove.mp3";
import soldSound from "../assets/sounds/sellSuccess.mp3";
export function formatDate(date) {
  if (!date) return "";

  const d = new Date(date); // ISO string handle
  const day = String(d.getDate()).padStart(2, "0"); // 1 -> 01
  const month = String(d.getMonth() + 1).padStart(2, "0"); // 0-indexed
  const year = d.getFullYear();

  return `${day}-${month}-${year}`;
}

const playSoldSuccessSound = () => {
  const audio = new Audio(soldSound);
  audio.play().catch((err) => {
    console.warn("Autoplay blocked:", err);
  });
};
const playWarningSound = () => {
  const audio = new Audio(warningSound);
  audio.play().catch((err) => {
    console.warn("Autoplay blocked:", err);
  });
};
const playRemoveSound = () => {
  const audio = new Audio(removeSound);
  audio.play().catch((err) => {
    console.warn("Autoplay blocked:", err);
  });
};

export { playWarningSound, playRemoveSound, playSoldSuccessSound };
