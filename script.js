let currentRecipe = null;
let currentStep = 0;

function searchRecipes() {

  const input =
    document
      .getElementById("search")
      .value;

  const userIngredients =
    input
      .split(",")
      .map(item => item.trim())
      .filter(item => item !== "");

  const resultDiv =
    document.getElementById("recipeResults");

  resultDiv.innerHTML = "";

  const scoredRecipes =
    recipes.map(recipe => {

      const matched =
        recipe.ingredients.filter(item =>
          userIngredients.includes(item)
        );

      const missing =
        recipe.ingredients.filter(item =>
          !userIngredients.includes(item)
        );

      return {
        recipe,
        matchCount: matched.length,
        total: recipe.ingredients.length,
        missing
      };
    })

      // 1個も一致しない料理は除外
      .filter(item => item.matchCount > 0)

      // 一致数が多い順
      .sort((a, b) =>
        b.matchCount - a.matchCount
      );

  if (scoredRecipes.length === 0) {
    resultDiv.innerHTML =
      "<p>料理が見つかりません</p>";
    return;
  }

  scoredRecipes.forEach(item => {

    const card =
      document.createElement("div");

    card.className =
      "recipe-card";

    card.innerHTML = `
  <h3>${item.recipe.name}</h3>

  <p>
    一致：
    ${item.matchCount}
    /
    ${item.total}
  </p>

  <div class="ingredient-box">

    <p class="have-title">
      ✅ ある材料
    </p>

    <p class="have-list">
      ${item.recipe.ingredients
        .filter(i =>
          userIngredients.includes(i)
        )
        .join("、")
      || "なし"
      }
    </p>

    <p class="missing-title">
      ❌ 足りない材料
    </p>

    <p class="missing-list">
      ${item.missing.join("、")
      || "なし"
      }
    </p>

  </div>

  <button
    class="
      favorite-btn
      ${JSON.parse(
        localStorage.getItem(
          "favorites"
        )
      )?.includes(
        item.recipe.name
      )
        ? "active"
        : ""
      }
    "

    onclick="
      event.stopPropagation();
      toggleFavorite(
        '${item.recipe.name}',
        this
      )
    "
  >
    ♥
  </button>
`;

    card.onclick = () =>
      openRecipe(item.recipe);

    resultDiv.appendChild(card);
  });
}

document.getElementById("search")
  .addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      searchRecipes();
    }
  });

function openRecipe(recipe) {

  currentRecipe = recipe;
  currentStep = 0;

  // ホーム画面を隠す
  document
    .getElementById("homeScreen")
    .style.display = "none";

  // レシピ画面を表示
  document
    .getElementById("recipeDetail")
    .classList.remove("hidden");

  document
    .getElementById("recipeTitle")
    .textContent = recipe.name;

  showStep();
}

function showStep() {

  const step =
    currentRecipe.steps[currentStep];

  document
    .getElementById("stepText")
    .textContent = step.text;

  document
    .getElementById("stepImage")
    .src = step.image;

  document
    .getElementById("stepTip")
    .textContent = step.tip;

  document
    .getElementById("stepCount")
    .textContent =
    `${currentStep + 1}
        /
       ${currentRecipe.steps.length}`;
}

function nextStep() {

  currentStep++;

  if (
    currentStep >=
    currentRecipe.steps.length
  ) {
    alert("完成！");
    return;
  }

  showStep();
}

function goBack() {

  document
    .getElementById("recipeDetail")
    .classList.add("hidden");

  document
    .getElementById("homeScreen")
    .style.display = "block";
}

let startX = 0;
let endX = 0;

const recipeScreen =
  document.getElementById(
    "recipeDetail"
  );

recipeScreen.addEventListener(
  "touchstart",
  (e) => {

    startX =
      e.touches[0].clientX;
  }
);

recipeScreen.addEventListener(
  "touchend",
  (e) => {

    endX =
      e.changedTouches[0]
        .clientX;

    handleSwipe();
  }
);

function handleSwipe() {

  const swipeDistance =
    startX - endX;

  // 左スワイプ
  if (swipeDistance > 50) {
    nextStep();
  }

  // 右スワイプ
  if (swipeDistance < -50) {

    if (currentStep > 0) {
      currentStep--;
      showStep();
    }
  }
}

function toggleFavorite(
  recipeName,
  button
) {

  let favorites =
    JSON.parse(
      localStorage.getItem(
        "favorites"
      )
    ) || [];

  const exists =
    favorites.includes(
      recipeName
    );

  if (exists) {

    favorites =
      favorites.filter(
        item =>
          item !== recipeName
      );

    button.classList.remove(
      "active"
    );

  } else {

    favorites.push(
      recipeName
    );

    button.classList.add(
      "active"
    );
  }

  localStorage.setItem(
    "favorites",
    JSON.stringify(
      favorites
    )
  );
}

function showFavorites() {

  document
    .getElementById("homeScreen")
    .style.display = "none";

  document
    .getElementById("recipeDetail")
    .classList.add("hidden");

  document
    .getElementById("favoriteScreen")
    .classList.remove("hidden");

  const favoriteList =
    document.getElementById(
      "favoriteList"
    );

  favoriteList.innerHTML = "";

  const favorites =
    JSON.parse(
      localStorage.getItem(
        "favorites"
      )
    ) || [];

  if (favorites.length === 0) {

    favoriteList.innerHTML =
      "<p>お気に入りはありません</p>";

    return;
  }

  favorites.forEach(recipe => {

    const card =
      document.createElement(
        "div"
      );

    card.className =
      "recipe-card";

    card.innerHTML = `
  <h3>${recipe}</h3>
`;
    card.onclick = () => {

      const selectedRecipe =
        recipes.find(
          r => r.name === recipe
        );

      if (selectedRecipe) {

        document
          .getElementById(
            "favoriteScreen"
          )
          .classList.add(
            "hidden"
          );

        openRecipe(
          selectedRecipe
        );
      }
    };

    favoriteList.appendChild(
      card
    );
  });
}

