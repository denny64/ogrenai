<script lang="ts">
  import {
    WebsiteName,
    WebsiteBaseUrl,
    WebsiteDescription,
  } from "./../../config"
  import { onMount } from "svelte"
  import { language } from "$lib/stores/language"

  // Use the language store instead of local state
  let currentLang = $state<"en" | "tr">("tr")

  onMount(() => {
    // Initialize from the store
    const unsubscribe = language.subscribe((value) => {
      currentLang = value
    })

    return unsubscribe
  })

  const translations = {
    en: {
      startLearning: "Start Learning",
      heroTitle: "The easiest way to learn",
      aiTitle: "A.I. makes flashcards",
      learningEasy: "ÖğrenAI makes learning easy",
      aiMakesFlashcards: "A.I. makes flashcards",
      aiDescription:
        "AI that turns what you're learning into flashcards so you don't have to",
      aiButtonText: "Use A.I. to make flashcards",
      importTitle: "Import from anywhere",
      spacedTitle: "Spaced repetition + Active recall",
      spacedDescription:
        "Spaced repetition and active recall by quizzing yourself on topics of interest",
      spacedButtonText: "Use spaced repetition",
      testimonialTitle: "Loved by students...",
      madeForTitle: "Designed for Turkish students",
      lovelyPeople: "Lovely people",
      toBenefitAll: "To benefit all...",
      reply: "Reply",
    },
    tr: {
      startLearning: "Öğrenmeye başla",
      heroTitle: "Öğrenmenin en kolay yolu",
      aiTitle: "Yapay zeka flash kartlar oluşturur",
      learningEasy: "ÖğrenAI ile öğrenmek artık çok kolay",
      aiMakesFlashcards: "AI senin için ders notlarını kartlara çeviri",
      aiDescription:
        "Öğrendiklerini anında flashcard’a çeviren AI!",
      aiButtonText: "Yapay zekâyla hızlı ve kolay flashcard oluştur!",
      importTitle: "Her yerden içerik aktar",
      spacedTitle: "Aralıklı tekrar + Aktif hatırlama",
      spacedDescription: "Kendine sor, daha iyi öğren!",
      spacedButtonText: "Aralıklı tekrar ile kalıcı öğren!",
      testimonialTitle: "Öğrencilerin favorisi",
      madeForTitle: "Türk öğrenciler için tasarlandı",
      lovelyPeople: "Harika insanlar",
      toBenefitAll: "Herkesin faydalanması için...",
      reply: "Cevap vermak",
    },
  }

  let t = $state(translations.tr)

  $effect(() => {
    console.log("Language changed to:", currentLang)
    t = currentLang === "en" ? translations.en : translations.tr
  })

  const ldJson = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: WebsiteName,
    url: WebsiteBaseUrl,
  }
  const jsonldScript = `<script type="application/ld+json">${
    JSON.stringify(ldJson) + "<"
  }/script>`

  const testimonials = [
    {
      name: "Ayşe Demir",
      profilePicture: "/images/ayse.png",
      testimonial: "“Sonunda… Ders çalışmak artık daha kolay.”",
      likes: 10,
      when: 14,
    },
    {
      name: "Mert Yıldız",
      profilePicture: "/images/mert.png",
      testimonial: "“YKS’de yüksek net yapmamda gerçekten işe yaradı.”",
      likes: 45,
      when: 2,
    },
    {
      name: "Zeynep Kaya",
      profilePicture: "/images/kaya.png",
      testimonial: "“Konuları tekrar etmek için birebir.”",
      likes: 28,
      when: 5,
    },
    {
      name: "Mehmet Arslan",
      profilePicture: "/images/mehmet.png",
      testimonial: "“Harika!”",
      likes: 67,
      when: 8,
    },
    {
      name: "Elif Yılmaz",
      profilePicture: "/images/elif.png",
      testimonial: "“Ders çalışmayı daha eğlenceli hale getiriyor.”",
      likes: 33,
      when: 1,
    },
    {
      name: "Büşra Karaca",
      profilePicture: "/images/busra.png",
      testimonial: "“Aşırı şaşırdım, müthiş bir şey bu!”",
      likes: 89,
      when: 3,
    },
    // {
    //   name: "David Kim",
    //   profilePicture: "https://randomuser.me/api/portraits/men/7.jpg",
    //   testimonial: "Helped me prepare for my chemistry exam",
    //   likes: 52,
    //   when: 6,
    // },
    // {
    //   name: "Lisa Brown",
    //   profilePicture: "https://randomuser.me/api/portraits/women/8.jpg",
    //   testimonial: "The AI feedback is incredibly helpful",
    //   likes: 41,
    //   when: 9,
    // },
    // {
    //   name: "James Wilson",
    //   profilePicture: "https://randomuser.me/api/portraits/men/9.jpg",
    //   testimonial: "Makes studying less boring",
    //   likes: 73,
    //   when: 4,
    // },
    // {
    //   name: "Sophie Martin",
    //   profilePicture: "https://randomuser.me/api/portraits/women/10.jpg",
    //   testimonial: "Love the variety of subjects available",
    //   likes: 95,
    //   when: 7,
    // },
    // {
    //   name: "Ryan Cooper",
    //   profilePicture: "https://randomuser.me/api/portraits/men/11.jpg",
    //   testimonial: "Perfect for self-paced learning",
    //   likes: 61,
    //   when: 11,
    // },
    // {
    //   name: "Anna Lee",
    //   profilePicture: "https://randomuser.me/api/portraits/women/12.jpg",
    //   testimonial: "Really helps with retention",
    //   likes: 84,
    //   when: 13,
    // },
    // {
    //   name: "Tom Anderson",
    //   profilePicture: "https://randomuser.me/api/portraits/men/13.jpg",
    //   testimonial: "Great for quick knowledge checks",
    //   likes: 47,
    //   when: 15,
    // },
    // {
    //   name: "Julia Santos",
    //   profilePicture: "https://randomuser.me/api/portraits/women/14.jpg",
    //   testimonial: "Excellent study companion",
    //   likes: 56,
    //   when: 10,
    // },
    // {
    //   name: "Kevin Park",
    //   profilePicture: "https://randomuser.me/api/portraits/men/15.jpg",
    //   testimonial: "Makes complex topics easier to understand",
    //   likes: 92,
    //   when: 12,
    // },
    // {
    //   name: "Rachel Green",
    //   profilePicture: "https://randomuser.me/api/portraits/women/16.jpg",
    //   testimonial: "Very intuitive and user-friendly",
    //   likes: 78,
    //   when: 16,
    // },
    // {
    //   name: "Daniel Martinez",
    //   profilePicture: "https://randomuser.me/api/portraits/men/17.jpg",
    //   testimonial: "Highly recommend for students",
    //   likes: 63,
    //   when: 18,
    // },
    // {
    //   name: "Emily Taylor",
    //   profilePicture: "https://randomuser.me/api/portraits/women/18.jpg",
    //   testimonial: "The AI adapts to my learning style",
    //   likes: 88,
    //   when: 17,
    // },
  ]
