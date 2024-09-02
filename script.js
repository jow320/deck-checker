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
  const updateCollectionButton = document.getElementById("update-collection");

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

    const missingCount = missingCards.length;

    // Exibe a lista de cartas que não estão na coleção, sem preços
    missingOutput.innerHTML =
      missingCards.length > 0
        ? `<h3>Cartas que você não possui:</h3>
           <textarea id="missing-list-editor">${missingCards.join(
             "\n"
           )}</textarea>
           <p>Faltam ${missingCount} cartas.</p>`
        : "<h3>Você possui todas as cartas da lista!</h3>";

    // Adiciona imagens das cartas faltantes
    const missingImageContainer = document.createElement("div");
    missingImageContainer.id = "missing-images";
    missingOutput.appendChild(missingImageContainer);

    const images = await Promise.all(
      missingCards.slice(0, 6).map(async (card) => {
        const imageUrl = await fetchCardImage(card);
        return imageUrl;
      })
    );

    images.forEach((imageUrl) => {
      const imgElement = document.createElement("img");
      imgElement.src = imageUrl;
      imgElement.alt = "Carta Faltante";
      imgElement.style.width = "100px";
      imgElement.style.margin = "10px";
      missingImageContainer.appendChild(imgElement);
    });
  });

  // Função para analisar a lista de cartas
  function parseCardList(input) {
    return input
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line !== "");
  }

  // Função para buscar a imagem da carta
  async function fetchCardImage(cardName) {
    try {
      const cleanCardName = cardName.replace(/^\d+\s*/, "");
      let response = await fetch(
        `https://api.scryfall.com/cards/named?exact=${encodeURIComponent(
          cleanCardName
        )}`
      );
      let data = await response.json();

      if (data && data.image_uris && data.image_uris.normal) {
        return data.image_uris.normal;
      } else {
        return "linkuriboh.png"; // Imagem padrão caso não encontre a carta
      }
    } catch (error) {
      console.error("Erro ao buscar imagem da carta:", error);
      return "linkuriboh.png";
    }
  }

  // Função para atualizar a coleção a partir do editor
  updateCollectionButton.addEventListener("click", function () {
    const newCollection = collectionEditor.value
      .split("\n")
      .map((card) => card.trim())
      .filter((card) => card !== "");
    saveCollection(newCollection);
    collection = newCollection;
  });

  // Inicializa a exibição da coleção
  collectionEditor.value = getCollection().join("\n");
});
