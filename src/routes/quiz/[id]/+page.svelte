<script lang="ts">
  import { onMount } from "svelte"
  import { goto } from "$app/navigation"
  import QACard from "$lib/Card/QACard.svelte"
  import { language } from "$lib/stores/language"

  let currentLang = $state<"en" | "tr">("tr")

  $effect(() => {
    language.subscribe((value) => {
      currentLang = value
    })
  })

  const translations = {
    en: {
      pressKey: "Press any key to see answer options",
      correct: "Correct!",
    },
    tr: {
      pressKey: "Cevap seçeneklerini görmek için herhangi bir tuşa bas",
      correct: "Doğru!",
    },
  }

  let t = $state(translations.tr)

  $effect(() => {
    t = currentLang === "en" ? translations.en : translations.tr
  })

  let { data } = $props()
  let { singleDeckData, cardList } = data

  console.log("CARD LIST QUIZZ", cardList)

  // Track current card index
  let currentCardIndex = $state(0)
  let currentCard = $derived(cardList[currentCardIndex])

  // Track completed cards
  let completedCards = $state(new Set<number>())

  // Track selected answers for each card
  let selectedAnswers = $state(new Map<number, Set<string>>())

  // Track shown states for each card separately
  let shownCards = $state(new Set<number>())

  // Track toast visibility
  let showToast = $state(false)

  // Track score
  let score = $state(0)

  // Add this near other state variables at the top
  let summaryFilter = $state("all") // Can be 'all', 'correct', or 'mistakes'

  // Function to show answers for current card
  const handleShowAnswers = (event: MouseEvent | KeyboardEvent) => {
    // Ignore clicks on buttons
    if (
      event.type === "click" &&
      (event.target as HTMLElement).tagName === "BUTTON"
    ) {
      return
    }
    shownCards = new Set([...shownCards, currentCardIndex])
  }

  // Function to go to next card
  const nextCard = (event: MouseEvent) => {
    event.stopPropagation()

    // Mark current card as completed if it isn't already
    if (!completedCards.has(currentCardIndex)) {
      completedCards = new Set([...completedCards, currentCardIndex])
    }

    // Move to next card if not at the end
    if (currentCardIndex < cardList.length - 1) {
      currentCardIndex++
    }
  }

  // Function to go to previous card
  const prevCard = (event: MouseEvent) => {
    event.stopPropagation()
    if (currentCardIndex > 0) {
      currentCardIndex--
    }
  }

  // Function to handle option click
  const handleAnswerClick = (
    event: MouseEvent,
    answer: { option: string; correct: boolean },
  ) => {
    event.stopPropagation()

    // Create a new Set with existing answers
    const currentAnswers = new Set(selectedAnswers.get(currentCardIndex) || [])

    // Check if this is the first answer for this card
    const isFirstAttempt = !selectedAnswers.has(currentCardIndex)

    currentAnswers.add(answer.option)

    // Create a new Map to trigger reactivity
    selectedAnswers = new Map(selectedAnswers)
    selectedAnswers.set(currentCardIndex, currentAnswers)

    if (answer.correct) {
      // Add point only if this is the first attempt and it's correct
      if (isFirstAttempt) {
        score++
      }
      showToast = true
      completedCards = new Set([...completedCards, currentCardIndex])
      setTimeout(() => {
        showToast = false
        if (currentCardIndex < cardList.length - 1) {
          currentCardIndex++
        }
      }, 500)
    }
  }

  console.log("CURRENT CARD", currentCard)

  // Add event listeners when component mounts
  onMount(() => {
    const handleInteraction = () => {
      handleShowAnswers(new KeyboardEvent("keydown"))
    }

    window.addEventListener("keydown", handleInteraction)
    window.addEventListener("click", handleInteraction)

    return () => {
      // Cleanup listeners
      window.removeEventListener("keydown", handleInteraction)
      window.removeEventListener("click", handleInteraction)
    }
  })
</script>

<svelte:document on:click={handleShowAnswers} on:keydown={handleShowAnswers} />

<button
  class="back-button desktop-back"
  onclick={() => goto(`/account/deck/${singleDeckData.id}`)}
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke-width="1.5"
    stroke="currentColor"
    class="size-6"
  >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
    />
  </svg>
</button>

