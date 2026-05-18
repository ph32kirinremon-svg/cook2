let currentRecipe = null;
let currentStep = 0;

function findRecipes() {

    const input =
        document
            .getElementById("ingredientInput")
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

      <p>
        足りない：
        ${item.missing.join("、")}
      </p>
    `;

        card.onclick = () =>
            openRecipe(item.recipe);

        resultDiv.appendChild(card);
    });
}

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