</script>

<svelte:head>
  <title>{WebsiteName}</title>
  <meta name="description" content={WebsiteDescription} />
  <!-- eslint-disable-next-line svelte/no-at-html-tags -->
  {@html jsonldScript}
</svelte:head>

<div class="hero min-h-[60vh]">
  <div class="hero-content text-center py-12">
    <div class="max-w2-xl">
      <!-- <div
        class="text-xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent mb-3 md:mb-7 pb-1"
      >
        A.I quizzes that make learning easy
      </div> -->

      <div
        class="text-4xl md:text-6xl font-bold px-2"
        style="line-height: 1.2;"
      >
        {#if currentLang === "tr"}
          Öğrenmenin
          <span
            class="underline decoration-secondary decoration-4 md:decoration-[6px]"
            >en kolay</span
          >
          yolu
        {:else}
          The
          <span
            class="underline decoration-secondary decoration-4 md:decoration-[6px]"
            >easiest</span
          >
          way to
          <span
            class="underline decoration-secondary decoration-4 md:decoration-[6px]"
            >learn</span
          >
        {/if}
      </div>
      <!-- <div class="mt-6 md:mt-10 text-sm md:text-lg">
        Built with <a
          href="https://kit.svelte.dev"
          class="link font-bold"
          target="_blank">SvelteKit</a
        >,
        <a href="https://supabase.com" class="link font-bold" target="_blank"
          >Supabase</a
        >,
        <a href="https://stripe.com" class="link font-bold" target="_blank"
          >Stripe</a
        >,
        <a href="https://tailwindcss.com" class="link font-bold" target="_blank"
          >Tailwind</a
        >,
        <a href="https://daisyui.com" class="link font-bold" target="_blank"
          >DaisyUI</a
        >, and
        <a
          href="https://www.postgresql.org"
          class="link font-bold"
          target="_blank">Postgres</a
        >
      </div> -->
      <div class="mt-6 md:mt-2">
        <!-- <a href="https://github.com/CriticalMoments/CMSaasStarter">
          <button class="btn btn-primary btn-sm px-6">★ us on Github</button>
        </a> -->
        <!-- START LEARNING BUTTON IN TURKISH -->
        <a href="/hesap/kartlarim">
          <button class="btn btn-soft btn-info btn-lg px-6 mt-3 mx-2"
            >{t.startLearning}</button
          >
        </a>
      </div>

      <div
        class="mt-8 w-full max-w-4xl mx-auto rounded-lg overflow-hidden shadow-lg"
      >
        <img
          src="/images/dash.png"
          alt="Product interface showing flashcard decks"
          class="w-full h-auto"
        />
      </div>
    </div>
  </div>
</div>
<!-- FEATURE 1 SECTION -->
<div class="min-h-[60vh] bg-white">
  <div class="max-w-6xl mx-auto px-4 py-20">
    <h1 class="text-4xl md:text-6xl font-bold text-center mb-16">
      ÖğrenAI {t.heroTitle}
    </h1>

    <div class="grid md:grid-cols-2 gap-12 items-center">
      <!-- Left side content -->
      <div>
        <h2 class="text-3xl md:text-4xl font-bold mb-4">
          {t.aiTitle}
        </h2>
        <p class="text-gray-600 text-lg mb-8">
          {t.aiDescription}
        </p>
        <a href="/hesap/kartlarim">
          <button class="btn btn-outline btn-primary btn-lg rounded-full px-8">
            {t.aiButtonText}
          </button>
        </a>
      </div>

      <!-- Right side card -->
      <div class="bg-white rounded-3xl shadow-lg p-8">
        <h3 class="text-2xl font-bold mb-8">{t.importTitle}</h3>
        <div class="grid grid-cols-2 gap-6">
          <div class="flex flex-col items-center gap-2">
            <img
              src="images/youtubeimg.png"
              alt="YouTube import"
              class="w-16 h-16 rounded-2xl shadow-md"
            />
            <span class="text-sm font-medium">Youtube</span>
          </div>
          <div class="flex flex-col items-center gap-2">
            <img
              src="images/pdfimg.png"
              alt="PDF import"
              class="w-16 h-16 rounded-2xl shadow-md"
            />
            <span class="text-sm font-medium">PDF</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
<!-- FEATURE 2 SECTION -->
<div class="bg-base-200">
  <div class="max-w-6xl mx-auto px-4 py-20">
    <!-- <h1 class="text-4xl md:text-6xl font-bold text-center mb-16">
      ÖğrenAI makes learning easy
    </h1> -->

    <div class="grid md:grid-cols-2 gap-12 items-center">
      <!-- Left side card (formerly right side) -->
      <div class="bg-white rounded-3xl shadow-lg p-8">
        <img
          src="/images/quiz.png"
          alt="Quiz interface example"
          class="w-full h-auto rounded-2xl max-w-[400px] mx-auto block"
        />
      </div>

      <!-- Right side content (formerly left side) -->
      <div>
        <h2 class="text-3xl md:text-4xl font-bold mb-4">
          {t.spacedTitle}
        </h2>
        <p class="text-gray-600 text-lg mb-8">
          {t.spacedDescription}
        </p>
        <a href="/hesap/kartlarim">
          <button class="btn btn-outline btn-primary btn-lg rounded-full px-8">
            {t.spacedButtonText}
          </button>
        </a>
      </div>
    </div>
  </div>
</div>
<!-- testimonials SECTION -->
<div class="min-h-[60vh]">
  <div class="pt-20 pb-20 px-7">
    <div class="max-w-4xl mx-auto text-center">
      <div
        class="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent pb-2"
      >
        {t.testimonialTitle}
      </div>
    </div>

    <div
      class="flex gap-6 mt-12 max-w-[1064px] mx-auto place-content-center flex-wrap"
    >
      {#each testimonials as testimonial}
        <div
          class="card bg-white w-[320px] min-h-[120px] flex-none shadow-lg rounded-xl"
        >
          <div class="card-body p-4">
            <div class="flex items-center gap-3">
              <img
                src={testimonial.profilePicture}
                alt={testimonial.name}
                class="w-10 h-10 rounded-full"
              />
              <div class="flex-1">
                <h3 class="font-semibold text-sm">{testimonial.name}</h3>
              </div>
            </div>

            <p class="text-sm mt-2 mb-2">
              {testimonial.testimonial}
            </p>

            <div class="flex items-center gap-2 text-sm text-gray-500">
              <span>{testimonial.when}d</span>
              <span>·</span>
              <span>{t.reply}</span>
              <div class="flex-1"></div>
              <div class="flex items-center gap-1">
                <svg
                  class="w-4 h-4 text-red-500 fill-current"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                  />
                </svg>
                <span>{testimonial.likes}</span>
              </div>
            </div>
          </div>
        </div>
      {/each}
    </div>
  </div>
</div>
<!-- another section -->
<div class="bg-base-200">
  <div class="pt-20 pb-20 px-7">
    <div class="max-w-4xl mx-auto text-center">
      <div
        class="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent pb-2"
      >
        {t.madeForTitle}
      </div>
      <button class="btn btn-primary btn-lg rounded-full px-8 mt-6">
        {t.startLearning}
      </button>
    </div>
  </div>
</div>

<!-- another section -->
<!-- <div
class="flex gap-6 mt-12 max-w-[1064px] mx-auto place-content-center flex-wrap"
>
{#each features as feature}
  <div class="card bg-white w-[270px] min-h-[300px] flex-none shadow-xl">
    <div class="card-body items-center text-center p-[24px] pt-[32px]">
      <div>
        <svg
          width="50px"
          height="50px"
          class="mb-2 mt-1"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {@html feature.svgContent}
        </svg>
      </div>
      <h2 class="card-title">
        {feature.name}
      </h2>
      <p class="text-sm">
        {feature.description}
      </p>
      {#if feature.link}
        <a
          href={feature.link}
          class="pb-4"
          target={feature.newPage ? "_blank" : ""}
        >
          <button
            class="btn btn-xs btn-outline rounded-full btn-primary min-w-[100px]"
            >{feature.linkText ? feature.linkText : "Try It"}</button
          >
        </a>
      {/if}
    </div>
  </div>
{/each}
</div> -->

<!-- end sec -->
<!-- <div class="hero min-h-[60vh] mt-12">
  <div class="hero-content text-center pb-16 pt-4 px-4">
    <div class="max-w-lg">
      <div
        class="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent mt-4 pb-2"
      >
        See it in Action
      </div>
      <div
        class="flex flex-col lg:flex-row mt-6 gap-6 place-content-center content-center"
      >
        <div class="hidden md:block">
          <a href="https://criticalmoments.io" target="_blank" class="link">
            <div class="mockup-browser border">
              <div class="mockup-browser-toolbar">
                <div class="input" style="background:#eee;">
                  https://criticalmoments.io
                </div>
              </div>
              <div class="flex justify-center">
                <img
                  alt="Screenshot of criticalmoments.io homepage"
                  class="aspect-[2044/1242]"
                  src="/images/example-home.png"
                />
              </div>
            </div>
          </a>
        </div>
        <div class="md:hidden">
          <a href="https://criticalmoments.io" target="_blank" class="link">
            <div class="card shadow-xl border overflow-hidden">
              <img
                alt="Screenshot of criticalmoments.io homepage"
                class="aspect-[2044/1242]"
                src="/images/example-home.png"
              />
            </div></a
          >
        </div>
        <div class="min-w-[270px] lg:min-w-[420px] flex mt-6 lg:mt-0">
          <div class="my-auto">
            <div class="px-4 text-lg md:text-xl">
              <a href="https://criticalmoments.io" class="" target="_blank"
                >SaaS Starter was created by <span
                  class="font-bold whitespace-nowrap">Critical Moments</span
                >: a SDK to to help mobile apps
                <span class="underline decoration-secondary decoration-[3px]"
                  >increase conversion rates and app-ratings.</span
                ></a
              >
            </div>
            <div class="px-4 mt-6 text-lg md:text-xl">
              Our <a
                href="https://criticalmoments.io"
                class="link font-bold"
                target="_blank">webpage</a
              > is the best example of SaaS Starter with style and real content.
            </div>
            <div class="mt-4 text-large">
              <a href="https://criticalmoments.io" target="_blank">
                <button class="btn btn-primary btn-wide mt-3"
                  >See it in Action</button
                >
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div> -->
