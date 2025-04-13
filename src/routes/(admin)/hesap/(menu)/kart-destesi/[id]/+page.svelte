<script lang="ts">
  import { YoutubeTranscript } from "youtube-transcript"
  import { goto } from "$app/navigation"
  import { getContext } from "svelte"
  import type { Writable } from "svelte/store"
  import Spinner from "$lib/Spinner/Spinner.svelte"
  import FileUploader from "$lib/FileUploader/FileUploader.svelte"
  import QACard from "$lib/Card/QACard.svelte"
  import RenameDeckModal from "$lib/Modal/RenameDeckModal.svelte"
  import { language } from "$lib/stores/language"
  import { credits } from "$lib/stores/credits"

  // import { deckState } from "$lib/store/deck.svelte"

  let adminSection: Writable<string> = getContext("adminSection")
  adminSection.set("my-decks")

  let { data } = $props()
  let { singleDeckData } = data

  console.log("subscriptionStats", data.subscriptionStats)

  // Language and translations
  let currentLang = $state<"en" | "tr">("tr")
  let flashcardLang = $state<"tr" | "en">("tr")

  // Initialize from the store
  $effect(() => {
    language.subscribe((value) => {
      currentLang = value
      // flashcardLang = value // Update flashcardLang to match currentLang
    })
  })

  const translations = {
    en: {
      myDecks: "My Decks",
      cards: "Cards",
      lessons: "Lessons",
      imports: "Imports",
      leaderboard: "Leaderboard",
      learn: "Learn",
      generatingCards: "Generating cards",
      thisMayTake: "This may take a few moments...",
      nothingHereYet: "Nothing here yet",
      addCardsToStart: "Add some cards to start quizzing",
      magicImport: "Import your notes",
      writeCards: "Write cards",
      understand: "Understand",
      memorize: "Memorize",
      activeRecallQuizzes: "Active recall quizzes",
      timeTrial: "Time trial",
      comingSoon: "Coming soon",
      start: "Start",
      renameDeck: "Rename deck",
      deleteDeck: "Delete deck",
      areYouSureDelete: "Are you sure you want to delete",
      cannotBeUndone: "This action cannot be undone.",
      cancel: "Cancel",
      delete: "Delete",
      close: "close",
      all: "All",
      selectImportSource:
        "AI turns what you're learning into flashcards so you don't have to",
      pdfImport: "PDF import",
      uploadOrDragPdf: "Upload or drag over your PDF",
      chooseFile: "Choose file",
      dragAndDrop: "or drag & drop",
      back: "Back",
      generating: "Generating...",
      generateFlashcards: "Generate Flashcards",
      youtubeImport: "YouTube video import",
      enterYoutubeUrl: "Enter the URL of the video you want to import",
      creating: "Creating...",
      generateCards: "Generate cards",
      invalidYoutubeUrl:
        "Must be a valid YouTube URL (youtube.com, m.youtube.com, or youtu.be)",
      selectLanguageForCards: "Select language to generate cards in",
      viewSource: "View Source",
    },
    tr: {
      myDecks: "Destelerim",
      cards: "Kartlar",
      lessons: "Dersler",
      imports: "İçe Aktarmalar",
      leaderboard: "Lider Tablosu",
      learn: "Öğren",
      generatingCards: "Kartlar oluşturuluyor",
      thisMayTake: "Bu biraz zaman alabilir...",
      nothingHereYet: "Henüz bir şey yok",
      addCardsToStart: "Quiz yapmaya başlamak için kart ekleyin",
      magicImport: "Sihirli içe aktarma",
      writeCards: "Kart yaz",
      understand: "Anla",
      memorize: "Ezberle",
      activeRecallQuizzes: "Aktif hatırlama quizleri",
      timeTrial: "Zaman denemesi",
      comingSoon: "Yakında",
      start: "Başla",
      renameDeck: "Desteyi yeniden adlandır",
      deleteDeck: "Desteyi sil",
      areYouSureDelete: "Silmek istediğinizden emin misiniz",
      cannotBeUndone: "Bu işlem geri alınamaz.",
      cancel: "İptal",
      delete: "Sil",
      close: "kapat",
      all: "Tümü",
      selectImportSource:
        "Yapay zeka öğrendiklerinizi flashcard'lara dönüştürür, siz uğraşmayın",
      pdfImport: "PDF içe aktar",
      uploadOrDragPdf: "PDF'inizi yükleyin veya sürükleyin",
      chooseFile: "Dosya seç",
      dragAndDrop: "veya sürükle bırak",
      back: "Geri",
      generating: "Oluşturuluyor...",
      generateFlashcards: "Flashcard Oluştur",
      youtubeImport: "YouTube video içe aktar",
      enterYoutubeUrl: "İçe aktarmak istediğiniz videonun URL'sini girin",
      creating: "Oluşturuluyor...",
      generateCards: "Kart oluştur",
      invalidYoutubeUrl:
        "Geçerli bir YouTube URL'si olmalı (youtube.com, m.youtube.com veya youtu.be)",
      selectLanguageForCards: "Kartları oluşturmak için dil seçin",
      viewSource: "Kaynak",
    },
  }

  let t = $state(translations.tr)

  $effect(() => {
    t = currentLang === "en" ? translations.en : translations.tr
  })

  let deckState = $state({
    name: null,
    updatedName: null,
    id: null,
    deckColor: null,
    renaming: false,
    cards: [],
  })

  deckState.name = singleDeckData.title
  deckState.updatedName = singleDeckData.title
  deckState.id = singleDeckData.id
  deckState.deckColor = singleDeckData.deck_color
  deckState.cards = singleDeckData.card

  console.log("DECK STATE ONLOAD???", deckState)

  let deckData = $derived.by(() => {
    return {
      name: deckState.updatedName,
      deckColor: deckState.deckColor,
      cards: deckState.cards,
    }
  })

  let creatingCards = $state(false)

  console.log("singleDeckData deck/[id] route ~~~~", singleDeckData)

  // let cards = $state<any[]>([...data.cardList])

  // console.log("user", user)
  // console.log("profile", profile)
  // console.log("deckList", deckList)

  let importType = $state("")
  let selectedFile = $state<File | null>(null)

  let youtubeLink = $state("")
  let youtubeLinkError = $state("")

  let learnMode = $state("memorize")

  let isGenerating = $state(false)

  let finishedCreatingCards = $state(false)

  let deckCards = $state(deckData.cards)

  const handleOptionsClick = (event: MouseEvent) => {
    event.stopPropagation()
  }

  const showImportView = (type: string) => {
    importType = type
  }

  const handleBack = () => {
    importType = ""
    selectedFile = null
    youtubeLink = ""
    youtubeLinkError = ""
  }

  const handleModalClose = () => {
    importType = ""
    selectedFile = null
    youtubeLink = ""
    youtubeLinkError = ""
  }

  const handleFileSelect = (event: Event) => {
    const input = event.target as HTMLInputElement
    if (input.files && input.files[0]) {
      selectedFile = input.files[0]
    }
  }

  const handleGenerateFlashcards = async () => {
    if (!selectedFile) {
      console.error("No file selected")
      return
    }

    isGenerating = true
    creatingCards = true
    magic_import_modal.close()

    try {
      // First upload the PDF to Supabase and get extracted text
      const formData = new FormData()
      formData.append("file", selectedFile)
      formData.append("deckId", singleDeckData.id)

      const uploadResponse = await fetch("/hesap/api/pdf", {
        method: "POST",
        body: formData,
      }).then((res) => res.json())

      if (!uploadResponse.success) {
        throw new Error(uploadResponse.error || "Failed to upload PDF")
      }

      console.log("PDF uploaded successfully:", uploadResponse.data)

      // Initialize cards array
      deckState.cards = []

      // Calculate number of questions based on text length
      const wordsPerQuestion = 20 // Adjust this number to control density of questions
      const wordCount = uploadResponse.data.text.split(/\s+/).length
      const calculatedQuestionCount = Math.ceil(wordCount / wordsPerQuestion)

      // Ensure questions stay within reasonable bounds (5-30)
      const totalQuestions = Math.min(Math.max(calculatedQuestionCount, 5), 200)
      const questionsPerBatch = 5
      const totalBatches = Math.ceil(totalQuestions / questionsPerBatch)

      console.log(
        `Text length: ${wordCount} words, Generating ${totalQuestions} questions in ${totalBatches} batches`,
      )

      // Generate cards in batches of 5
      let generatingComplete = false
      let batchNumber = 1

      while (!generatingComplete) {
        console.log(`Generating batch ${batchNumber}...`)

        // Create a list of existing questions to avoid duplicates
        const existingQuestions = deckState.cards.map((card) => card.question)

        const transcriptLength = uploadResponse.data.text.length
        const chunkSize = Math.ceil(transcriptLength / totalBatches)
        const startIndex = (batchNumber - 1) * chunkSize // Changed from batchNumber to (batchNumber - 1)
        const endIndex = Math.min(batchNumber * chunkSize, transcriptLength)
        const transcriptChunk = uploadResponse.data.text.substring(
          startIndex,
          endIndex,
        )

        console.log("START----->", startIndex)
        console.log("END----->", endIndex)

        const response = await fetch("/hesap/api/openai", {
          method: "POST",
          body: JSON.stringify({
            text: transcriptChunk,
            data: {
              questionsToGenerate: questionsPerBatch,
              existingQuestions,
              flashcardLang,
            },
            response_format: { type: "json_object" },
          }),
        }).then((res) => res.json())

        if (!response.success) {
          throw new Error(response.error || "Failed to generate flashcards")
        }

        console.log(
          "RESPONSE FROM OPENAI === BEFORE CREATING CARDS PDF DATAs",
          response.data.flashcards,
        )

        // let cardsToCreate = response.data.flashcards.filter(
        //   (card) => card.answer,
        // )

        let cardsToCreate = response.data.flashcards
          .map((card) => {
            const [question, answer] = Object.values(card)
            return { question, answer }
          })
          .filter((item) => item.answer)

        console.log("CARDS TO CAREATE ", cardsToCreate)

        // After generating cards with OpenAI
        const cardResponse = await fetch("/hesap/api/card", {
          method: "POST",
          body: JSON.stringify({
            type: "createCard",
            data: {
              cards: cardsToCreate,
              deckId: singleDeckData.id,
              dataSource: [
                {
                  type: "pdf_file",
                  source: uploadResponse.data.publicUrl,
                },
              ],
            },
          }),
        }).then((res) => res.json())

        if (!cardResponse.success) {
          throw new Error(cardResponse.error || "Failed to save cards")
        }

        // Update deckState with the newly created cards
        deckState.cards = [...deckState.cards, ...cardResponse.data]

        // Check if we should continue generating
        // This could be based on various factors like:
        // - Content length
        // - Maximum number of cards
        // - OpenAI indicating it's complete
        if (response.data.isComplete || batchNumber >= 6) {
          // Example: max 30 cards
          generatingComplete = true
        }

        batchNumber++
      }

      magic_import_modal.close()
    } catch (error) {
      console.error("Error processing PDF:", error)
      // Handle error (e.g., show error message to user)
    } finally {
      isGenerating = false
      creatingCards = false
      finishedCreatingCards = true

      // Completed deck, fill table and reduce credits

      const response = await fetch("/hesap/api/deck", {
        method: "POST",
        body: JSON.stringify({
          type: "completeDeck",
          data: {
            profileCredits: data.profile.credits,
            profile: data.profile,
            subscriptionStats: data.subscriptionStats,
          },
        }),
      }).then((res) => res.json())
      console.log("COMPLETED DECK?", response)
      credits.set(
        data.subscriptionStats.creditsAvailable - response.creditsToDeduct,
      )
    }
  }

  // const handleGenerateFlashcards = async () => {
  //   if (!selectedFile) {
  //     console.error("No file selected")
  //     return
  //   }

  //   // Create a URL for the file and open it in a new tab
  //   const fileUrl = URL.createObjectURL(selectedFile)
  //   window.open(fileUrl, "_blank")

  //   // Clean up the URL object after opening
  //   URL.revokeObjectURL(fileUrl)
  // }

  const YOUTUBE_URL_REGEX =
    /^(https?:\/\/)?(www\.|m\.)?(youtube\.com|youtu\.be)\/.+$/

  const createCardsYoutubeLink = async () => {
    if (!YOUTUBE_URL_REGEX.test(youtubeLink)) {
      youtubeLinkError =
        "Must be a valid YouTube URL (youtube.com, m.youtube.com, or youtu.be)"
      console.log("youtubeLinkError ###", youtubeLinkError)
      return
    }

    creatingCards = true
    youtubeLinkError = "" // Clear any previous error

    // Close modal
    magic_import_modal.close()

    try {
      // First get the transcript
      const response = await fetch("/hesap/api/youtube", {
        method: "POST",
        body: JSON.stringify({
          type: "youtubeTranscript",
          data: {
            deckId: singleDeckData.id,
            youtubeLink,
          },
        }),
      }).then((res) => res.json())

      if (!response.success) {
        throw new Error(response.error || "Failed to get YouTube transcript")
      }

      console.log("YouTube transcript retrieved successfully")

      // Initialize cards array
      deckState.cards = []

      // Check if title contains a number (e.g., "50 Physics Questions")
      const numberInTitle = response.data.title.match(/\d+/)?.[0]
      let totalQuestions

      if (numberInTitle) {
        // Use number from title, but cap it at 200
        totalQuestions = Math.min(parseInt(numberInTitle), 200)
        console.log(`Using question count from title: ${totalQuestions}`)
      } else {
        // Calculate based on word count if no number in title
        const wordsPerQuestion = 20 // Adjust this number to control density of questions
        const wordCount = response.data.transcript.split(/\s+/).length
        const calculatedQuestionCount = Math.ceil(wordCount / wordsPerQuestion)

        // Ensure questions stay within reasonable bounds (5-200)
        totalQuestions = Math.min(Math.max(calculatedQuestionCount, 5), 200)
        console.log(
          `Calculated questions from word count: ${totalQuestions} (${wordCount} words)`,
        )
      }

      const questionsPerBatch = 5
      const totalBatches = Math.ceil(totalQuestions / questionsPerBatch)

      console.log(
        `Generating ${totalQuestions} questions in ${totalBatches} batches`,
      )

      let newCards = [] // Temporary array to hold all new cards

      // Generate cards in batches of 5
      for (let batchNumber = 1; batchNumber < totalBatches; batchNumber++) {
        // for (let batchNumber = 1; batchNumber < 2; batchNumber++) {
        console.log(`Generating batch ${batchNumber} of ${totalBatches}...`)

        // Create a list of existing questions to avoid duplicates
        const existingQuestions = newCards.map((card) => card.question)

        const remainingQuestions =
          totalQuestions - (batchNumber - 1) * questionsPerBatch
        const questionsToGenerate = Math.min(
          remainingQuestions,
          questionsPerBatch,
        )

        const transcriptLength = response.data.transcript.length
        const chunkSize = Math.ceil(transcriptLength / totalBatches)
        const startIndex = (batchNumber - 1) * chunkSize // Changed from batchNumber to (batchNumber - 1)
        const endIndex = Math.min(batchNumber * chunkSize, transcriptLength)
        const transcriptChunk = response.data.transcript.substring(
          startIndex,
          endIndex,
        )

        console.log("START----->", startIndex)
        console.log("END----->", endIndex)

        const aiResponse = await fetch("/hesap/api/openai", {
          method: "POST",
          body: JSON.stringify({
            text: transcriptChunk,
            data: {
              questionsToGenerate,
              existingQuestions,
              flashcardLang,
            },
            response_format: { type: "json_object" },
          }),
        }).then((res) => res.json())

        if (!aiResponse.success) {
          throw new Error(aiResponse.error || "Failed to generate flashcards")
        }

        console.log(
          "AI RESPONSE FLASHCARDS TO CREATE CARDS=== YOUTUBE @@@",
          aiResponse.data.flashcards,
        )

        let cardsToCreate = aiResponse.data.flashcards
          .map((card) => {
            const [question, answer] = Object.values(card)
            return { question, answer }
          })
          .filter((item) => item.answer)

        console.log("CARDS TO CAREATE ", cardsToCreate)

        // After generating cards with OpenAI
        const cardResponse = await fetch("/hesap/api/card", {
          method: "POST",
          body: JSON.stringify({
            type: "createCard",
            data: {
              cards: cardsToCreate,
              deckId: deckState.id,
              dataSource: [
                {
                  type: "youtube_link",
                  source: youtubeLink,
                },
              ],
            },
          }),
        }).then((res) => res.json())

        if (!cardResponse.success) {
          throw new Error(cardResponse.error || "Failed to save cards")
        }

        // Update deckState with the newly created cards
        // deckState.cards = [...deckState.cards, ...cardResponse.data]
        // deckState = {cards: [...deckState.cards, ...cardResponse.data]}
        deckState = {
          ...deckState,
          cards: [...deckState.cards, ...cardResponse.data],
        }
        console.log("DECK STATE NEW CARDS CREATING @@@@@", deckState)
      }
      console
    } catch (error) {
      console.error("Error processing YouTube video:", error)
      youtubeLinkError = "Failed to process video. Please try again."
    } finally {
      creatingCards = false
      finishedCreatingCards = true

      // Completed deck, fill table and reduce credits
      const response = await fetch("/hesap/api/deck", {
        method: "POST",
        body: JSON.stringify({
          type: "completeDeck",
          data: {
            profileCredits: data.profile.credits,
            profile: data.profile,
            subscriptionStats: data.subscriptionStats,
          },
        }),
      }).then((res) => res.json())
      console.log("COMPLETED DECK?", response)
      credits.set(
        data.subscriptionStats.creditsAvailable - response.creditsToDeduct,
      )
    }
  }

  const handleLearnModalClose = () => {
    learnMode = "memorize"
    learn_deck_modal.close()
  }

  const selectLearnMode = (mode: string) => {
    if (mode === "memorize") {
      learnMode = mode
    }
    // Ignore clicks on disabled modes
  }

  const handleQuiz = (deckId: string) => {
    goto(`/quiz/${deckId}`)
  }

  const openRenameDeckModal = (event, deck) => {
    event.stopPropagation()
    console.log("OPENING RENAME DECK MODAL id ==", deck)
    // deckState.name = deck.title
    // deckState.id = deck.id
    console.log("RENAME DECK STATE", deckState)
    rename_deck_modal.showModal()
  }

  const handleRenameDeck = async () => {
    deckState.renaming = true
    console.log("NEW DECK NAME", deckState.name)
    console.log("CURRENT DECK ID", deckState.id)
    const response = await fetch("/hesap/api/deck", {
      method: "POST",
      body: JSON.stringify({
        type: "renameDeck",
        data: {
          id: deckState.id,
          title: deckState.name,
        },
      }),
    }).then((res) => res.json())
    console.log("RENAMED DECK@@@@", response)

    deckState.updatedName = response.data.title
    deckState.renaming = false
    rename_deck_modal.close()
  }

  const openDeleteDeckModal = (event, deck) => {
    event.stopPropagation()
    console.log("OPENING DELETE DECK MODAL id ==", deck)
    delete_deck_modal.showModal()
  }