function goHome() {

  document
    .getElementById(
      "favoriteScreen"
    )
    .classList.add(
      "hidden"
    );

  document
    .getElementById(
      "recipeDetail"
    )
    .classList.add(
      "hidden"
    );

  document
    .getElementById(
      "homeScreen"
    )
    .style.display =
    "block";
}

function saveRecentRecipe(recipe) {

  let recentRecipes =
    JSON.parse(
      localStorage.getItem(
        "recentRecipes"
      )
    ) || [];

  recentRecipes =
    recentRecipes.filter(
      r => r.name !== recipe.name
    );

  recentRecipes.unshift(
    recipe
  );

  recentRecipes =
    recentRecipes.slice(0, 5);

  localStorage.setItem(
    "recentRecipes",
    JSON.stringify(
      recentRecipes
    )
  );

  loadRecentRecipes();
}

function loadRecentRecipes() {

  const recentDiv =
    document.getElementById(
      "recentRecipes"
    );

  recentDiv.innerHTML = "";

  const recentRecipes =
    JSON.parse(
      localStorage.getItem(
        "recentRecipes"
      )
    ) || [];

  recentRecipes.forEach(recipe => {

    const card =
      document.createElement(
        "div"
      );

    card.className =
      "recipe-card";

    card.innerHTML = `
      <h3>${recipe.name}</h3>
    `;

    card.onclick = () =>
      openRecipe(recipe);

    recentDiv.appendChild(
      card
    );
  });
}

function loadRecommendedRecipes() {

  const recommendedDiv =
    document.getElementById(
      "recommendedRecipes"
    );

  recommendedDiv.innerHTML = "";

  const randomRecipes =
    [...recipes]
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);

  randomRecipes.forEach(recipe => {

    const card =
      document.createElement(
        "div"
      );

    card.className =
      "recipe-card";

    card.innerHTML = `
      <h3>${recipe.name}</h3>
    `;

    card.onclick = () =>
      openRecipe(recipe);

    recommendedDiv
      .appendChild(card);
  });
}

loadRecommendedRecipes();

// 買い物リスト保存用
let shoppingList =
  JSON.parse(
    localStorage.getItem(
      "shoppingList"
    )
  ) || [];

// 買い物追加
function addShoppingItem() {

  const input =
    document.getElementById(
      "shoppingInput"
    );

  const item =
    input.value.trim();

  if (item === "") {
    return;
  }

  shoppingList.push(item);

  localStorage.setItem(
    "shoppingList",
    JSON.stringify(
      shoppingList
    )
  );

  input.value = "";

  renderShoppingList();
}

// リスト表示
function renderShoppingList() {

  const list =
    document.getElementById(
      "shoppingList"
    );

  list.innerHTML = "";

  shoppingList.forEach(
    (item, index) => {

      list.innerHTML += `
        <li class="shopping-item">
          ${item}
          <button
            class="delete-btn"
            onclick="deleteShoppingItem(${index})"
          >
            削除
          </button>
        </li>
      `;
    }
  );
}

// 削除
function deleteShoppingItem(
  index
) {

  shoppingList.splice(
    index,
    1
  );

  localStorage.setItem(
    "shoppingList",
    JSON.stringify(
      shoppingList
    )
  );

  renderShoppingList();
}

// 起動時表示
renderShoppingList();

// 保存済みレシピ
let customRecipes =
  JSON.parse(
    localStorage.getItem(
      "customRecipes"
    )
  ) || [];

// レシピ追加
function addRecipe() {

  const name =
    document
      .getElementById(
        "recipeName"
      )
      .value
      .trim();

  const ingredients =
    document
      .getElementById(
        "recipeIngredients"
      )
      .value
      .split("\n")
      .filter(item =>
        item.trim() !== ""
      );

  const stepTexts =
    document
      .getElementById(
        "recipeSteps"
      )
      .value
      .split("\n")
      .filter(step =>
        step.trim() !== ""
      );

  if (
    !name ||
    ingredients.length === 0 ||
    stepTexts.length === 0
  ) {
    alert(
      "全部入力してください"
    );
    return;
  }

  // 今のアプリ用に変換
  const steps =
    stepTexts.map(step => ({
      text: step,
      image: "",
      tip: ""
    }));

  const newRecipe = {
    name,
    ingredients,
    steps
  };

  // recipes に追加
  recipes.push(newRecipe);

  // 保存
  customRecipes.push(
    newRecipe
  );

  localStorage.setItem(
    "customRecipes",
    JSON.stringify(
      customRecipes
    )
  );

  alert(
    "保存しました！"
  );

  // 入力欄リセット
  document.getElementById(
    "recipeName"
  ).value = "";

  document.getElementById(
    "recipeIngredients"
  ).value = "";

  document.getElementById(
    "recipeSteps"
  ).value = "";

  // 検索結果更新
  searchRecipes();
}