<div class="quiz-container w-full sm:w-[800px]">
  <div class="quiz-header flex items-center justify-between w-full">
    <button
      class="back-button mobile-back"
      onclick={() => goto(`/account/deck/${singleDeckData.id}`)}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="size-6"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
        />
      </svg>
    </button>
    <div class="flex-1 text-center text-xl font-semibold">
      {singleDeckData.title}
    </div>
    <div class="w-[42px]"></div>
    <!-- Spacer to balance the back button -->
  </div>
  <div class="progress-bar">
    <div
      class="progress"
      style="width: {(completedCards.size / cardList.length) * 100}%"
    />
  </div>

  {#if completedCards.size === cardList.length}
    <div class="completion-card">
      <h2>Congratulations! 🎉</h2>
      <p>You've completed the quiz!</p>
      <p class="score-text">Score: {score} out of {cardList.length}</p>

      <div class="quiz-summary">
        <h3>Quiz Summary</h3>
        <div class="summary-filters">
          <button
            class="filter-button"
            class:active={summaryFilter === "all"}
            onclick={() => (summaryFilter = "all")}
          >
            All ({cardList.length})
          </button>
          <button
            class="filter-button"
            class:active={summaryFilter === "correct"}
            onclick={() => (summaryFilter = "correct")}
            disabled={!cardList.some((_, i) => {
              const userAnswers = selectedAnswers.get(i) || new Set()
              const correctAnswers = new Set(
                cardList[i].answer
                  .filter((a) => a.correct)
                  .map((a) => a.option),
              )
              return (
                [...userAnswers].every((ans) => correctAnswers.has(ans)) &&
                userAnswers.size === correctAnswers.size
              )
            })}
          >
            Correct ({cardList.filter((_, i) => {
              const userAnswers = selectedAnswers.get(i) || new Set()
              const correctAnswers = new Set(
                cardList[i].answer
                  .filter((a) => a.correct)
                  .map((a) => a.option),
              )
              return (
                [...userAnswers].every((ans) => correctAnswers.has(ans)) &&
                userAnswers.size === correctAnswers.size
              )
            }).length})
          </button>
          <button
            class="filter-button"
            class:active={summaryFilter === "mistakes"}
            onclick={() => (summaryFilter = "mistakes")}
            disabled={!cardList.some((_, i) => {
              const userAnswers = selectedAnswers.get(i) || new Set()
              const correctAnswers = new Set(
                cardList[i].answer
                  .filter((a) => a.correct)
                  .map((a) => a.option),
              )
              return !(
                [...userAnswers].every((ans) => correctAnswers.has(ans)) &&
                userAnswers.size === correctAnswers.size
              )
            })}
          >
            Mistakes ({cardList.filter((_, i) => {
              const userAnswers = selectedAnswers.get(i) || new Set()
              const correctAnswers = new Set(
                cardList[i].answer
                  .filter((a) => a.correct)
                  .map((a) => a.option),
              )
              return !(
                [...userAnswers].every((ans) => correctAnswers.has(ans)) &&
                userAnswers.size === correctAnswers.size
              )
            }).length})
          </button>
        </div>
        {#each cardList as card, index}
          {@const userAnswers = selectedAnswers.get(index) || new Set()}
          {@const correctAnswers = new Set(
            card.answer.filter((a) => a.correct).map((a) => a.option),
          )}
          {@const isCorrect =
            [...userAnswers].every((ans) => correctAnswers.has(ans)) &&
            userAnswers.size === correctAnswers.size}

          {#if summaryFilter === "all"}
            <QACard {card} />
          {:else if (summaryFilter === "correct" && isCorrect) || (summaryFilter === "mistakes" && !isCorrect)}
            <div
              class="summary-card"
              class:correct={isCorrect}
              class:incorrect={!isCorrect}
            >
              <div class="summary-question">{card.question}</div>
              <div class="summary-answers">
                <div class="user-answer">
                  Your answer: {[...userAnswers].join(", ") ||
                    "No answer provided"}
                </div>
                <div class="correct-answer">
                  Correct answer: {[...correctAnswers].join(", ")}
                </div>
              </div>
            </div>
          {/if}
        {/each}
      </div>

      <div class="completion-buttons">
        <button class="button" onclick={() => goto("/account/my-decks")}
          >Return to My Decks</button
        >
        <button
          class="button"
          onclick={() => {
            currentCardIndex = 0
            completedCards = new Set()
            selectedAnswers = new Map()
            shownCards = new Set()
            score = 0
          }}
        >
          Retry Quiz
        </button>
      </div>
    </div>
  {:else}
    <div class="question-card">
      <div class="question">
        <h3>{currentCard.question}</h3>
      </div>
    </div>

    {#if !shownCards.has(currentCardIndex)}
      <div class="prompt-text">{t.pressKey}</div>
    {/if}

    {#if shownCards.has(currentCardIndex) && !showToast}
      <div class="answers-card w-full sm:w-[600px] mx-auto">
        <div class="options">
          {#each currentCard.answer as answer}
            <button
              class="option"
              class:correct={answer.correct &&
                selectedAnswers.get(currentCardIndex)?.has(answer.option)}
              class:incorrect={!answer.correct &&
                selectedAnswers.get(currentCardIndex)?.has(answer.option)}
              onclick={(e) => handleAnswerClick(e, answer)}
              disabled={completedCards.has(currentCardIndex)}
            >
              {answer.option}
            </button>
          {/each}
        </div>

        <div class="controls">
          <button onclick={prevCard} disabled={currentCardIndex === 0}>
            <span>←</span>
          </button>

          <div class="action-buttons">
            <!-- <button
              class="hint"
              onclick={(e) => {
                e.stopPropagation()
                // Add hint logic here
              }}
            >
              <span>5</span>
              Hint
            </button>
            <button
              class="reveal"
              onclick={(e) => {
                e.stopPropagation()
                // Add reveal logic here
              }}
            >
              <span>📖</span>
              Reveal
            </button> -->
            <p>Sana inanıyoruz</p>
          </div>

          <button onclick={nextCard}>
            <span>→</span>
          </button>
        </div>
      </div>
    {/if}

    {#if showToast}
      <!-- <div class="toast toast-end">
        <div class="alert alert-success">
          <span>Correct! </span>
        </div>
      </div> -->
      <div class="toast toast-center toast-middle">
        <div class="alert alert-success">
          <span>{t.correct} </span>
        </div>
      </div>
    {/if}
  {/if}
</div>

<style>
  .quiz-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
  }

  .progress-bar {
    width: 100%;
    height: 8px;
    background: #e0e0e0;
    border-radius: 4px;
    margin-bottom: 2rem;
  }

  .progress {
    height: 100%;
    background: #3b82f6;
    border-radius: 4px;
    transition: width 0.3s ease;
  }

  .question-card {
    background: white;
    border-radius: 1rem;
    padding: 2rem;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    margin-bottom: 1.5rem;
  }

  .answers-card {
    background: white;
    border-radius: 1rem;
    padding: 2rem;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }

  .question {
    text-align: center;
    margin: 2rem 0;
  }

  .options {
    display: grid;
    gap: 1rem;
    margin: 2rem 0;
  }

  .option {
    padding: 1rem;
    border: 1px solid #e0e0e0;
    border-radius: 0.5rem;
    background: white;
    cursor: pointer;
    transition: all 0.2s;
  }

  .option:hover {
    background: #f3f4f6;
  }

  .controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 2rem;
  }

  .action-buttons {
    display: flex;
    gap: 1rem;
  }

  button {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 0.5rem;
    cursor: pointer;
  }

  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .option.correct {
    background: #86efac;
    border-color: #22c55e;
  }

  .option.incorrect {
    background: #fecaca;
    border-color: #ef4444;
  }

  .prompt-text {
    text-align: center;
    color: #666;
    font-size: 1.1rem;
    margin: 2rem 0;
  }

  /* .toast {
    position: fixed;
    bottom: 1rem;
    right: 1rem;
    z-index: 50;
  }

  .alert {
    padding: 1rem;
    border-radius: 0.5rem;
    background-color: #86efac;
    color: #166534;
  } */

  .completion-card {
    background: white;
    border-radius: 1rem;
    padding: 3rem 2rem;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    text-align: center;
  }

  .completion-card h2 {
    margin-bottom: 1rem;
    font-size: 1.8rem;
  }

  .completion-buttons {
    display: flex;
    gap: 1rem;
    justify-content: center;
    margin-top: 2rem;
  }

  .button {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 0.5rem;
    background: #3b82f6;
    color: white;
    cursor: pointer;
    text-decoration: none;
    font-size: 1rem;
  }

  .button:hover {
    background: #2563eb;
  }

  .score-text {
    font-size: 1.2rem;
    margin: 1rem 0;
    color: #4b5563;
  }

  .option:disabled {
    opacity: 1; /* Keep full opacity to show previous answers clearly */
    cursor: not-allowed;
    pointer-events: none; /* Prevents hover effects */
  }

  .quiz-summary {
    margin: 2rem 0;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    max-height: 400px;
    overflow-y: auto;
    padding: 1rem;
  }

  .summary-card {
    padding: 1rem;
    border-radius: 0.5rem;
    border: 1px solid #e0e0e0;
    background: #f8f9fa;
  }

  .summary-card.correct {
    border-left: 4px solid #22c55e;
    background: #f0fdf4;
  }

  .summary-card.incorrect {
    border-left: 4px solid #ef4444;
    background: #fef2f2;
  }

  .summary-question {
    font-weight: 600;
    margin-bottom: 0.5rem;
  }

  .summary-answers {
    font-size: 0.9rem;
    color: #4b5563;
  }

  .user-answer {
    margin-bottom: 0.25rem;
  }

  .correct-answer {
    color: #166534;
  }

  .summary-filters {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
    justify-content: center;
  }

  .filter-button {
    padding: 0.5rem 1rem;
    border: 1px solid #e0e0e0;
    border-radius: 2rem;
    background: white;
    cursor: pointer;
    transition: all 0.2s;
  }

  .filter-button:hover {
    background: #f3f4f6;
  }

  .filter-button.active {
    background: #3b82f6;
    color: white;
    border-color: #3b82f6;
  }

  .quiz-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
    font-size: 1.5rem;
    font-weight: 600;
  }

  .back-button {
    padding: 0.5rem;
    border: none;
    background: transparent;
    cursor: pointer;
    border-radius: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .back-button:hover {
    background: #f3f4f6;
  }

  .desktop-back {
    position: fixed;
    left: 2rem;
    top: 2rem;
  }

  .mobile-back {
    display: none;
  }

  /* Mobile styles */
  @media (max-width: 768px) {
    .desktop-back {
      display: none;
    }

    .mobile-back {
      display: block;
    }
  }
</style>