</script>

<svelte:head>
  <title>{t.myDecks}</title>
</svelte:head>

<div class="max-w-6xl flex flex-col gap-4">
  <!-- return to my decks button -->
  <div>
    <a
      href="/hesap/kartlarim"
      aria-label="Return to my decks"
      class="inline-flex items-center justify-center w-10 h-10 rounded-full hover:bg-base-200 cursor-pointer transition-colors"
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
    </a>
  </div>
  <!-- Content area -->
  <div class="flex justify-between items-center">
    <div class="flex items-center gap-2">
      <div
        class="w-5 h-5 rounded"
        style="background-color: {deckData.deckColor}"
      ></div>
      <h1 class="text-4xl font-bold">{deckData.name}</h1>
      <div class="dropdown dropdown-end">
        <button
          class="btn btn-ghost btn-sm btn-circle text-emerald-900 hover:bg-[{deckData.deckColor}] border border-base-300"
          aria-label="Deck options"
          aria-haspopup="true"
          onclick={handleOptionsClick}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            class="w-4 h-4 stroke-current"
            ><path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
            ></path></svg
          >
        </button>
        <ul
          class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
        >
          <li>
            <button
              class="flex items-center gap-2"
              onclick={() => openRenameDeckModal(event, singleDeckData)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                ><path
                  d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
                ></path><path
                  d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
                ></path></svg
              >
              {t.renameDeck}
            </button>
          </li>
          <li>
            <button
              class="flex items-center gap-2"
              onclick={() => openDeleteDeckModal(event, singleDeckData)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                ></path>
              </svg>
              {t.deleteDeck}
            </button>
          </li>
          <!-- <li>
            <button
              class="flex items-center gap-2"
              onclick={handleOptionsClick}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                ><path
                  d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"
                ></path></svg
              >
              Change colour
            </button>
          </li>
          <li>
            <button
              class="flex items-center gap-2"
              onclick={handleOptionsClick}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"><path d="M5 9l7 7 7-7"></path></svg
              >
              Move
            </button>
          </li>
          <li>
            <button
              class="flex items-center gap-2"
              onclick={handleOptionsClick}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                ><path
                  d="M4 16v1a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                ></path></svg
              >
              Share
            </button>
          </li>
          <li>
            <button
              class="flex items-center gap-2"
              onclick={handleOptionsClick}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                ><path
                  d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                ></path></svg
              >
              Archive
            </button>
          </li> -->
        </ul>
      </div>
    </div>
    <div class="flex gap-2">
      <div class="dropdown dropdown-bottom">
        <!-- <button class="btn btn-outline gap-2">
          Add
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"><path d="m6 9 6 6 6-6" /></svg
          >
        </button>
        <ul
          class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-72"
        >
          <li>
            <button class="btn btn-ghost w-full justify-start">
              <div class="p-2 bg-base-200 rounded-lg">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  ><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" /><path
                    d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"
                  /></svg
                >
              </div>
              <div class="text-left">
                <div class="font-medium">Cards</div>
                <div class="text-sm opacity-70">Write your own cards</div>
              </div>
            </button>
          </li>
          <li>
            <button class="btn btn-ghost w-full justify-start">
              <div class="p-2 bg-base-200 rounded-lg">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  ><path d="M12 5v14" /><path d="M5 12h14" /></svg
                >
              </div>
              <div class="text-left">
                <div class="font-medium">Subdeck</div>
                <div class="text-sm opacity-70">Make a deck within a deck</div>
              </div>
            </button>
          </li>
          <li>
            <button class="btn btn-ghost w-full justify-start">
              <div class="p-2 bg-base-200 rounded-lg">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  ><path d="m3 15 4-8 4 8" /><path d="M4 13h6" /><path
                    d="M21 11V9a2 2 0 0 0-2-2h-6v4"
                  /><path d="M21 15v-2a2 2 0 0 0-2-2h-6v4" /></svg
                >
              </div>
              <div class="text-left">
                <div class="font-medium">Import</div>
                <div class="text-sm opacity-70">Notes, YouTube, PDF...</div>
              </div>
            </button>
          </li>
        </ul> -->
      </div>
      <button
        class="btn btn-primary"
        disabled={creatingCards || deckState.cards.length === 0}
        onclick={() => learn_deck_modal.showModal()}>{t.learn}</button
      >
    </div>
  </div>

  <!-- Tabs -->
  <div role="tablist" class="tabs tabs-lifted">
    <!-- TAB 1 CARDS -->
    <input
      type="radio"
      name="my_tabs_2"
      role="tab"
      class="tab"
      aria-label={t.cards}
      checked
    />
    <div
      role="tabpanel"
      class="tab-content bg-base-100 border-base-300 rounded-box p-6"
    >
      <!-- {#if cards.length > 0}
        <div>
          {#each cards as card}
            <div>
              <h3>{card.question}</h3>
              {#each card.answer as answer}
                {#if answer.correct}
                  <p>{answer.option}</p>
                {/if}
              {/each}
            </div>
          {/each}
        </div>
      {:else} -->
      <!-- TAB CONTENT -->
      <!-- creating cards -->
      {#if creatingCards}
        <!-- Full screen overlay -->
        <div class="fixed inset-0 bg-black/50 z-40"></div>

        <!-- Centered popup -->
        <div class="fixed inset-0 flex items-center justify-center z-50">
          <div
            class="bg-base-100 p-8 rounded-xl shadow-xl max-w-md w-full mx-4"
          >
            <div class="flex flex-col items-center text-center gap-4">
              <Spinner />
              <h3 class="text-2xl font-bold">{t.generatingCards}</h3>
              <p class="text-base-content/70">{t.thisMayTake}</p>
            </div>
          </div>
        </div>
      {/if}
      {#if deckState.cards.length > 0}
        <div class="flex items-center gap-4 mb-4">
          <h2 class="text-2xl font-bold">
            {t.cards} ({deckState.cards.length})
          </h2>
          <div class="flex gap-2">
            <button class="btn btn-sm btn-outline rounded-full">{t.all}</button>
          </div>
        </div>
        <div class="flex flex-col gap-4">
          {#each deckState.cards as card}
            <QACard
              {card}
              removeCard={(cardId) => {
                deckState = {
                  ...deckState,
                  cards: deckState.cards.filter((c) => c.id !== cardId),
                }
              }}
            />
          {/each}
        </div>
      {:else if !creatingCards}
        <div
          class="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center"
        >
          <!-- Empty state emoji -->
          <div class="text-6xl mb-6">👋</div>

          <!-- Empty state text -->
          <h2 class="text-3xl font-bold mb-4">{t.nothingHereYet}</h2>
          <p class="text-xl mb-8 text-base-content/70">
            {t.addCardsToStart}
          </p>

          <!-- Action buttons -->
          <div class="flex flex-col gap-4 w-full max-w-md">
            <button
              class="btn btn-primary gap-2"
              onclick={() => magic_import_modal.showModal()}
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
                  d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z"
                />
              </svg>
              {t.magicImport}
            </button>

            <button class="btn btn-outline gap-2">
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
                  d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                />
              </svg>
              {t.writeCards}
            </button>
          </div>
        </div>
      {/if}
      <!-- END TAB CONTENT     -->
    </div>

    <!-- TAB 2 LESSONS -->
    <input
      type="radio"
      name="my_tabs_2"
      role="tab"
      class="tab"
      aria-label={t.lessons}
      disabled
    />
    <div
      role="tabpanel"
      class="tab-content bg-base-100 border-base-300 rounded-box p-6"
    >
      {t.lessons}
    </div>

    <!-- TAB 3 IMPORTs -->
    <input
      type="radio"
      name="my_tabs_2"
      role="tab"
      class="tab"
      aria-label={t.imports}
      disabled
    />
    <div
      role="tabpanel"
      class="tab-content bg-base-100 border-base-300 rounded-box p-6"
    >
      {t.imports}
    </div>

    <!-- TAB 4 LEADERBOARD -->
    <input
      type="radio"
      name="my_tabs_2"
      role="tab"
      class="tab"
      aria-label={t.leaderboard}
      disabled
    />
    <div
      role="tabpanel"
      class="tab-content bg-base-100 border-base-300 rounded-box p-6"
    >
      {t.leaderboard}
    </div>
  </div>
</div>

<!-- Add deck modal -->
<dialog id="magic_import_modal" class="modal">
  <div class="modal-box max-w-3xl">
    <form method="dialog">
      <button
        class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
        onclick={handleModalClose}>✕</button
      >
    </form>

    {#if !importType}
      <h3 class="font-bold text-2xl mb-2">{t.magicImport}</h3>
      {#if $credits === 0}
        <p class="text-xl text-red-500 mb-8">You have no more credits</p>
      {:else}
        <p class="text-xl text-base-content/70 mb-8">
          {t.selectImportSource}
        </p>
      {/if}

      <div class="grid grid-cols-3 gap-4">
        <!-- Row 1 -->
        <button
          class="card bg-base-100 hover:bg-base-200 transition-colors p-6 flex items-center gap-4 {$credits ===
          0
            ? 'opacity-50 cursor-not-allowed'
            : ''}"
          onclick={() => showImportView("pdf")}
          disabled={$credits === 0}
        >
          <img src="/images/pdfimg.png" alt="PDF icon" class="w-12 h-12" />
          <span class="text-xl">PDF</span>
        </button>

        <button
          class="card bg-base-100 hover:bg-base-200 transition-colors p-6 flex items-center gap-4 {$credits ===
          0
            ? 'opacity-50 cursor-not-allowed'
            : ''}"
          onclick={() => showImportView("youtube")}
          disabled={$credits === 0}
        >
          <img
            src="/images/youtubeimg.png"
            alt="Youtube icon"
            class="w-12 h-12"
          />
          <span class="text-xl">{t.youtubeImport}</span>
        </button>

        <button
          class="card bg-base-100 transition-colors p-6 flex items-center gap-4 opacity-50 cursor-not-allowed"
          disabled
        >
          <img src="/images/ankimg.png" alt="Anki icon" class="w-12 h-12" />
          <span class="text-xl">Anki</span>
        </button>
      </div>
    {:else if importType === "pdf"}
      <h3 class="font-bold text-2xl mb-2">{t.pdfImport}</h3>
      <p class="text-xl text-base-content/70 mb-2">
        {t.selectLanguageForCards}
      </p>
      <div class="flex items-center gap-2 mb-4">
        <select
          class="select select-bordered w-full max-w-xs"
          bind:value={flashcardLang}
        >
          <option value="tr">Türkçe</option>
          <option value="en">English</option>
        </select>
      </div>
      <p class="text-xl text-base-content/70 mb-2">
        {t.uploadOrDragPdf}
      </p>

      <div class="flex items-center justify-center w-full">
        <label
          for="dropzone-file"
          class="flex flex-col items-center justify-center w-full h-64 border-2 border-base-300 border-dashed rounded-lg cursor-pointer bg-base-200 hover:bg-base-300"
        >
          <div class="flex flex-col items-center justify-center pt-5 pb-6">
            {#if selectedFile}
              <p class="mb-2 text-xl">{selectedFile.name}</p>
            {:else}
              <svg
                class="w-8 h-8 mb-4"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 20 16"
              >
                <path
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                />
              </svg>
              <p class="mb-2 text-xl">
                <span class="text-primary">{t.chooseFile}</span>
                {t.dragAndDrop}
              </p>
            {/if}
          </div>
          <input
            id="dropzone-file"
            type="file"
            class="hidden"
            accept=".pdf"
            onchange={handleFileSelect}
          />
        </label>
      </div>

      <div class="mt-8 flex justify-end gap-2">
        <button class="btn" onclick={handleBack} disabled={isGenerating}
          >{t.back}</button
        >
        <button
          class="btn btn-primary"
          onclick={handleGenerateFlashcards}
          disabled={!selectedFile || isGenerating}
        >
          {#if isGenerating}
            <Spinner /> {t.generating}
          {:else}
            {t.generateFlashcards}
          {/if}
        </button>
      </div>
    {:else if importType === "youtube"}
      <h3 class="font-bold text-2xl mb-2">{t.youtubeImport}</h3>
      <p class="text-xl text-base-content/70 mb-2">
        {t.selectLanguageForCards}
      </p>
      <div class="flex items-center gap-2 mb-4">
        <select
          class="select select-bordered w-full max-w-xs"
          bind:value={flashcardLang}
        >
          <option value="tr">Türkçe</option>
          <option value="en">English</option>
        </select>
      </div>
      <p class="text-xl text-base-content/70 mb-2">
        {t.enterYoutubeUrl}
      </p>

      <div class="form-control w-full">
        <input
          type="text"
          placeholder="https://www.youtube.com/watch?v=..."
          class="input input-bordered w-full"
          bind:value={youtubeLink}
        />
        {#if youtubeLinkError}
          <label class="label">
            <span class="label-text-alt text-error">{t.invalidYoutubeUrl}</span>
          </label>
        {/if}
      </div>

      <div class="mt-8 flex justify-end gap-2">
        <button class="btn" onclick={handleBack} disabled={creatingCards}
          >{t.back}</button
        >
        <button
          class="btn btn-primary"
          onclick={createCardsYoutubeLink}
          disabled={creatingCards}
        >
          {#if creatingCards}
            <Spinner /> {t.creating}
          {:else}
            {t.generateCards}
          {/if}
        </button>
      </div>
    {/if}
  </div>

  <form method="dialog" class="modal-backdrop">
    <button onclick={handleModalClose}>{t.close}</button>
  </form>
</dialog>
<!-- END ADD DECK MODAL -->

<!-- LEARN MODAL -->
<dialog id="learn_deck_modal" class="modal">
  <div class="modal-box max-w-3xl">
    <form method="dialog">
      <button
        class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
        onclick={handleLearnModalClose}>✕</button
      >
    </form>

    <h3 class="font-bold text-4xl mb-12 text-center">
      {#if currentLang === "en"}
        {t.learn} {singleDeckData.title}
      {:else}
        {singleDeckData.title} {t.learn}
      {/if}
    </h3>

    <div class="flex flex-col md:grid md:grid-cols-3 gap-4 md:gap-8">
      <button
        class="card bg-base-100 transition-colors p-4 md:p-8 flex flex-row md:flex-col items-center gap-4 opacity-50 cursor-not-allowed"
        disabled
      >
        <img
          src="/images/parrot.png"
          alt="Parrot"
          class="w-12 h-12 md:w-24 md:h-24"
        />
        <div class="text-left md:text-center flex-1">
          <div class="text-xl md:text-2xl font-bold mb-0 md:mb-2">
            {t.understand}
          </div>
          <div class="text-base-content/70 text-sm md:text-base">
            {t.comingSoon}
          </div>
        </div>
      </button>

      <button
        class="card bg-base-100 hover:bg-base-200 transition-colors p-4 md:p-8 flex flex-row md:flex-col items-center gap-4 ring-2 ring-primary"
        onclick={() => selectLearnMode("memorize")}
      >
        <img
          src="/images/book.png"
          alt="Book"
          class="w-12 h-12 md:w-24 md:h-24"
        />
        <div class="text-left md:text-center flex-1">
          <div class="text-xl md:text-2xl font-bold mb-0 md:mb-2">
            {t.memorize}
          </div>
          <div class="text-base-content/70 text-sm md:text-base">
            {t.activeRecallQuizzes}
          </div>
        </div>
      </button>

      <button
        class="card bg-base-100 transition-colors p-4 md:p-8 flex flex-row md:flex-col items-center gap-4 opacity-50 cursor-not-allowed"
        disabled
      >
        <img
          src="/images/racecarimg.png"
          alt="Race car"
          class="w-12 h-12 md:w-24 md:h-24"
        />
        <div class="text-left md:text-center flex-1">
          <div class="text-xl md:text-2xl font-bold mb-0 md:mb-2">
            {t.timeTrial}
          </div>
          <div class="text-base-content/70 text-sm md:text-base">
            {t.comingSoon}
          </div>
        </div>
      </button>
    </div>

    <div class="mt-8 md:mt-12 flex justify-center">
      <button
        class="btn btn-primary btn-lg w-full md:w-64 rounded-full text-lg"
        disabled={!learnMode}
        onclick={() => {
          /* Handle continue */
          handleQuiz(singleDeckData.id)
        }}
      >
        {t.start}
      </button>
    </div>
  </div>

  <form method="dialog" class="modal-backdrop">
    <button onclick={handleLearnModalClose}>{t.close}</button>
  </form>
</dialog>

<!-- RENAME DECK modal -->
<RenameDeckModal
  renamingDeck={deckState.renaming}
  {handleRenameDeck}
  bind:newDeckName={deckState.name}
/>

<!-- Delete deck modal -->
<dialog id="delete_deck_modal" class="modal">
  <div class="modal-box">
    <h3 class="font-bold text-lg mb-4">{t.deleteDeck}</h3>
    <p class="mb-4">
      {t.areYouSureDelete} "{deckData.name}"? {t.cannotBeUndone}
    </p>
    <div class="modal-action">
      <form method="dialog" class="flex gap-2">
        <button class="btn">{t.cancel}</button>
        <button
          class="btn btn-error"
          onclick={() => {
            fetch("/hesap/api/deck", {
              method: "POST",
              body: JSON.stringify({
                type: "deleteDeck",
                data: {
                  id: deckState.id,
                },
              }),
            })
              .then((res) => res.json())
              .then((response) => {
                if (response.success) {
                  goto("/hesap/kartlarim")
                }
              })
          }}
        >
          {t.delete}
        </button>
      </form>
    </div>
  </div>
  <form method="dialog" class="modal-backdrop">
    <button>{t.close}</button>
  </form>
</dialog>
