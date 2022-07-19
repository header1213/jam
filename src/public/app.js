const _ = (html) => {
  const outer = document.createElement("div");
  outer.innerHTML = html;
  const results = outer.children;
  if (results.length > 1) return results;
  else if (results.length === 1) return results[0];
};

socket = io();
socket.nickname = "Guest";

const lobbyElem = document.getElementById("lobby");
const chatElem = document.getElementById("chat");
chatElem.classList.add("hidden");

// Lobby

const nameForm = document.getElementById("name");
nameForm.addEventListener("submit", function (event) {
  event.preventDefault();
  const input = this.querySelector("input");
  const button = this.querySelector("button");
  socket.nickname = input.value;
  socket.emit("name", socket.nickname);
  input.disabled = true;
  button.disabled = true;
});

const joinForm = document.getElementById("join");
joinForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const input = this.querySelector("input");
  socket.roomName = input.value;
  input.value = "";
  socket.emit("join", socket.roomName);

  const h2 = chatElem.querySelector("h2");
  h2.innerText = `Room ${socket.roomName}`;
  lobbyElem.classList.add("hidden");
  chatElem.classList.remove("hidden");
});

// Room

const msgBox = chatElem.querySelector("ul");
const chatForm = chatElem.querySelector("form");
chatForm.addEventListener("submit", function (event) {
  event.preventDefault();
  const input = this.querySelector("input");
  socket.emit("message", input.value, socket.roomName);
  showMessage(`Me(${socket.nickname}): ${input.value}`);
  input.value = "";
});
function showMessage(message) {
  msgBox.appendChild(_(`<li>${message}</li>`));
  msgBox.scrollTop = msgBox.scrollHeight;
}
socket.on("message", function (msg) {
  showMessage(msg);
});

const backToLobby = document.getElementById("back");
backToLobby.addEventListener("click", function (event) {
  socket.emit("leave", socket.roomName);
  socket.roomName = undefined;
  msgBox.innerHTML = "";
  chatElem.classList.add("hidden");
  lobbyElem.classList.remove("hidden");
});
