/* ================== config ================== */
const NOMINATIM_GEOCODE = "https://nominatim.openstreetmap.org/search?format=json&q=";

/* ================== DOM ================== */
const cityInput = document.getElementById("cityInput");
const getPrayerTimesBtn = document.getElementById("getPrayerTimesBtn");
const getLocationBtn = document.getElementById("getLocationBtn");
const langBtn = document.getElementById("langBtn");
const prayerSection = document.getElementById("prayerSection");
const prayerList = document.getElementById("prayerList");
const prayerTitle = document.getElementById("prayerTitle");
const prayerSub = document.getElementById("prayerSub");
const azkarBox = document.getElementById("azkarBox");
const titleEl = document.getElementById("title");
const subtitleEl = document.getElementById("subtitle");
const creator = document.getElementById("creator");
const instaText = document.getElementById("instaText");

// التعديل: إضافة تعريف لروابط الفوتر الجديدة
const privacyText = document.getElementById("privacyText");
const aboutText = document.getElementById("aboutText");
const contactText = document.getElementById("contactText");


/* ================== Translations ================== */
const translations = {
  ar: {
    title: "مواقيت الصلاة",
    subtitle: 'اضغط "استخدم موقعي" لحساب المواقيت تلقائيًا أو اكتب اسم مدينتك ثم اضغط "عرض المواقيت"',
    placeholder: "اكتب اسم مدينتك أو محافظتك هنا",
    useLocation: "استخدام موقعي",
    showTimes: "عرض المواقيت",
    languageBtn: "English",
    prayerTitle: "مواقيت اليوم",
    creator: "المصمم: إسلام عماد",
    instaText: "إنستجرام",
    // التعديل: إضافة النصوص الجديدة هنا
    privacy: "سياسة الخصوصية",
    about: "من نحن",
    contact: "تواصل معنا",
    errors: {
      noCity: "من فضلك اكتب اسم المدينة",
      notFound: "لم يتم العثور على مواقيت للمدينة، حاول اسمًا آخر",
      geoDenied: "لم يتم السماح بالوصول إلى الموقع"
    }
  },
  en: {
    title: "Prayer Times",
    subtitle: 'Click "Use My Location" to get times automatically or type your city and click "Show Times"',
    placeholder: "Enter your city or region here",
    useLocation: "Use My Location",
    showTimes: "Show Times",
    languageBtn: "عربي",
    prayerTitle: "Today's Prayer Times",
    creator: "Created by Eslam Emad",
    instaText: "Instagram",
    // التعديل: إضافة النصوص الجديدة هنا
    privacy: "Privacy Policy",
    about: "About Us",
    contact: "Contact Us",
    errors: {
      noCity: "Please enter a city name",
      notFound: "No timings found for that city",
      geoDenied: "Location access denied"
    }
  }
};

/* ================== state ================== */
let currentLang = localStorage.getItem("siteLang") || "ar";

/* ================== helper: apply language ================== */
function applyLanguage() {
  const t = translations[currentLang];

  titleEl.textContent = t.title;
  subtitleEl.textContent = t.subtitle;
  cityInput.placeholder = t.placeholder;
  getLocationBtn.textContent = t.useLocation;
  getPrayerTimesBtn.textContent = t.showTimes;
  langBtn.textContent = t.languageBtn;
  prayerTitle.textContent = t.prayerTitle;
  creator.textContent = t.creator;
  instaText.textContent = t.instaText;

  // التعديل: إضافة تحديث لروابط الفوتر هنا
  privacyText.textContent = t.privacy;
  aboutText.textContent = t.about;
  contactText.textContent = t.contact;

  if (currentLang === "ar") {
    document.body.classList.remove("ltr");
    document.body.setAttribute("dir", "rtl");
  } else {
    document.body.classList.add("ltr");
    document.body.setAttribute("dir", "ltr");
  }

  localStorage.setItem("siteLang", currentLang);
}

applyLanguage();

