// Esta importação é apenas para tipos jsdoc e intellisense
import Store from "./store.js";

export default class View {
  $ = {};
  $$ = {};

  constructor() {
    /**
     * Pré-seleciona todos os elementos que precisaremos (para conveniência e clareza)
     */

    // Elementos únicos
    this.$.menu = this.#qs('[data-id="menu"]');
    this.$.menuBtn = this.#qs('[data-id="menu-btn"]');
    this.$.menuItems = this.#qs('[data-id="menu-items"]');
    this.$.resetBtn = this.#qs('[data-id="reset-btn"]');
    this.$.newRoundBtn = this.#qs('[data-id="new-round-btn"]');
    this.$.modal = this.#qs('[data-id="modal"]');
    this.$.modalText = this.#qs('[data-id="modal-text"]');
    this.$.modalBtn = this.#qs('[data-id="modal-btn"]');
    this.$.turn = this.#qs('[data-id="turn"]');
    this.$.p1Wins = this.#qs('[data-id="p1-wins"]');
    this.$.p2Wins = this.#qs('[data-id="p2-wins"]');
    this.$.ties = this.#qs('[data-id="ties"]');
    this.$.grid = this.#qs('[data-id="grid"]');

    // Listas de elementos
    this.$$.squares = this.#qsAll('[data-id="square"]');

    /**
     * Event listeners apenas para UI
     *
     * Esses listeners não alteram o estado e, portanto,
     * podem ser mantidos inteiramente dentro da View.
     */
    this.$.menuBtn.addEventListener("click", (event) => {
      this.#toggleMenu();
    });
  }

  /**
   * Esta aplicação segue uma metodologia de renderização declarativa
   * e será re-renderizada sempre que o estado mudar.
   *
   * @see https://www.zachgollwitzer.com/posts/imperative-programming#react-declarative-vs-jquery-imperative
   */
  render(game, stats) {
    const { playerWithStats, ties } = stats;
    const {
      moves,
      currentPlayer,
      status: { isComplete, winner }
    } = game;

    this.#closeAll();
    this.#clearMoves();
    this.#updateScoreboard(
      playerWithStats[0].wins,
      playerWithStats[1].wins,
      ties
    );
    this.#initializeMoves(moves);

    if (isComplete) {
      this.#openModal(winner ? `${winner.name} venceu!` : "Empate!");
      return;
    }

    this.#setTurnIndicator(currentPlayer);
  }

  /**
   * Eventos que são manipulados pelo "Controller" em app.js
   * ----------------------------------------------------------
   */

  bindGameResetEvent(handler) {
    this.$.resetBtn.addEventListener("click", handler);
    this.$.modalBtn.addEventListener("click", handler);
  }

  bindNewRoundEvent(handler) {
    this.$.newRoundBtn.addEventListener("click", handler);
  }

  bindPlayerMoveEvent(handler) {
    this.#delegate(this.$.grid, '[data-id="square"]', "click", handler);
  }

  /**
   * Todos os métodos abaixo ⬇️ são métodos utilitários privados usados para atualizar a UI.
   * -------------------------------------------------------------------------
   */

  #updateScoreboard(p1Wins, p2Wins, ties) {
    this.$.p1Wins.innerText = `${p1Wins} vitórias`;
    this.$.p2Wins.innerText = `${p2Wins} vitórias`;
    this.$.ties.innerText = `${ties} empates`;
  }

  #openModal(message) {
    this.$.modal.classList.remove("hidden");
    this.$.modalText.innerText = message;
  }

  #closeAll() {
    this.#closeModal();
    this.#closeMenu();
  }

  #clearMoves() {
    this.$$.squares.forEach((square) => {
      square.replaceChildren();
    });
  }

  #initializeMoves(moves) {
    this.$$.squares.forEach((square) => {
      const existingMove = moves.find((move) => move.squareId === +square.id);

      if (existingMove) {
        this.#handlePlayerMove(square, existingMove.player);
      }
    });
  }

  #closeModal() {
    this.$.modal.classList.add("hidden");
  }

  #closeMenu() {
    this.$.menuItems.classList.add("hidden");
    this.$.menuBtn.classList.remove("border");

    const icon = this.$.menuBtn.querySelector("i");

    icon.classList.add("fa-chevron-down");
    icon.classList.remove("fa-chevron-up");
  }

  #toggleMenu() {
    this.$.menuItems.classList.toggle("hidden");
    this.$.menuBtn.classList.toggle("border");

    const icon = this.$.menuBtn.querySelector("i");

    icon.classList.toggle("fa-chevron-down");
    icon.classList.toggle("fa-chevron-up");
  }

  #handlePlayerMove(squareEl, player) {
    const icon = document.createElement("i");
    icon.classList.add("fa-solid", player.iconClass, player.colorClass);
    squareEl.replaceChildren(icon);
  }

  #setTurnIndicator(player) {
    const icon = document.createElement("i");
    const label = document.createElement("p");

    icon.classList.add("fa-solid", player.colorClass, player.iconClass);

    label.classList.add(player.colorClass);
    label.innerText = `${player.name}, é sua vez!`;

    this.$.turn.replaceChildren(icon, label);
  }

  /**
   * Os métodos #qs e #qsAll são "seletores seguros", o que significa que eles
   * _garantem_ que os elementos selecionados existam no DOM (caso contrário, lançam um erro).
   */
  #qs(selector, parent) {
    const el = parent
      ? parent.querySelector(selector)
      : document.querySelector(selector);

    if (!el) throw new Error("Não foi possível encontrar o elemento");

    return el;
  }

  #qsAll(selector) {
    const elList = document.querySelectorAll(selector);

    if (!elList) throw new Error("Não foi possível encontrar os elementos");

    return elList;
  }

  /**
   * Em vez de registrar event listeners em cada elemento filho na grade do Jogo da Velha,
   * podemos escutar o container da grade e derivar qual quadrado foi clicado usando a função matches().
   *
   * @param {*} el o elemento "container" em que você quer escutar eventos
   * @param {*} selector os elementos "filhos" dentro do "container" para os quais você quer manipular eventos
   * @param {*} eventKey o tipo de evento que você está escutando (ex.: evento "click")
   * @param {*} handler a função callback que será executada quando o evento especificado for acionado nos filhos especificados
   */
  #delegate(el, selector, eventKey, handler) {
    el.addEventListener(eventKey, (event) => {
      if (event.target.matches(selector)) {
        handler(event.target);
      }
    });
  }
}
