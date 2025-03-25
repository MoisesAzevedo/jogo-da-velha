import Store from "./store.js";
import View from "./view.js";

// Configuração dos jogadores - define ícones, cores, nome, etc.
const players = [
  {
    id: 1,
    name: "Jogador 1",
    iconClass: "fa-x",
    colorClass: "turquoise"
  },
  {
    id: 2,
    name: "Jogador 2",
    iconClass: "fa-o",
    colorClass: "yellow"
  }
];

// Padrão MVC
function init() {
  // "Model"
  const store = new Store("game-state-key", players);

  // "View"
  const view = new View();

  // Lógica do "Controller" (event listeners + manipuladores)

  /**
   * Escuta mudanças no estado do jogo e renderiza a view quando houver mudanças.
   *
   * O evento `statechange` é um Evento personalizado definido na classe Store
   */
  store.addEventListener("statechange", () => {
    view.render(store.game, store.stats);
  });

  /**
   * Quando 2 jogadores estão jogando em abas diferentes do navegador, escuta mudanças
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Window/storage_event
   */
  window.addEventListener("storage", () => {
    console.log("Estado alterado em outra aba");
    view.render(store.game, store.stats);
  });

  // Quando o documento HTML é carregado pela primeira vez, renderiza a view com base
  // no estado atual.
  view.render(store.game, store.stats);

  view.bindGameResetEvent((event) => {
    store.reset();
  });

  view.bindNewRoundEvent((event) => {
    store.newRound();
  });

  view.bindPlayerMoveEvent((square) => {
    const existingMove = store.game.moves.find(
      (move) => move.squareId === +square.id
    );

    if (existingMove) {
      return;
    }

    // Avança para o próximo estado adicionando um movimento ao array de movimentos
    store.playerMove(+square.id);
  });
}

window.addEventListener("load", init);