/* ================== Azkar rotation ================== */
const azkarList = [
  "سبحان الله وبحمده",
  "الحمد لله",
  "لا إله إلا الله",
  "الله أكبر",
  "لا حول ولا قوة إلا بالله"
];
let azkarIndex = 0;
setInterval(() => {
  azkarBox.textContent = azkarList[azkarIndex];
  azkarIndex = (azkarIndex + 1) % azkarList.length;
}, 5000);

/* ================== Render prayer times ================== */
function renderPrayerTimes(timings, locationLabel = "") {
  prayerSection.classList.remove("d-none");
  prayerList.innerHTML = "";

  prayerSub.textContent = locationLabel || "";

  const order = [
    { key: "Fajr", labelAr: "الفجر", labelEn: "Fajr" },
    { key: "Sunrise", labelAr: "الشروق", labelEn: "Sunrise" },
    { key: "Dhuhr", labelAr: "الظهر", labelEn: "Dhuhr" },
    { key: "Asr", labelAr: "العصر", labelEn: "Asr" },
    { key: "Maghrib", labelAr: "المغرب", labelEn: "Maghrib" },
    { key: "Isha", labelAr: "العشاء", labelEn: "Isha" }
  ];

  order.forEach(item => {
    const val = timings[item.key];
    if (!val) return;
    const row = document.createElement("div");
    row.className = "prayer-row";
    const label = document.createElement("div");
    label.className = "prayer-label";
    label.textContent = (currentLang === "ar") ? item.labelAr : item.labelEn;
    const time = document.createElement("div");
    time.className = "prayer-time";
    time.textContent = val;
    row.appendChild(label);
    row.appendChild(time);
    prayerList.appendChild(row);
  });

  prayerSection.scrollIntoView({ behavior: "smooth", block: "center" });
}

/* ================== Fetch by coordinates ================== */
async function fetchByCoords(lat, lon) {
  const url = `https://api.aladhan.com/v1/timings?latitude=${encodeURIComponent(lat)}&longitude=${encodeURIComponent(lon)}&method=5`;
  try {
    const res = await fetch(url);
    const json = await res.json();
    if (!json || !json.data) {
      alert(translations[currentLang].errors.notFound);
      return;
    }
    const timings = json.data.timings;
    const dateReadable = json.data.date?.readable || "";
    const locLabel = dateReadable ? `(${dateReadable})` : "";
    renderPrayerTimes(timings, locLabel);
  } catch (err) {
    console.error(err);
    alert(translations[currentLang].errors.notFound);
  }
}

/* ================== Fetch by city ================== */
async function fetchByCity(city) {
  const encodedCity = encodeURIComponent(city);
  const geocodeUrl = `${NOMINATIM_GEOCODE}${encodedCity}`;

  try {
    const geoRes = await fetch(geocodeUrl);
    const geoJson = await geoRes.json();

    if (!geoJson || geoJson.length === 0) {
      alert(translations[currentLang].errors.notFound);
      return;
    }

    const lat = geoJson[0].lat;
    const lon = geoJson[0].lon;

    await fetchByCoords(lat, lon);

  } catch (err) {
    console.error("Geocoding or fetch error:", err);
    alert(translations[currentLang].errors.notFound);
  }
}

/* ================== Events ================== */
getPrayerTimesBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if (!city) {
    alert(translations[currentLang].errors.noCity);
    return;
  }
  fetchByCity(city);
});

getLocationBtn.addEventListener("click", () => {
  if (!navigator.geolocation) {
    alert(translations[currentLang].errors.geoDenied);
    return;
  }
  navigator.geolocation.getCurrentPosition(pos => {
    const { latitude, longitude } = pos.coords;
    fetchByCoords(latitude, longitude);
  }, () => {
    alert(translations[currentLang].errors.geoDenied);
  });
});

langBtn.addEventListener("click", () => {
  currentLang = (currentLang === "ar") ? "en" : "ar";
  applyLanguage();
});

cityInput.addEventListener("keyup", (e) => {
  if (e.key === "Enter") {
    getPrayerTimesBtn.click();
  }
});
