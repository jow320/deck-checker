document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("card-form");
  const cardInput = document.getElementById("card-input");
  const collectionEditor = document.getElementById("collection-editor");
  const toggleCollectionButton = document.getElementById("toggle-collection");
  const collectionContainer = document.getElementById("collection-container");
  const searchInput = document.getElementById("search-input");
  const missingForm = document.getElementById("missing-form");
  const missingInput = document.getElementById("missing-input");
  const missingOutput = document.getElementById("missing-output");

  // Função para recuperar a coleção do Local Storage
  function getCollection() {
    return JSON.parse(localStorage.getItem("cardCollection")) || [];
  }

  // Função para salvar a coleção no Local Storage
  function saveCollection(collection) {
    localStorage.setItem("cardCollection", JSON.stringify(collection));
  }

  // Função para adicionar cartas à coleção
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    const cardList = parseCardList(cardInput.value);
    const collection = getCollection();
    const updatedCollection = [...new Set([...collection, ...cardList])];
    saveCollection(updatedCollection);
    collectionEditor.value = updatedCollection.join("\n");
    cardInput.value = "";
  });

  // Função para alternar a exibição da coleção
  toggleCollectionButton.addEventListener("click", function () {
    if (collectionContainer.style.display === "none") {
      collectionContainer.style.display = "block";
      collectionEditor.value = getCollection().join("\n");
    } else {
      collectionContainer.style.display = "none";
    }
  });

  // Função para filtrar a coleção com base na busca
  searchInput.addEventListener("input", function () {
    const query = searchInput.value.toLowerCase();
    const collection = getCollection();
    const filteredCollection = collection.filter((card) =>
      card.toLowerCase().includes(query)
    );
    collectionEditor.value = filteredCollection.join("\n");
  });

  // Função para verificar quais cartas não estão na coleção
  missingForm.addEventListener("submit", async function (event) {
    event.preventDefault();
    const missingList = parseCardList(missingInput.value);
    const collection = getCollection();

    const missingCards = missingList.filter(
      (card) => !collection.includes(card)
    );

    // Exibe a lista de cartas que não estão na coleção, sem preços
    missingOutput.innerHTML =
      missingCards.length > 0
        ? `<h3>Cartas que você não possui:</h3>
           <textarea id="missing-list-editor">${missingCards.join(
             "\n"
           )}</textarea>`
        : "<h3>Você possui todas as cartas da lista!</h3>";
  });

  // Função para analisar a lista de cartas
  function parseCardList(input) {
    return input
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line !== "");
  }

  // Função para buscar o preço da carta
  async function fetchCardPrice(cardName) {
    try {
      // Remove números e caracteres desnecessários do nome da carta
      const cleanCardName = cardName.replace(/^\d+\s*/, "");

      // Primeiro, tenta buscar o nome exato da carta
      let response = await fetch(
        `https://api.scryfall.com/cards/named?exact=${encodeURIComponent(
          cleanCardName
        )}`
      );
      let data = await response.json();

      // Verifica se a resposta contém o preço
      if (data && data.prices && data.prices.usd) {
        return parseFloat(data.prices.usd);
      } else {
        // Se não encontrar, tenta buscar por um nome mais genérico ou por consulta de busca
        response = await fetch(
          `https://api.scryfall.com/cards/search?q=${encodeURIComponent(
            cleanCardName
          )}`
        );
        data = await response.json();

        // Verifica a primeira carta na resposta da busca
        if (
          data &&
          data.data &&
          data.data.length > 0 &&
          data.data[0].prices &&
          data.data[0].prices.usd
        ) {
          return parseFloat(data.data[0].prices.usd);
        }
      }

      // Se não encontrar o preço, retorna null
      return null;
    } catch (error) {
      console.error("Erro ao buscar preço da carta:", error);
      return null;
    }
  }

  // Inicializa a exibição da coleção
  collectionEditor.value = getCollection().join("\n");
});
