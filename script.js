/* ==========================================================
   AR TECHNICIAN WORK - INTERACTIVE SCRIPT & I18N
   ========================================================== */

/* Netlify Badge Suppression: Prevents floating Netlify badge or drawer from covering buttons/text */
(function suppressNetlifyBadge() {
  function purgeNetlifyElements() {
    const selectors = [
      'iframe[src*="netlify"]',
      'iframe[title*="netlify" i]',
      'iframe[id*="netlify" i]',
      'iframe[class*="netlify" i]',
      '#netlify-badge',
      '.netlify-badge',
      'netlify-drawer',
      '#netlify-feedback-drawer',
      '.netlify-feedback-drawer',
      '[data-netlify-drawer]',
      'div[class*="netlify-badge"]',
      'div[id*="netlify-badge"]'
    ];
    selectors.forEach(sel => {
      try {
        const found = document.querySelectorAll(sel);
        found.forEach(el => {
          el.style.setProperty('display', 'none', 'important');
          el.style.setProperty('visibility', 'hidden', 'important');
          el.style.setProperty('pointer-events', 'none', 'important');
          el.style.setProperty('opacity', '0', 'important');
          el.style.setProperty('position', 'fixed', 'important');
          el.style.setProperty('bottom', '-9999px', 'important');
          try { el.remove(); } catch (e) {}
        });
      } catch (e) {}
    });
  }

  purgeNetlifyElements();
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', purgeNetlifyElements);
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('load', purgeNetlifyElements);
      setTimeout(purgeNetlifyElements, 300);
      setTimeout(purgeNetlifyElements, 1000);
      setTimeout(purgeNetlifyElements, 2500);
    }
    if (typeof MutationObserver !== 'undefined' && document.documentElement) {
      try {
        const obs = new MutationObserver(purgeNetlifyElements);
        obs.observe(document.documentElement, { childList: true, subtree: true });
      } catch (e) {}
    }
  }
})();

const API_BASE = (typeof window !== 'undefined' && (window.location.protocol === 'file:' || (window.location.port && window.location.port !== '3000'))) ? 'http://localhost:3000' : '';

async function safeApiFetch(urlPath, options = {}) {
  // Candidate base URLs to try in order
  const candidateBases = [];
  if (typeof window !== 'undefined' && window.location && window.location.protocol.startsWith('http')) {
    candidateBases.push(''); // Same origin first if on HTTP/HTTPS
  }
  if (!candidateBases.includes('http://localhost:3000')) candidateBases.push('http://localhost:3000');
  if (!candidateBases.includes('http://127.0.0.1:3000')) candidateBases.push('http://127.0.0.1:3000');
  if (!candidateBases.includes('http://localhost:4000')) candidateBases.push('http://localhost:4000');
  if (!candidateBases.includes('http://127.0.0.1:4000')) candidateBases.push('http://127.0.0.1:4000');

  let lastErr = null;
  for (const base of candidateBases) {
    try {
      const url = base ? `${base}${urlPath}` : urlPath;
      const res = await fetch(url, {
        ...options,
        headers: {
          'Accept': 'application/json',
          ...(options.headers || {})
        }
      });

      // Safely read response as text FIRST - never call res.json() directly
      // This prevents "Unexpected end of JSON input" and "Unexpected token '<'" errors.
      const text = await res.text();
      if (text && text.trim().length > 0) {
        try {
          const json = JSON.parse(text);
          return { ok: res.ok, status: res.status, data: json };
        } catch (parseErr) {
          // Response body was HTML (e.g. 404 from Live Server) or invalid JSON
          lastErr = parseErr;
        }
      } else {
        // Empty body returned
        if (res.ok) {
          return { ok: res.ok, status: res.status, data: {} };
        }
      }
    } catch (netErr) {
      lastErr = netErr;
    }
  }
  return { ok: false, status: 0, isHtmlOrOffline: true, data: null, error: lastErr };
}

let currentLanguage = 'en';

const translations = {
  en: {
    top_location: "Kosamba, Surat",
    lang_label: "Language:",
    btn_translate: "Translate",
    nav_home: "Home",
    nav_services: "Services",
    nav_location: "Location & Shop",
    nav_tracker: "Track Order",
    nav_contact: "Contact",
    hero_btn_location: "View Shop & Location",
    nav_admin: "Admin",
    nav_login: "Login",
    nav_book: "Book Repair",
    hero_badge: '<i class="fas fa-solid fa-screwdriver-wrench"></i> In-Shop Service <i class="fas fa-solid fa-house"></i> At-Home Repair Service',
    hero_title: 'Gas & Electrical Repair <span class="gradient-text">Shop and Home Service</span>',
    hero_subtitle: "We provide reliable gas, electrical, and industrial equipment repair services at our shop and your home. From gas stoves and induction cooktops to water pumps, coolers, and electrical wiring, we help keep your appliances and equipment working safely.",
    hero_mode_home_title: "At-Home Service",
    hero_mode_home_desc: "Technician visits your home for repairs",
    hero_mode_shop_title: "Shop Visit",
    hero_mode_shop_desc: "Visit our Shop for repair and servicing",
    hero_btn_book: "Request Home Technician",
    hero_btn_estimate: "Estimate Cost",
    coverage_title: "Check At-Home Doorstep Service Availability",
    coverage_desc: "Enter your ZIP or area postal code to verify if our mobile technician can visit your home today.",
    coverage_input_ph: "e.g. 394120",
    coverage_btn: "Check Now",
    estimator_badge: '<i class="fas fa-hand-holding-dollar"></i> Upfront Rate Card',
    estimator_title: "Instant Repair Price Estimator",
    estimator_subtitle: "Choose whether you prefer doorstep service at your home or dropping off at our local shop.",
    estimator_step1: "1. Choose Repair Location:",
    estimator_loc_home: "At-Home Service",
    estimator_loc_home_sub: "Tech visits your home",
    estimator_loc_shop: "Local Shop Visit",
    estimator_loc_shop_sub: "Drop off at counter",
    estimator_step2: "2. Select Electronic Item:",
    cat_tv: "Smart TV",
    cat_mobile: "Mobile/Tablet",
    cat_laptop: "Laptop/PC",
    cat_fridge: "Fridge/AC PCB",
    cat_microwave: "Microwave",
    cat_fan: "Appliance PCB",
    quote_title: "Estimated Service Quote",
    quote_home_visit: "🏡 Doorstep Home Visit Included",
    quote_shop_visit: "🏪 In-Shop Express Drop-off",
    quote_time_lbl: "Estimated Time:",
    quote_warranty: "Includes 90-Day Repair Warranty",
    quote_book_btn: "Book This Service",
    services_badge: '<i class="fas fa-screwdriver"></i> All Equipment & Appliances Covered',
    services_title: "Shop & Home Repair Services",
    services_subtitle: "We bring specialized tools to your doorstep or handle deep component repairs in our Kosamba workshop bench.",
    s_badge_doorstep_shop: "Doorstep & Shop",
    s_badge_express: "In-Shop & Express",
    s_badge_home: "At-Home Service",
    s1_title: "Domestic & Industrial Gas Stoves",
    s1_desc: "Repair & servicing for LPG gas stoves, commercial bhattis, industrial gas burners, pipeline fittings, regulators, and leak prevention.",
    s2_title: "Electric Infrared & Induction Cooktops",
    s2_desc: "Component-level repairs for infrared cookers and induction stoves, heating coils, IGBT circuit boards, sensor errors, and touch panels.",
    s3_title: "Mixers & Industrial Mixture Machines",
    s3_desc: "Motor rewinding, jar coupling replacement, blade sharpness, and heavy-duty repairs for domestic mixers & commercial industrial grinders.",
    s4_title: "Pressure Cookers & Kitchen Appliances",
    s4_desc: "Complete servicing for domestic & commercial pressure cookers, whistle weights, rubber gaskets, safety valves, handles, and body reshaping.",
    s5_title: "Agricultural Spray Pumps (Dawa Ke Pump)",
    s5_desc: "Battery-operated farm sprayers, pesticide knapsack pumps, 12V pressure motor repair, battery replacement, charger port, and nozzle cleaning.",
    s6_title: "Coolers, Fans & Complete Electrical Wiring",
    s6_desc: "Air cooler motor & water pump repair, ceiling/exhaust fan winding, capacitor fix, and complete home & commercial electrical wiring (\"Kuchh bhi wiring\").",
    tracker_badge: "LIVE GPS TECHNICIAN TRACKER",
    tracker_title: 'Live Interactive <span class="gradient-text">Doorstep Route Tracking</span>',
    tracker_desc: "Real-time map tracking: monitor your assigned electrician's live vehicle movement, route, speed, and arrival time right on the map!",
    tracker_input_ph: "Paste 4-digit code e.g. HOME-1234 to track electrician",
    tracker_btn: "Track Live Location",
    tracker_demos: "Try Demo Codes:",
    contact_badge: '<i class="fas fa-location-dot"></i> Neighborhood Shop',
    contact_title: "Visit Our Local Shop",
    contact_subtitle: "Not sure if your home is covered or need directions? Call or WhatsApp our workshop team directly.",
    contact_address_lbl: "Workshop Address:",
    contact_address_val: "Near Jain Mandir, Railway Station Road, Kosamba (R.S.), Taluka Mangrol, Surat District, Gujarat – 394120",
    contact_hours_lbl: "Shop Timing:",
    contact_hours_val: "10 AM to 7 PM, Monday to Sunday (All 7 Days Open)",
    contact_mobile_lbl: "Mobile:",
    contact_form_title: "Send Quick Repair Message",
    contact_name_ph: "Your Name",
    contact_phone_ph: "Phone Number",
    contact_msg_ph: "Which electronic item needs repair?",
    contact_submit_btn: "Submit Inquiry",
    footer_desc: "Your trusted local electronic repair small shop & doorstep home service provider. Guaranteed quality & transparent rates.",
    footer_services_title: "Services",
    footer_services_list: "Gas Stove & Industrial Bhatti<br>Infrared & Induction Cooktop<br>Mixer & Industrial Mixture<br>Cooker & Kitchenware Fix<br>Dawa Spray Pump & Wiring",
    footer_guarantee_title: "Guarantee",
    footer_guarantee_list: "✓ 100% Verified Techs<br>✓ 90-Day Warranty<br>✓ No Fix, No Fee Guarantee<br>✓ Original OEM Parts",
    footer_rights: "© 2026 AR Technician Work Local Repair Shop & At-Home Service. All Rights Reserved.",
    card_btn_book: "Book Home Visit",
    modal_badge: "At-Home Doorstep Service",
    modal_title: "Request Doorstep Home Repair",
    modal_subtitle: "Certified technician visits your home with tools & parts. Quick & hassle-free!",
    modal_home_service_badge: "🏡 Doorstep Home Technician Visit",
    modal_home_service_sub: "Our technician visits your doorstep in Kosamba & nearby areas with tools & parts.",
    modal_item_lbl: "1. Select Appliance / Equipment (1-Tap)",
    modal_chip_gas: "Gas & Bhatti",
    modal_chip_induction: "Infrared & Induction",
    modal_chip_mixer: "Mixer & Grinder",
    modal_chip_cooker: "Pressure Cooker",
    modal_chip_pump: "Dawa Spray Pump",
    modal_chip_cooler: "Cooler, Fan & Wiring",
    modal_issue_ph: "Brief problem (optional): e.g. low flame, not turning on, wire sparking",
    modal_details_lbl: "2. Your Name, Phone & Home Address",
    modal_name_ph: "Full Name (e.g. Pritesh Patel)",
    modal_phone_ph: "10-digit Mobile Number",
    modal_addr_ph: "Doorstep Address, Colony / Area (Kosamba & Nearby)",
    modal_submit_btn: "Send Request",
    modal_wa_btn: "Book Home Visit via WhatsApp",
    chat_title: "AR Technician Work Assistant",
    chat_greeting: "👋 Hi! Need doorstep home service or drop-off at our local repair shop? Ask me any question!",
    chat_ph: "Ask about price or home visits...",
    toast_translated: "Language translated to English!"
  },
  hi: {
    top_location: "कोसंबा, सूरत",
    lang_label: "भाषा चुनें:",
    btn_translate: "अनुवाद करें",
    nav_home: "होम",
    nav_services: "सेवाएं",
    nav_location: "लोकेशन और दुकान",
    nav_tracker: "ऑर्डर ट्रैक करें",
    nav_contact: "संपर्क",
    hero_btn_location: "दुकान और लोकेशन देखें",
    nav_admin: "एडमिन",
    nav_login: "लॉगिन",
    nav_book: "रिपेयर बुक करें",
    hero_badge: '<i class="fas fa-solid fa-screwdriver-wrench"></i> दुकान पर सेवा <i class="fas fa-solid fa-house"></i> घर पर रिपेयर सेवा',
    hero_title: 'गैस और इलेक्ट्रिकल रिपेयर <span class="gradient-text">दुकान और होम सर्विस</span>',
    hero_subtitle: "हम अपनी दुकान और आपके घर दोनों जगह भरोसेमंद गैस, इलेक्ट्रिकल और इंडस्ट्रियल उपकरणों की मरम्मत सेवा प्रदान करते हैं। गैस चूल्हे और इंडक्शन से लेकर पानी के पंप, कूलर और वायरिंग तक - हम आपके सभी उपकरणों को सुरक्षित रखते हैं।",
    hero_mode_home_title: "घर पर सेवा",
    hero_mode_home_desc: "टेक्नीशियन आपके घर आकर रिपेयर करेगा",
    hero_mode_shop_title: "दुकान पर आएं",
    hero_mode_shop_desc: "हमारी दुकान पर लाकर रिपेयर और सर्विस करवाएं",
    hero_btn_book: "होम टेक्नीशियन बुलाएं",
    hero_btn_estimate: "खर्च का अनुमान लगाएं",
    coverage_title: "डोरस्टेप होम सर्विस उपलब्धता जांचें",
    coverage_desc: "अपना पिनकोड या एरिया कोड दर्ज करें और जांचें कि क्या हमारा टेक्नीशियन आज आपके घर आ सकता है।",
    coverage_input_ph: "उदा. 394120",
    coverage_btn: "अभी जांचें",
    estimator_badge: '<i class="fas fa-hand-holding-dollar"></i> पारदर्शी रेट कार्ड',
    estimator_title: "तुरंत रिपेयर खर्च अनुमानक",
    estimator_subtitle: "चुनें कि आप अपने घर पर सर्विस चाहते हैं या हमारी स्थानीय दुकान पर ड्रॉप-ऑफ करना चाहते हैं।",
    estimator_step1: "1. रिपेयर स्थान चुनें:",
    estimator_loc_home: "घर पर सेवा",
    estimator_loc_home_sub: "टेक्नीशियन आपके घर आएगा",
    estimator_loc_shop: "स्थानीय दुकान पर आएं",
    estimator_loc_shop_sub: "काउंटर पर उपकरण जमा करें",
    estimator_step2: "2. इलेक्ट्रॉनिक उपकरण चुनें:",
    cat_tv: "स्मार्ट टीवी",
    cat_mobile: "मोबाइल/टैबलेट",
    cat_laptop: "लैपटॉप/कंप्यूटर",
    cat_fridge: "फ्रिज/AC पीसीबी",
    cat_microwave: "माइक्रोवेव",
    cat_fan: "उपकरण पीसीबी",
    quote_title: "अनुमानित सर्विस कोटेशन",
    quote_home_visit: "🏡 डोरस्टेप होम विजिट शामिल",
    quote_shop_visit: "🏪 दुकान पर इन-शॉप ड्रॉप-ऑफ",
    quote_time_lbl: "अनुमानित समय:",
    quote_warranty: "90 दिनों की रिपेयर वारंटी शामिल",
    quote_book_btn: "यह सेवा बुक करें",
    services_badge: '<i class="fas fa-screwdriver"></i> सभी गैस, मशीन और इलेक्ट्रिकल उपकरण शामिल',
    services_title: "दुकान और होम रिपेयर सेवाएं",
    services_subtitle: "हम आपके घर पर जरूरी टूल्स के साथ आते हैं या अपनी वर्कशॉप में आधुनिक मशीनों से मरम्मत करते हैं।",
    s_badge_doorstep_shop: "घर और दुकान दोनों",
    s_badge_express: "दुकान पर एक्सप्रेस",
    s_badge_home: "घर पर सेवा",
    s1_title: "घरेलू और इंडस्ट्रियल गैस स्टोव",
    s1_desc: "एलपीजी गैस चूल्हा, कमर्शियल भट्टी, इंडस्ट्रियल गैस बर्नर रिपेयर, पाइपलाइन फिटिंग, रेगुलेटर और लीकेज समाधान।",
    s2_title: "इलेक्ट्रिक इन्फ्रारेड और इंडक्शन चूल्हा",
    s2_desc: "इन्फ्रारेड कुकर और इंडक्शन चूल्हे की मरम्मत, हीटिंग कॉइल, आईजीबीटी सर्किट बोर्ड, एरर कोड और टच पैनल रिपेयर।",
    s3_title: "मिक्सर मशीन और इंडस्ट्रियल मिक्सर",
    s3_desc: "मोटर वाइंडिंग, जार कपलिंग रिप्लेसमेंट, ब्लेड मरम्मत और घरेलू मिक्सर व भारी इंडस्ट्रियल मिक्सर मशीनों की सर्विस।",
    s4_title: "प्रेशर कुकर और किचन उपकरण",
    s4_desc: "घरेलू और कमर्शियल प्रेशर कुकर की मरम्मत, सीटी (वेट), रबर गास्केट, सेफ्टी वॉल्व, हैंडल बदलना और बॉडी लीकेज ठीक करना।",
    s5_title: "एग्रीकल्चरल स्प्रे पंप (दवा के पंप)",
    s5_desc: "बैटरी वाले खेती स्प्रे पंप, कीटनाशक दवा छिड़काव मशीन, 12V मोटर रिपेयर, नई बैटरी, चार्जिंग सॉकेट और नोजल सर्विस।",
    s6_title: "कूलर, पंखे और कम्प्लीट इलेक्ट्रिक वायरिंग",
    s6_desc: "रूम व इंडस्ट्रियल कूलर मोटर, वॉटर पंप, पंखा वाइंडिंग, कैपेसिटर रिप्लेसमेंट और घर व दुकान की कम्प्लीट इलेक्ट्रिक वायरिंग (\"कुछ भी वायरिंग\")।",
    tracker_badge: "लाइव जीपीएस टेक्नीशियन ट्रैकर",
    tracker_title: 'लाइव इंटरएक्टिव <span class="gradient-text">डोरस्टेप रूट ट्रैकिंग</span>',
    tracker_desc: "रियल-टाइम मैप ट्रैकिंग: असाइन किए गए इलेक्ट्रीशियन का लाइव वाहन मूवमेंट, रूट, स्पीड और आगमन समय मैप पर देखें!",
    tracker_input_ph: "इलेक्ट्रीशियन ट्रैक करने के लिए 4-अंकीय कोड यहाँ पेस्ट करें जैसे HOME-1234",
    tracker_btn: "लाइव लोकेशन ट्रैक करें",
    tracker_demos: "डेमो कोड आज़माएं:",
    contact_badge: '<i class="fas fa-location-dot"></i> स्थानीय दुकान',
    contact_title: "हमारी स्थानीय दुकान पर आएं",
    contact_subtitle: "क्या आप खुद आकर अपना उपकरण जमा करना चाहते हैं? हमारे नजदीकी सर्विस सेंटर में आपका स्वागत है!",
    contact_address_lbl: "पता:",
    contact_address_val: "जैन मंदिर रेलवे स्टेशन रोड, कोसंबा, तालुका मांगरोल, सूरत - 394120",
    contact_hours_lbl: "दुकान का समय (Shop Timing):",
    contact_hours_val: "सुबह 10:00 से शाम 7:00, सोमवार से रविवार (सभी 7 दिन खुला)",
    contact_mobile_lbl: "मोबाइल:",
    contact_form_title: "त्वरित रिपेयर संदेश भेजें",
    contact_name_ph: "आपका नाम",
    contact_phone_ph: "फोन नंबर",
    contact_msg_ph: "कौन से इलेक्ट्रॉनिक उपकरण की मरम्मत चाहिए?",
    contact_submit_btn: "संदेश भेजें",
    footer_desc: "आपकी अपनी विश्वसनीय स्थानीय इलेक्ट्रॉनिक रिपेयर शॉप और डोरस्टेप होम सर्विस। गारंटीड गुणवत्ता और पारदर्शी दाम।",
    footer_services_title: "सेवाएं",
    footer_services_list: "गैस चूल्हा और इंडस्ट्रियल भट्टी<br>इन्फ्रारेड व इंडक्शन चूल्हा<br>मिक्सर और इंडस्ट्रियल मशीन<br>प्रेशर कुकर रिपेयर<br>दवा के पंप और इलेक्ट्रिक वायरिंग",
    footer_guarantee_title: "गारंटी",
    footer_guarantee_list: "✓ 100% सत्यापित टेक्नीशियन<br>✓ 90-दिन की वारंटी<br>✓ नो फिक्स, नो फीस गारंटी<br>✓ असली ओरिजिनल पार्ट्स",
    footer_rights: "© 2026 एआर टेक्नीशियन वर्क लोकल रिपेयर शॉप और एट-होम सर्विस। सर्वाधिकार सुरक्षित।",
    card_btn_book: "होम विजिट बुक करें",
    modal_badge: "घर पर डोरस्टेप सेवा",
    modal_title: "घर पर होम रिपेयर बुक करें",
    modal_subtitle: "प्रमाणित टेक्नीशियन सभी टूल्स व पार्ट्स के साथ आपके घर आएगा। त्वरित व सुरक्षित!",
    modal_home_service_badge: "🏡 100% डोरस्टेप होम रिपेयर सेवा",
    modal_home_service_sub: "हमारा टेक्नीशियन कोसंबा व आसपास के क्षेत्रों में आपके घर आकर मरम्मत करेगा।",
    modal_item_lbl: "1. उपकरण चुनें (एक क्लिक में)",
    modal_chip_gas: "गैस और भट्टी",
    modal_chip_induction: "इन्फ्रारेड व इंडक्शन",
    modal_chip_mixer: "मिक्सर व ग्राइंडर",
    modal_chip_cooker: "प्रेशर कुकर",
    modal_chip_pump: "दवा स्प्रे पंप",
    modal_chip_cooler: "कूलर, पंखा व वायरिंग",
    modal_issue_ph: "समस्या बताएं (वैकल्पिक): उदा. चालू नहीं हो रहा, गैस लीक, मोटर जाम",
    modal_details_lbl: "2. आपका नाम, फोन व घर का पता",
    modal_name_ph: "पूरा नाम (उदा. प्रीतेश पटेल)",
    modal_phone_ph: "10 अंकों का मोबाइल नंबर",
    modal_addr_ph: "घर का पता, लैंडमार्क या क्षेत्र (कोसंबा व आसपास)",
    modal_submit_btn: "रिक्वेस्ट भेजें",
    modal_wa_btn: "व्हाट्सएप पर होम सर्विस बुक करें",
    chat_title: "एआर टेक्नीशियन वर्क असिस्टेंट",
    chat_greeting: "👋 नमस्ते! क्या आपको घर पर सर्विस चाहिए या हमारी दुकान पर आना चाहते हैं? मुझसे कोई भी सवाल पूछें!",
    chat_ph: "दाम या होम विजिट के बारे में पूछें...",
    toast_translated: "वेबसाइट की भाषा सफलतापूर्वक हिंदी में बदल दी गई है!"
  },
  gu: {
    top_location: "કોસંબા, સુરત",
    lang_label: "ભાષા પસંદ કરો:",
    btn_translate: "ભાષાંતર કરો",
    nav_home: "હોમ",
    nav_services: "સેવાઓ",
    nav_location: "લોકેશન અને દુકાન",
    nav_tracker: "ઓર્ડર ટ્રેક કરો",
    nav_contact: "સંપર્ક",
    hero_btn_location: "દુકાન અને લોકેશન જુઓ",
    nav_admin: "એડમિન",
    nav_login: "લૉગિન",
    nav_book: "રીપેરીંગ બુક કરો",
    hero_badge: '<i class="fas fa-solid fa-screwdriver-wrench"></i> દુકાન પર સેવા <i class="fas fa-solid fa-house"></i> ઘરે બેઠા રીપેર સેવા',
    hero_title: 'ગેસ અને ઇલેક્ટ્રિકલ રીપેર <span class="gradient-text">દુકાન અને હોમ સર્વિસ</span>',
    hero_subtitle: "અમે અમારી દુકાન અને તમારા ઘરે વિશ્વસનીય ગેસ, ઇલેક્ટ્રિકલ અને ઔદ્યોગિક સાધનોની સમારકામ સેવા પ્રદાન કરીએ છીએ. ગેસના ચૂલા, ઇન્ડક્શનથી લઈને પાણીના પંપ, કૂલર અને વાયરિંગ સુધી - અમે તમારા સાધનોને સુરક્ષિત અને કાર્યરત રાખીએ છીએ.",
    hero_mode_home_title: "ઘરે બેઠા સેવા (Home Service)",
    hero_mode_home_desc: "ટેકનિશિયન તમારા ઘરે આવીને રીપેર કરશે",
    hero_mode_shop_title: "દુકાન પર મુલાકાત (Shop Visit)",
    hero_mode_shop_desc: "અમારી દુકાને લાવીને રીપેર અને સર્વિસ કરાવો",
    hero_btn_book: "હોમ ટેકનિશિયન બોલાવો",
    hero_btn_estimate: "ખર્ચનો અંદાજ મેળવો",
    coverage_title: "ડોરસ્ટેપ હોમ સર્વિસ ઉપલબ્ધતા તપાસો",
    coverage_desc: "તમારો પિનકોડ અથવા વિસ્તાર કોડ દાખલ કરો અને જુઓ કે શું અમારો ટેકનિશિયન આજે તમારા ઘરે આવી શકે છે.",
    coverage_input_ph: "દા.ત. 394120",
    coverage_btn: "હમણાં તપાસો",
    estimator_badge: '<i class="fas fa-hand-holding-dollar"></i> પારદર્શક રેટ કાર્ડ',
    estimator_title: "ઇન્સ્ટન્ટ રીપેર કિંમત અંદાજક",
    estimator_subtitle: "પસંદ કરો: તમારા ઘરે સેવા જોઈએ છે કે અમારી લોકલ દુકાને આપવા આવવું છે.",
    estimator_step1: "૧. રીપેર સ્થળ પસંદ કરો:",
    estimator_loc_home: "ઘરે બેઠા સેવા",
    estimator_loc_home_sub: "ટેક તમારા ઘરે આવશે",
    estimator_loc_shop: "લોકલ દુકાનની મુલાકાત",
    estimator_loc_shop_sub: "કાઉન્ટર પર જમા કરાવો",
    estimator_step2: "૨. ઇલેક્ટ્રોનિક આઇટમ પસંદ કરો:",
    cat_tv: "સ્માર્ટ ટીવી",
    cat_mobile: "મોબાઇલ/ટેબ્લેટ",
    cat_laptop: "લેપટોપ/કમ્પ્યુટર",
    cat_fridge: "ફ્રિજ/AC PCB",
    cat_microwave: "માઇક્રોવેવ",
    cat_fan: "ઉપકરણ PCB",
    quote_title: "અંદાજિત સર્વિસ ક્વોટ",
    quote_home_visit: "🏡 ડોરસ્ટેપ હોમ વિઝિટ સામેલ",
    quote_shop_visit: "🏪 દુકાન પર ઇન-શોપ ડ્રોપ-ઓફ",
    quote_time_lbl: "અંદાજિત સમય:",
    quote_warranty: "90 દિવસની રીપેર વૉરંટી સામેલ",
    quote_book_btn: "આ સેવા બુક કરો",
    services_badge: '<i class="fas fa-screwdriver"></i> તમામ ગેસ, મશીન અને ઇલેક્ટ્રિકલ સાધનો આવરી લીધા છે',
    services_title: "દુકાન અને હોમ રીપેરીંગ સેવાઓ",
    services_subtitle: "અમે તમારા ઘરે સ્પેશિયલ ટૂલ્સ સાથે આવીએ છીએ અથવા અમારી શોપ બેન્ચ પર ઊંડાણપૂર્વક સમારકામ કરીએ છીએ.",
    s_badge_doorstep_shop: "ઘર અને દુકાન બંને",
    s_badge_express: "દુકાને એક્સપ્રેસ",
    s_badge_home: "ઘરે સેવા",
    s1_title: "ગેસ ચૂલા અને ઇન્ડસ્ટ્રીયલ ગેસ ભઠ્ઠી",
    s1_desc: "એલપીજી ગેસ ચૂલા, કોમર્શિયલ ભઠ્ઠી, ઇન્ડસ્ટ્રીયલ બર્નર રીપેર, પાઇપલાઇન ફીટીંગ, રેગ્યુલેટર અને લીકેજ સમારકામ.",
    s2_title: "ઇલેક્ટ્રિક ઇન્ફ્રારેડ અને ઇન્ડક્શન ચૂલા",
    s2_desc: "ઇન્ફ્રારેડ કૂકર અને ઇન્ડક્શન સ્ટોવ રીપેરીંગ, હીટિંગ કોઈલ, સર્કિટ બોર્ડ, એરર કોડ અને ટચ પેનલ સમારકામ.",
    s3_title: "મિક્સર અને ઇન્ડસ્ટ્રીયલ મિક્સર મશીન",
    s3_desc: "મોટર વાઇન્ડિંગ, જાર કપલિંગ બદલવું, બ્લેડ રીપેર અને ઘરગથ્થુ મિક્સર તેમજ કોમર્શિયલ ઇન્ડસ્ટ્રીયલ મિક્સર સર્વિસિંગ.",
    s4_title: "પ્રેશર કૂકર અને કિચન એપ્લાયન્સિસ",
    s4_desc: "ઘર અને કોમર્શિયલ પ્રેશર કૂકર રીપેર, સીટી (વેઇટ), રબર ગાસ્કેટ, સેફ્ટી વાલ્વ, હેન્ડલ બદલવું અને લીકેજ સોલ્યુશન.",
    s5_title: "દવા છાંટવાના પંપ (એગ્રીકલ્ચરલ સ્પ્રે પંપ)",
    s5_desc: "બેટરી ઓપરેટેડ સ્પ્રે પંપ, જંતુનાશક દવા પંપ રીપેર, 12V પ્રેશર મોટર, નવી બેટરી, ચાર્જર પોર્ટ અને નોઝલ સર્વિસ.",
    s6_title: "કૂલર, પંખા અને તમામ ઇલેક્ટ્રિક વાયરિંગ",
    s6_desc: "એર કૂલર મોટર અને વોટર પંપ, પંખા વાઇન્ડિંગ, કેપેસિટર રીપ્લેસમેન્ટ અને ઘર કે દુકાનનું સંપૂર્ણ ઇલેક્ટ્રિક વાયરિંગ સમારકામ.",
    tracker_badge: "લાઇવ GPS ટેકનિશિયન ટ્રેકર",
    tracker_title: 'લાઇવ ઇન્ટરેક્ટિવ <span class="gradient-text">ડોરસ્ટેપ રૂટ ટ્રેકિંગ</span>',
    tracker_desc: "રીઅલ-ટાઇમ મેપ ટ્રેકિંગ: તમને ફાળવેલ ઇલેક્ટ્રિશિયનનું લાઇવ વાહન મુવમેન્ટ, રૂટ, સ્પીડ અને આગમન સમય નકશા પર જુઓ!",
    tracker_input_ph: "ઇલેક્ટ્રિશિયન ટ્રેક કરવા માટે 4-અંકનો કોડ અહીં પેસ્ટ કરો જેમ કે HOME-1234",
    tracker_btn: "લાઇવ લોકેશન ટ્રેક કરો",
    tracker_demos: "ડેમો કોડ ટ્રાય કરો:",
    contact_badge: '<i class="fas fa-location-dot"></i> લોકલ શોપ',
    contact_title: "અમારી લોકલ દુકાનની મુલાકાત લો",
    contact_subtitle: "શું તમે રૂબરૂ આવીને ઇલેક્ટ્રોનિક આઇટમ આપવા માંગો છો? અમારા નજીકના સ્ટોર પર પધારો!",
    contact_address_lbl: "સરનામું:",
    contact_address_val: "જૈન મંદિર રેલ્વે સ્ટેશન રોડ, કોસંબા, તાલુકો માંગરોળ, સુરત - 394120",
    contact_hours_lbl: "દુકાનનો સમય (Shop Timing):",
    contact_hours_val: "સવારે 10:00 થી સાંજે 7:00, સોમવાર થી રવિવાર (બધા 7 દિવસ ખુલ્લું)",
    contact_mobile_lbl: "મોબાઇલ:",
    contact_form_title: "ઝડપી રીપેર મેસેજ મોકલો",
    contact_name_ph: "તમારું નામ",
    contact_phone_ph: "ફોન નંબર",
    contact_msg_ph: "કઈ ઇલેક્ટ્રોનિક આઇટમ રીપેર કરાવવી છે?",
    contact_submit_btn: "પૂછપરછ સબમિટ કરો",
    footer_desc: "તમારું પોતાનું વિશ્વાસુ સ્થાનિક ઇલેક્ટ્રોનિક રીપેર સ્ટોર અને ડોરસ્ટેપ હોમ સર્વિસ પ્રોવાઇડર. ગેરેન્ટેડ ગુણવત્તા અને વાજબી ભાવ.",
    footer_services_title: "સેવાઓ",
    footer_services_list: "ગેસ ચૂલા & ઇન્ડસ્ટ્રીયલ ભઠ્ઠી<br>ઇન્ફ્રારેડ & ઇન્ડક્શન સ્ટોવ<br>મિક્સર & ઇન્ડસ્ટ્રીયલ મિક્સર<br>પ્રેશર કૂકર રીપેર<br>દવા છાંટવાના પંપ & વાયરિંગ",
    footer_guarantee_title: "ગેરેન્ટી",
    footer_guarantee_list: "✓ 100% વેરિફાઇડ ટેકનિશિયન<br>✓ 90-દિવસની વૉરંટી<br>✓ નો ફિક્સ, નો ફી ગેરેન્ટી<br>✓ અસલ ઓરિજિનલ પાર્ટ્સ",
    footer_rights: "© 2026 એઆર ટેકનિશિયન વર્ક લોકલ રીપેર શોપ અને એટ-હોમ સર્વિસ. સર્વાધિકાર સુરક્ષિત.",
    card_btn_book: "હોમ વિઝિટ બુક કરો",
    modal_badge: "ઘરે ડોરસ્ટેપ સર્વિસ",
    modal_title: "ઘરે ડોરસ્ટેપ સર્વિસ બુક કરો",
    modal_subtitle: "સર્ટીફાઇડ ટેકનિશિયન ટૂલ્સ અને સ્પેર પાર્ટ્સ સાથે તમારા ઘરે આવશે. એકદમ સરળ!",
    modal_home_service_badge: "🏡 100% ડોરસ્ટેપ એટ-હોમ સર્વિસ",
    modal_home_service_sub: "અમારો ટેકનિશિયન કોસંબા અને આસપાસના વિસ્તારોમાં તમારા ઘરે આવીને રીપેર કરશે.",
    modal_item_lbl: "1. સાધન પસંદ કરો (એક ક્લિકમાં)",
    modal_chip_gas: "ગેસ ચૂલા અને ભઠ્ઠી",
    modal_chip_induction: "ઇન્ફ્રારેડ & ઇન્ડક્શન",
    modal_chip_mixer: "મિક્સર & ગ્રાઇન્ડર",
    modal_chip_cooker: "પ્રેશર કૂકર",
    modal_chip_pump: "દવા સ્પ્રે પંપ",
    modal_chip_cooler: "કૂલર, પંખા & વાયરિંગ",
    modal_issue_ph: "સમસ્યા જણાવો (વૈકલ્પિક): દા.ત. ચાલુ નથી થતું, ગેસ લીક, વાયરિંગ",
    modal_details_lbl: "2. તમારું નામ, ફોન અને ઘરનું સરનામું",
    modal_name_ph: "પૂરું નામ (દા.ત. પ્રિતેશ પટેલ)",
    modal_phone_ph: "10 આંકડાનો મોબાઇલ નંબર",
    modal_addr_ph: "ઘરનું સરનામું, વિસ્તાર કે સોસાયટી (કોસંબા & આસપાસ)",
    modal_submit_btn: "રિક્વેસ્ટ મોકલો",
    modal_wa_btn: "WhatsApp પર હોમ સર્વિસ બુક કરો",
    chat_title: "એઆર ટેકનિશિયન વર્ક આસિસ્ટન્ટ",
    chat_greeting: "👋 કેમ છો! શું તમારે ઘરે સર્વિસ જોઈએ છે કે દુકાન પર આવવું છે? મને કોઈ પણ પ્રશ્ન પૂછો!",
    chat_ph: "ભાવ અથવા હોમ વિઝિટ વિશે પૂછો...",
    toast_translated: "વેબસાઇટની ભાષા સફળતાપૂર્વક ગુજરાતીમાં બદલાઈ ગઈ છે!"
  },
  hinglish: {
    top_location: "Kosamba, Surat",
    lang_label: "Language Select Karein:",
    btn_translate: "Translate",
    nav_home: "Home",
    nav_services: "Services",
    nav_location: "Location & Shop",
    nav_tracker: "Order Track",
    nav_contact: "Contact",
    hero_btn_location: "Shop & Location Dekhein",
    nav_admin: "Admin",
    nav_login: "Login",
    nav_book: "Repair Book Karein",
    hero_badge: '<i class="fas fa-solid fa-screwdriver-wrench"></i> Shop Par Service <i class="fas fa-solid fa-house"></i> Ghar Par Home Service',
    hero_title: 'Gas & Electrical Repair <span class="gradient-text">Shop aur Home Service</span>',
    hero_subtitle: "Hum provide karte hain reliable gas, electrical aur industrial equipment repair services shop aur aapke ghar par. Gas chulhe aur induction se lekar water pump, cooler aur wiring tak - aapke sabhi appliances safely repair honge.",
    hero_mode_home_title: "Ghar Par Service (Doorstep)",
    hero_mode_home_desc: "Technician direct aapke ghar aayega",
    hero_mode_shop_title: "Shop Visit (Dukaan Par Aayein)",
    hero_mode_shop_desc: "Shop par laakar repair aur servicing karwayein",
    hero_btn_book: "Home Technician Bulayein",
    hero_btn_estimate: "Kharch Ka Estimate Lagayein",
    coverage_title: "Check Karein At-Home Service Available Hai Ya Nahi",
    coverage_desc: "Apna Area Pincode enter karein aur dekhein ki mobile technician aaj aapke ghar aa sakta hai ya nahi.",
    coverage_input_ph: "e.g. 394120",
    coverage_btn: "Abhi Check Karein",
    estimator_badge: '<i class="fas fa-hand-holding-dollar"></i> Transparent Rate Card',
    estimator_title: "Instant Repair Price Estimator",
    estimator_subtitle: "Choose karein: Ghar par doorstep service chahiye ya hamari local shop par drop-off karna hai.",
    estimator_step1: "1. Repair Ki Location Choose Karein:",
    estimator_loc_home: "At-Home Service",
    estimator_loc_home_sub: "Tech aapke ghar aayega",
    estimator_loc_shop: "Local Shop Visit",
    estimator_loc_shop_sub: "Shop counter par drop karein",
    estimator_step2: "2. Electronic Item Select Karein:",
    cat_tv: "Smart TV",
    cat_mobile: "Mobile/Tablet",
    cat_laptop: "Laptop/PC",
    cat_fridge: "Fridge/AC PCB",
    cat_microwave: "Microwave",
    cat_fan: "Appliance PCB",
    quote_title: "Estimated Service Quote",
    quote_home_visit: "🏡 Doorstep Home Visit Included",
    quote_shop_visit: "🏪 In-Shop Express Drop-off",
    quote_time_lbl: "Estimated Time:",
    quote_warranty: "Includes 90-Day Repair Warranty",
    quote_book_btn: "Ye Service Book Karein",
    services_badge: '<i class="fas fa-screwdriver"></i> Sabhi Gas, Machine & Electrical Items Covered',
    services_title: "Shop & Home Repair Services",
    services_subtitle: "Hum specialized tools ke sath aapke living room me aate hain ya shop bench par deep component repair karte hain.",
    s_badge_doorstep_shop: "Doorstep & Shop",
    s_badge_express: "Shop Par Express",
    s_badge_home: "At-Home Service",
    s1_title: "Domestic & Industrial Gas",
    s1_desc: "LPG gas chulha, commercial bhatti, industrial gas burner repair, pipeline fitting, regulator aur leak problem solving.",
    s2_title: "Electric Infrared & Induction",
    s2_desc: "Infrared cooker aur induction cooktop repair, heating coil change, circuit board, error code aur touch panel fix.",
    s3_title: "Mixer & Industrial Mixture Machine",
    s3_desc: "Motor rewinding, jar coupler replacement, blade fix aur domestic mixer se lekar industrial mixture machine servicing.",
    s4_title: "Pressure Cooker & Kitchen Items",
    s4_desc: "Domestic aur commercial pressure cooker repair, seeti (whistle), rubber gasket, safety valve, handle aur leak fix.",
    s5_title: "Dawa Ke Pump (Farm Spray Pump)",
    s5_desc: "Battery wale spray pump, kheti pesticide spray machine, 12V motor check, battery change, charger port aur nozzle repair.",
    s6_title: "Cooler, Pankhe & All Electric Wiring",
    s6_desc: "Air cooler motor & pump fix, ceiling/exhaust fan rewinding, capacitor aur ghar/dukaan ki complete electric wiring (kuchh bhi wiring).",
    tracker_badge: "LIVE GPS TECHNICIAN TRACKER",
    tracker_title: 'Live Interactive <span class="gradient-text">Doorstep Route Tracking</span>',
    tracker_desc: "Real-time map tracking: assigned electrician ki live vehicle movement, route, speed aur aane ka time map par dekhein!",
    tracker_input_ph: "Electrician track karne ke liye 4-digit code yahan paste karein e.g. HOME-1234",
    tracker_btn: "Live Location Track Karein",
    tracker_demos: "Demo Codes Try Karein:",
    contact_badge: '<i class="fas fa-location-dot"></i> Neighborhood Shop',
    contact_title: "Hamari Local Shop Par Aayein",
    contact_subtitle: "Khud aakar electronic item drop karna chahte hain? Hamari friendly local shop par welcome hai!",
    contact_address_lbl: "Workshop Address:",
    contact_address_val: "Near Jain Mandir, Railway Station Road, Kosamba (R.S.), Taluka Mangrol, Surat District, Gujarat – 394120",
    contact_hours_lbl: "Shop Timing:",
    contact_hours_val: "10 AM to 7 PM, Monday to Sunday (All 7 Days Open)",
    contact_mobile_lbl: "Mobile:",
    contact_form_title: "Quick Repair Message Bhejein",
    contact_name_ph: "Aapka Naam",
    contact_phone_ph: "Phone Number",
    contact_msg_ph: "Kaun sa electronic item repair karwana hai?",
    contact_submit_btn: "Inquiry Submit Karein",
    footer_desc: "Aapka apna trusted local electronic repair small shop & doorstep home service provider. Guaranteed quality & transparent rates.",
    footer_services_title: "Services",
    footer_services_list: "Gas Stove & Industrial Bhatti<br>Infrared & Induction Cooker<br>Mixer & Industrial Mixture<br>Pressure Cooker Servicing<br>Dawa Ke Pump & Wiring",
    footer_guarantee_title: "Guarantee",
    footer_guarantee_list: "✓ 100% Verified Technicians<br>✓ 90-Day Ki Warranty<br>✓ No Fix, No Fee Guarantee<br>✓ Original OEM Parts",
    footer_rights: "© 2026 AR Technician Work Local Repair Shop & At-Home Service. All Rights Reserved.",
    card_btn_book: "Home Visit Book Karein",
    modal_badge: "Doorstep Home Service",
    modal_title: "Doorstep Home Repair Book Karein",
    modal_subtitle: "Certified technician aapke ghar aayega genuine parts aur tools ke sath!",
    modal_home_service_badge: "🏡 100% Doorstep At-Home Service",
    modal_home_service_sub: "Kosamba aur nearby areas me hamara technician direct aapke ghar visit karega.",
    modal_item_lbl: "1. Appliance Select Karein (1-Tap)",
    modal_chip_gas: "Gas & Bhatti",
    modal_chip_induction: "Infrared & Induction",
    modal_chip_mixer: "Mixer & Grinder",
    modal_chip_cooker: "Pressure Cooker",
    modal_chip_pump: "Dawa Spray Pump",
    modal_chip_cooler: "Cooler, Fan & Wiring",
    modal_issue_ph: "Problem batayein (optional): e.g. On nahi ho raha, gas leak, wire issue",
    modal_details_lbl: "2. Aapka Naam, Phone & Home Address",
    modal_name_ph: "Pura Naam (e.g. Pritesh Patel)",
    modal_phone_ph: "10 Digit Mobile Number",
    modal_addr_ph: "Ghar ka address / Area (Kosamba & Nearby)",
    modal_submit_btn: "Request Send Karein",
    modal_wa_btn: "WhatsApp Par Home Visit Book Karein",
    chat_title: "AR Technician Work Assistant",
    chat_greeting: "👋 Hello! Doorstep home service chahiye ya hamari local shop par aana chahte hain? Koi bhi sawal puchiye!",
    chat_ph: "Price ya home visit ke baare me puchiye...",
    toast_translated: "Website ki language Hinglish me change ho gayi hai!"
  }
};

// ==========================================
// Global Customer Authentication Checkers & Modal Helper
// (Persistent customer session: auto-sync visibility on startup)
// ==========================================
try {
  if (typeof window.syncCustomerCodeVisibility === 'function') {
    window.syncCustomerCodeVisibility();
  }
} catch (e) {}

window.isCustomerLoggedIn = function () {
  const u = window.getCurrentCustomerUser();
  return !!(u && u.name);
};

window.getCurrentCustomerUser = function () {
  try {
    const u = localStorage.getItem('ar_customer_user');
    return u ? JSON.parse(u) : null;
  } catch (e) {
    return null;
  }
};

window.syncCustomerCodeVisibility = function () {
  const heroMyBookingsPill = document.getElementById('user-my-bookings-pill') || document.getElementById('user-code-pill');
  const heroMyBookingsCount = document.getElementById('user-my-bookings-count');
  const heroMyBookingsLabel = document.getElementById('user-my-bookings-label');
  const heroCodeVal = document.getElementById('user-code-val');
  const heroCodePrefix = document.getElementById('user-code-prefix');
  const pasteBanner = document.getElementById('tracker-paste-info-banner');
  const bannerHighlight = document.getElementById('tracker-banner-code-highlight');
  const bannerBtnLabel = document.getElementById('btn-quick-paste-code-label');
  const trackInput = document.getElementById('track-input');
  const realSection = document.getElementById('tracker-real-booking-section');
  const realTrackBtn = document.getElementById('btn-track-real-booking');
  const realCodeBadge = document.getElementById('tracker-real-code-badge');
  const realDeviceEl = document.getElementById('tracker-real-device-name');
  const realMetaEl = document.getElementById('tracker-real-meta');
  const realStatusEl = document.getElementById('tracker-real-status-badge');
  const realCountEl = document.getElementById('tracker-real-booking-count');

  let code = (localStorage.getItem('last_tracking_code') || '').trim();
  let latestBooking = null;

  try {
    const localBookings = JSON.parse(localStorage.getItem('ar_local_bookings') || '[]');
    if (Array.isArray(localBookings) && localBookings.length > 0) {
      latestBooking = localBookings[0];
      if (!code && latestBooking.tracking_code) {
        code = latestBooking.tracking_code.trim();
      }
    }
  } catch (e) {}

  let currentUser = null;
  try {
    const raw = localStorage.getItem('ar_customer_user');
    currentUser = raw ? JSON.parse(raw) : null;
  } catch (e) {}

  if (currentUser) {
    if (currentUser.orders && currentUser.orders.length > 0) {
      if (!latestBooking) latestBooking = currentUser.orders[0];
      if (!code && latestBooking.tracking_code) {
        code = latestBooking.tracking_code.trim();
      }
    }
    if (!code) {
      const phoneDigits = String(currentUser.phone || currentUser.identifier || '').replace(/\D/g, '').slice(-4);
      code = phoneDigits ? ('HOME-' + phoneDigits) : 'HOME-3282';
    }
  }

  // Calculate total bookings across current user & local device
  const allBookingsMap = new Map();
  if (currentUser && Array.isArray(currentUser.orders)) {
    currentUser.orders.forEach(o => {
      const c = (o.tracking_code || o.code || '').trim().toUpperCase();
      if (c) allBookingsMap.set(c, o);
    });
  }
  try {
    const localBookings = JSON.parse(localStorage.getItem('ar_local_bookings') || '[]');
    if (Array.isArray(localBookings)) {
      localBookings.forEach(o => {
        const c = (o.tracking_code || o.code || '').trim().toUpperCase();
        if (c && !allBookingsMap.has(c)) {
          allBookingsMap.set(c, o);
        }
      });
    }
  } catch (e) {}

  const totalBookingsCount = allBookingsMap.size;

  // Sync Hero "My Bookings" Pill
  if (currentUser || totalBookingsCount > 0 || code) {
    if (heroMyBookingsPill) {
      heroMyBookingsPill.style.display = 'inline-flex';
      if (heroMyBookingsCount) heroMyBookingsCount.textContent = totalBookingsCount;
      if (heroMyBookingsLabel) heroMyBookingsLabel.textContent = 'My Bookings';
      heroMyBookingsPill.title = `Click to view all your (${totalBookingsCount}) repair bookings & tracking codes`;
      
      // Wire click to open My Bookings section
      heroMyBookingsPill.onclick = function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (typeof window.openMyBookingsModal === 'function') {
          window.openMyBookingsModal();
        }
      };
    }
    if (heroCodeVal) heroCodeVal.textContent = code;
    if (heroCodePrefix) heroCodePrefix.textContent = 'My code:';
  } else {
    if (heroMyBookingsPill) heroMyBookingsPill.style.display = 'none';
  }

  if (code && !allBookingsMap.has(code.toUpperCase())) {
    allBookingsMap.set(code.toUpperCase(), {
      tracking_code: code,
      device_name: (latestBooking && latestBooking.device_name) || 'Home Appliance Service',
      status: (latestBooking && latestBooking.status) || 'Booked',
      service_type: (latestBooking && latestBooking.service_type) || 'home'
    });
  }

  const allCodes = Array.from(allBookingsMap.keys());
  const allBookingsList = Array.from(allBookingsMap.values());

  const bannerCodesContainer = document.getElementById('tracker-banner-codes-container');
  const bannerActionArea = document.getElementById('tracker-banner-action-area');
  const chipsRow = document.getElementById('tracker-codes-chips-row');
  const chipsList = document.getElementById('tracker-chips-list');

  if (allCodes.length > 0) {
    if (pasteBanner) pasteBanner.style.display = 'flex';

    // 1. Populate all codes inside the banner title
    if (bannerCodesContainer) {
      if (allCodes.length === 1) {
        bannerCodesContainer.innerHTML = `<strong class="highlight-code" id="tracker-banner-code-highlight">${allCodes[0]}</strong>`;
      } else {
        bannerCodesContainer.innerHTML = allCodes.map((c, i) => `
          <button type="button" class="highlight-code-chip btn-set-tracker-code ${i === 0 ? 'active' : ''}" data-code="${c}" title="Click to track ${c}">
            <i class="fas fa-ticket-simple" style="font-size:0.7rem;"></i> ${c}
          </button>
        `).join(' ');
      }
    }

    // 2. Populate banner action buttons for every code
    if (bannerActionArea) {
      if (allCodes.length <= 1) {
        const singleCode = allCodes[0] || code;
        bannerActionArea.innerHTML = `
          <button type="button" class="btn-paste-code-pill btn-set-tracker-code" data-code="${singleCode}" title="Paste ${singleCode}">
            <i class="fas fa-clipboard-check"></i> <span>Paste ${singleCode}</span>
          </button>
        `;
      } else {
        bannerActionArea.innerHTML = allCodes.map(c => `
          <button type="button" class="btn-paste-code-pill btn-set-tracker-code" data-code="${c}" style="padding:0.45rem 0.85rem; font-size:0.8rem;" title="Paste ${c}">
            <i class="fas fa-clipboard-check"></i> <span>Paste ${c}</span>
          </button>
        `).join('');
      }
    }

    // 3. Populate quick selector chips row directly under search bar
    if (chipsRow && chipsList) {
      chipsRow.style.display = 'flex';
      chipsList.innerHTML = allCodes.map((c, i) => `
        <button type="button" class="tracker-code-select-chip btn-set-tracker-code ${i === 0 ? 'active' : ''}" data-code="${c}" title="Select #${c} to track">
          <i class="fas fa-ticket-simple"></i> #${c} <i class="fas fa-arrow-down" style="font-size:0.65rem; opacity:0.7;"></i>
        </button>
      `).join('');
    }

    // 4. Populate search input with latest code if empty
    if (trackInput && (!trackInput.value || trackInput.value === 'HOME-7783' || trackInput.value === 'HOME-1234' || trackInput.value === 'HOME-441')) {
      trackInput.value = allCodes[0] || code;
    }

    // 5. Wire click actions on all code chip buttons
    document.querySelectorAll('.btn-set-tracker-code').forEach(btn => {
      btn.onclick = function (e) {
        e.preventDefault();
        e.stopPropagation();
        const targetCode = btn.getAttribute('data-code');
        if (!targetCode) return;
        if (trackInput) {
          trackInput.value = targetCode;
          trackInput.focus();
          trackInput.classList.remove('flash-input');
          void trackInput.offsetWidth; // trigger reflow
          trackInput.classList.add('flash-input');
        }
        document.querySelectorAll('.btn-set-tracker-code').forEach(b => {
          if (b.getAttribute('data-code') === targetCode) {
            b.classList.add('active');
          } else {
            b.classList.remove('active');
          }
        });
        if (typeof showToast === 'function') {
          showToast(`📍 Selected code "${targetCode}"! Click Track Live Location to view route.`, 'info');
        }
      };
    });

    // 6. Populate real bookings list below the tracker
    if (realSection) {
      realSection.style.display = 'block';
      if (realCountEl) realCountEl.textContent = `${allBookingsList.length} ${allBookingsList.length === 1 ? 'Booking' : 'Bookings'}`;

      const realList = document.getElementById('tracker-real-bookings-list');
      if (realList) {
        realList.innerHTML = allBookingsList.map(b => {
          const bCode = (b.tracking_code || b.code || '').trim();
          const statusColors = {
            'Accept': '#34d399',
            'Accepted': '#34d399',
            'Reject': '#f87171',
            'Rejected': '#f87171',
            'Departure from shop': '#38bdf8',
            'At your home': '#a855f7',
            'Booked': '#38bdf8',
            'Dispatch': '#fbbf24',
            'Diagnosing': '#a855f7',
            'Repairing': '#00f2fe',
            'Completed': '#10b981'
          };
          const color = statusColors[b.status] || '#00f2fe';

          return `
            <div class="tracker-real-booking-card" style="margin-bottom:0.75rem;">
              <div class="tracker-real-booking-top">
                <div class="real-code-group">
                  <span class="real-code-tag">#${escapeHtml(bCode)}</span>
                  <button type="button" class="btn-copy-booking-code" data-code="${escapeHtml(bCode)}" title="Copy tracking code">
                    <i class="far fa-copy"></i> <span>Copy</span>
                  </button>
                </div>
                <span class="real-status-pill" style="border-color:${color}; color:${color};">
                  <span class="status-dot" style="background:${color};"></span> ${escapeHtml(b.status || 'Booked')}
                </span>
              </div>
              <div class="real-device-title">
                ${escapeHtml(b.device_name || b.deviceName || 'Home Appliance Service')}
              </div>
              <div class="tracker-real-booking-footer">
                <span>${b.service_type === 'home' ? '🏡 At-Home Visit' : '🏪 Shop Drop'}</span>
                <button type="button" class="btn-track-real-live" data-code="${escapeHtml(bCode)}" title="Track #${escapeHtml(bCode)} live">
                  <i class="fas fa-location-arrow"></i> Track Live
                </button>
              </div>
            </div>
          `;
        }).join('');

        // Wire copy buttons on real booking cards
        realList.querySelectorAll('.btn-copy-booking-code').forEach(btn => {
          btn.onclick = async (e) => {
            e.preventDefault();
            e.stopPropagation();
            const c = btn.getAttribute('data-code');
            if (!c) return;
            try {
              if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(c);
              } else {
                const ta = document.createElement('textarea');
                ta.value = c;
                ta.style.position = 'fixed';
                ta.style.opacity = '0';
                document.body.appendChild(ta);
                ta.select();
                document.execCommand('copy');
                document.body.removeChild(ta);
              }
              btn.classList.add('copied');
              btn.innerHTML = `<i class="fas fa-check" style="color:#10b981;"></i> <span style="color:#10b981;">Copied!</span>`;
              if (typeof showToast === 'function') showToast(`📋 Code "${c}" copied to clipboard!`, 'success');
              if (trackInput) trackInput.value = c;
              setTimeout(() => {
                btn.classList.remove('copied');
                btn.innerHTML = `<i class="far fa-copy"></i> <span>Copy</span>`;
              }, 1800);
            } catch(err) {}
          };
        });

        // Wire track live buttons on real booking cards
        realList.querySelectorAll('.btn-track-real-live').forEach(btn => {
          btn.onclick = (e) => {
            e.preventDefault();
            const c = btn.getAttribute('data-code');
            if (trackInput) trackInput.value = c;
            const trackBtn = document.getElementById('track-btn');
            if (trackBtn) trackBtn.click();
            const trackerSection = document.getElementById('tracker');
            if (trackerSection) trackerSection.scrollIntoView({ behavior: 'smooth' });
          };
        });
      }
    }
    return;
  }

  // No active booking code: Hide tracker helper cards
  if (pasteBanner) pasteBanner.style.display = 'none';
  if (chipsRow) chipsRow.style.display = 'none';
  if (bannerCodesContainer) bannerCodesContainer.innerHTML = '';
  if (realSection) realSection.style.display = 'none';
};

// Universal 10-Digit Mobile Phone Sanitizer & Enforcer
function extract10DigitPhone(val) {
  if (!val) return '';
  let digits = String(val).replace(/\D/g, '');
  if (digits.length > 10) {
    if (digits.startsWith('91') && digits.length === 12) {
      digits = digits.slice(2);
    } else if (digits.startsWith('0') && digits.length === 11) {
      digits = digits.slice(1);
    } else if (digits.startsWith('91')) {
      digits = digits.slice(2);
    } else {
      digits = digits.slice(0, 10);
    }
  }
  return digits.slice(0, 10);
}
window.extract10DigitPhone = extract10DigitPhone;

function attach10DigitPhoneEnforcer(element) {
  if (!element) return;
  element.setAttribute('maxlength', '10');
  element.setAttribute('minlength', '10');
  element.setAttribute('inputmode', 'numeric');
  element.setAttribute('pattern', '[0-9]{10}');

  element.addEventListener('input', function() {
    const clean = extract10DigitPhone(this.value);
    if (this.value !== clean) {
      this.value = clean;
    }
  });

  element.addEventListener('paste', function(e) {
    e.preventDefault();
    const pasteText = (e.clipboardData || window.clipboardData).getData('text') || '';
    const clean = extract10DigitPhone(pasteText);
    this.value = clean;
    this.dispatchEvent(new Event('input', { bubbles: true }));
  });
}
window.attach10DigitPhoneEnforcer = attach10DigitPhoneEnforcer;

window.requireCustomerLogin = function () {
  // Authentication removed: all visitors have immediate full access
  return;
};

// Capturing phase listener: intercept booking actions if admin is offline
document.addEventListener('click', (e) => {
  const bookingTrigger = e.target.closest('.trigger-booking');
  if (bookingTrigger) {
    const isMoodOff = (localStorage.getItem('ar_admin_mood') === 'OFF' || localStorage.getItem('electro_admin_mood') === 'OFF');
    if (window.isAdminOnline === false || isMoodOff) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      if (typeof window.showAdminOfflineNotice === 'function') {
        window.showAdminOfflineNotice();
      } else {
        showToast('🔴 Admin is currently offline. Repair bookings are paused.', 'warning');
      }
      return;
    }
  }
}, true);

window.dismissWelcomeScreen = function () {};

document.addEventListener('DOMContentLoaded', () => {
  document.body.classList.remove('auth-locked');
  initLanguageSwitcher();
  initNavbar();
  initShopLocation();
  initAreaChecker();
  initEstimator();
  initTracker();
  initHeroSlideshow();
  initBookingModal();
  initAdminLogin();
  initUserLogin();
  initUserCodePill();
  initLiveBroadcast();
  initCustomerInvoiceAndReviews();
  initAdminLiveStatusWatcher();
  initUserNoticeBoard();
});

/* HERO IMAGE SLIDESHOW (3s/Image Auto Rotation) */
function initHeroSlideshow() {
  const slideshow = document.getElementById('hero-slideshow');
  if (!slideshow) return;

  const container = document.getElementById('slides-container');
  const prevBtn = document.getElementById('slide-prev');
  const nextBtn = document.getElementById('slide-next');
  const indicatorsBox = document.getElementById('slide-indicators');

  const duration = parseInt(slideshow.getAttribute('data-duration'), 10) || 3000;
  let currentIndex = 0;
  let timer = null;

  function getSlides() {
    return slideshow.querySelectorAll('.hero-slide');
  }

  const progressFill = document.getElementById('slide-progress-fill');
  let progressInterval = null;
  let progressStartTime = 0;

  function resetProgress() {
    if (!progressFill) return;
    progressFill.style.width = '0%';
    progressStartTime = Date.now();
  }

  function startProgress() {
    if (!progressFill) return;
    if (progressInterval) clearInterval(progressInterval);
    progressStartTime = Date.now();
    progressInterval = setInterval(() => {
      const elapsed = Date.now() - progressStartTime;
      const pct = Math.min(100, (elapsed / duration) * 100);
      progressFill.style.width = pct + '%';
    }, 40);
  }

  function stopProgress() {
    if (progressInterval) {
      clearInterval(progressInterval);
      progressInterval = null;
    }
  }

  function renderDots() {
    const slides = getSlides();
    if (!indicatorsBox) return;
    indicatorsBox.innerHTML = '';
    if (slides.length <= 1) return;

    slides.forEach((_, idx) => {
      const dot = document.createElement('div');
      dot.className = `slide-dot ${idx === currentIndex ? 'active' : ''}`;
      dot.setAttribute('data-index', idx);
      dot.setAttribute('title', `Slide ${idx + 1}`);
      dot.addEventListener('click', (e) => {
        e.stopPropagation();
        goToSlide(idx);
        startTimer();
      });
      indicatorsBox.appendChild(dot);
    });
  }

  function goToSlide(index) {
    const slides = getSlides();
    if (!slides.length) return;

    slides.forEach(s => s.classList.remove('active'));
    currentIndex = (index + slides.length) % slides.length;
    slides[currentIndex].classList.add('active');

    const dots = indicatorsBox ? indicatorsBox.querySelectorAll('.slide-dot') : [];
    dots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === currentIndex);
    });

    resetProgress();
  }

  function nextSlide() {
    goToSlide(currentIndex + 1);
  }

  function prevSlide() {
    goToSlide(currentIndex - 1);
  }

  function startTimer() {
    stopTimer();
    const slides = getSlides();
    if (slides.length > 1) {
      startProgress();
      timer = setInterval(nextSlide, duration);
    }
  }

  function stopTimer() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
    stopProgress();
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      nextSlide();
      startTimer();
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      prevSlide();
      startTimer();
    });
  }

  slideshow.addEventListener('mouseenter', stopTimer);
  slideshow.addEventListener('mouseleave', startTimer);

  // Touch Swipe for Mobile Devices
  let touchStartX = 0;
  slideshow.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });

  slideshow.addEventListener('touchend', (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) nextSlide();
      else prevSlide();
      startTimer();
    }
  }, { passive: true });

  renderDots();
  startTimer();

  // Global helper method so user can pass images or add extra slides anytime
  window.addHeroSlide = function(imgSrc, titleText, badgeText = 'Doorstep Expert') {
    if (!container) return;
    const slides = getSlides();
    const newSlide = document.createElement('div');
    newSlide.className = 'hero-slide';
    newSlide.setAttribute('data-slide-index', slides.length);
    newSlide.innerHTML = `
      <img src="${imgSrc}" alt="${titleText || 'AR Technician Repair Service'}">
      <div class="slide-caption">
        <span class="badge-pill amber" style="font-size:0.72rem; padding:0.2rem 0.55rem; width:fit-content;">
          <i class="fas fa-screwdriver-wrench"></i> ${badgeText}
        </span>
        <p>${titleText || 'Certified Repair Technician'}</p>
      </div>
    `;
    container.appendChild(newSlide);
    renderDots();
    startTimer();
  };
}

/* LANGUAGE TRANSLATION CONTROLLER (English, Hindi, Hinglish + Translate Button) */
function initLanguageSwitcher() {
  const translateBtn = document.getElementById('translate-btn');
  const radioInputs = document.querySelectorAll('input[name="site-language"]');

  // Interactive styling when radio changes
  radioInputs.forEach(radio => {
    radio.addEventListener('change', () => {
      document.querySelectorAll('.lang-radio-label').forEach(lbl => lbl.classList.remove('active-choice'));
      const activeLabel = radio.closest('.lang-radio-label');
      if (activeLabel) activeLabel.classList.add('active-choice');
    });
  });

  // Apply translation ONLY when user clicks the "Translate" button
  if (translateBtn) {
    translateBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const checkedRadio = document.querySelector('input[name="site-language"]:checked');
      const selectedLang = checkedRadio ? checkedRadio.value : 'en';

      localStorage.setItem('ar_site_language', selectedLang);
      applyLanguage(selectedLang, true);
    });
  }

  // Restore saved language from localStorage if available
  const savedLang = localStorage.getItem('ar_site_language');
  if (savedLang && translations[savedLang] && savedLang !== 'en') {
    const targetRadio = document.querySelector(`input[name="site-language"][value="${savedLang}"]`);
    if (targetRadio) {
      targetRadio.checked = true;
      document.querySelectorAll('.lang-radio-label').forEach(lbl => lbl.classList.remove('active-choice'));
      const parentLabel = targetRadio.closest('.lang-radio-label');
      if (parentLabel) parentLabel.classList.add('active-choice');
    }
    applyLanguage(savedLang, false);
  }
}

function applyLanguage(lang, notify = true) {
  if (!translations[lang]) return;
  currentLanguage = lang;
  const dict = translations[lang];

  // Update text & HTML for all data-i18n elements
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (dict[key] !== undefined) {
      el.innerHTML = dict[key];
    }
  });

  // Update placeholders for inputs with data-i18n-ph
  document.querySelectorAll('[data-i18n-ph]').forEach(el => {
    const key = el.getAttribute('data-i18n-ph');
    if (dict[key] !== undefined) {
      el.placeholder = dict[key];
    }
  });

  // Set html document lang
  document.documentElement.lang = lang === 'hi' ? 'hi' : (lang === 'gu' ? 'gu' : (lang === 'hinglish' ? 'hi-Latn' : 'en'));

  // Synchronize dynamic quote text if estimator exists
  if (typeof updateQuoteDisplay === 'function') {
    updateQuoteDisplay();
  }

  // Synchronize radio button selection visual states
  document.querySelectorAll('.lang-radio-label').forEach(label => {
    const radio = label.querySelector('input[type="radio"]');
    if (radio) {
      if (radio.value === lang) {
        label.classList.add('active-choice');
        radio.checked = true;
      } else {
        label.classList.remove('active-choice');
      }
    }
  });

  // Notify user with a toast
  if (notify && dict.toast_translated) {
    showToast(dict.toast_translated, 'success');
  }
}

function initNavbar() {
  const mobileToggle = document.querySelector('.mobile-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (mobileToggle && navLinks) {
    // Reset inline styles if any were set previously
    navLinks.style.display = '';
    navLinks.style.flexDirection = '';
    navLinks.style.position = '';
    navLinks.style.top = '';
    navLinks.style.left = '';
    navLinks.style.width = '';
    navLinks.style.background = '';
    navLinks.style.padding = '';

    mobileToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = navLinks.classList.toggle('mobile-open');
      mobileToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      const icon = mobileToggle.querySelector('i');
      if (icon) {
        icon.className = isOpen ? 'fas fa-times' : 'fas fa-bars';
      }
    });

    // Close when clicking any nav link
    navLinks.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('mobile-open');
        mobileToggle.setAttribute('aria-expanded', 'false');
        const icon = mobileToggle.querySelector('i');
        if (icon) icon.className = 'fas fa-bars';
      });
    });

    // Close when clicking outside navbar
    document.addEventListener('click', (e) => {
      if (navLinks.classList.contains('mobile-open') && !navLinks.contains(e.target) && !mobileToggle.contains(e.target)) {
        navLinks.classList.remove('mobile-open');
        mobileToggle.setAttribute('aria-expanded', 'false');
        const icon = mobileToggle.querySelector('i');
        if (icon) icon.className = 'fas fa-bars';
      }
    });

    // Close on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navLinks.classList.contains('mobile-open')) {
        navLinks.classList.remove('mobile-open');
        mobileToggle.setAttribute('aria-expanded', 'false');
        const icon = mobileToggle.querySelector('i');
        if (icon) icon.className = 'fas fa-bars';
      }
    });
  }
}

/* 1. ZIP CODE SERVICE AREA CHECKER */
const coveredZipCodes = ['394120', '394110', '395001', '395002', '395003', '395004', '395006', '395007', '395008', '395009', '395010', '94107', '94103'];

function initAreaChecker() {
  const btn = document.getElementById('check-zip-btn');
  const input = document.getElementById('zip-input-field');

  if (!btn || !input) return;

  btn.addEventListener('click', () => {
    const val = input.value.trim();
    if (!val) {
      const emptyMsg = currentLanguage === 'hi'
        ? 'कृपया अपना एरिया पिनकोड दर्ज करें'
        : (currentLanguage === 'gu'
          ? 'કૃપા કરીને તમારો વિસ્તાર પિનકોડ દાખલ કરો'
          : (currentLanguage === 'hinglish' ? 'Please apna area ZIP / Pincode enter karein' : 'Please enter your area ZIP / Pincode'));
      showToast(emptyMsg, 'warning');
      return;
    }

    if (coveredZipCodes.includes(val) || val.length === 5 || val.length === 6) {
      const availMsg = currentLanguage === 'hi'
        ? `🎉 क्षेत्र ${val} में डोरस्टेप होम टेक्नीशियन उपलब्ध है! 2 घंटे के भीतर सेवा।`
        : (currentLanguage === 'gu'
          ? `🎉 વિસ્તાર ${val} માં ડોરસ્ટેપ હોમ ટેકનિશિયન ઉપલબ્ધ છે! 2 કલાકમાં સેવા મળશે.`
          : (currentLanguage === 'hinglish'
            ? `🎉 Area ${val} me Doorstep Home Technician available hai! 2 hours ke andar service.`
            : `🎉 Doorstep Home Technician IS Available in area ${val}! Service within 2 hours.`));
      showToast(availMsg, 'success');
    } else {
      const reqMsg = currentLanguage === 'hi'
        ? `ℹ️ क्षेत्र ${val}: अनुरोध पर होम टेक्नीशियन उपलब्ध। दुकान रोज़ खुली है!`
        : (currentLanguage === 'gu'
          ? `ℹ️ વિસ્તાર ${val}: વિનંતી પર હોમ ટેકનિશિયન ઉપલબ્ધ છે. લોકલ દુકાન રોજેરોજ ખુલ્લી છે!`
          : (currentLanguage === 'hinglish'
            ? `ℹ️ Area ${val}: Request par home tech available. Local Shop daily open hai!`
            : `ℹ️ Area ${val}: Home technician available on request. Local Shop Drop-off open daily!`));
      showToast(reqMsg, 'info');
    }
  });
}

/* 2. COST & TURNAROUND ESTIMATOR */
const repairData = {
  tv: { name: 'Smart TV & Display', shopFee: 65, homeFee: 85, time: 'On-site 1 Hr' },
  fridge: { name: 'Refrigerator / AC PCB', shopFee: 75, homeFee: 95, time: 'On-site 1.5 Hrs' },
  mobile: { name: 'Smartphone / Tablet', shopFee: 49, homeFee: 69, time: '30 Mins' },
  laptop: { name: 'Laptop & Computer', shopFee: 79, homeFee: 99, time: 'Same-day 2 Hrs' },
  microwave: { name: 'Microwave & Oven', shopFee: 45, homeFee: 65, time: 'On-site 45 Mins' },
  fan: { name: 'Washing Machine / Home PCB', shopFee: 60, homeFee: 85, time: 'On-site 1 Hr' }
};

let selectedLocation = 'home'; // 'home' or 'shop'
let selectedCat = 'tv';

function initEstimator() {
  const locBtns = document.querySelectorAll('.loc-btn');
  const catItems = document.querySelectorAll('.cat-item');

  if (!locBtns.length) return;

  locBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      locBtns.forEach(b => b.classList.remove('selected', 'amber-selected'));
      selectedLocation = btn.dataset.loc;
      if (selectedLocation === 'home') {
        btn.classList.add('amber-selected');
      } else {
        btn.classList.add('selected');
      }
      updateQuoteDisplay();
    });
  });

  catItems.forEach(item => {
    item.addEventListener('click', () => {
      catItems.forEach(c => c.classList.remove('selected'));
      item.classList.add('selected');
      selectedCat = item.dataset.cat;
      updateQuoteDisplay();
    });
  });

  updateQuoteDisplay();
}

function updateQuoteDisplay() {
  const item = repairData[selectedCat];
  if (!item) return;

  const isHome = selectedLocation === 'home';
  const price = isHome ? item.homeFee : item.shopFee;

  let visitText = isHome ? '🏡 Doorstep Home Visit Included' : '🏪 In-Shop Express Drop-off';
  if (currentLanguage === 'hi') {
    visitText = isHome ? '🏡 डोरस्टेप होम विजिट शामिल' : '🏪 दुकान पर इन-शॉप ड्रॉप-ऑफ';
  } else if (currentLanguage === 'gu') {
    visitText = isHome ? '🏡 ડોરસ્ટેપ હોમ વિઝિટ સામેલ' : '🏪 દુકાન પર ઇન-શોપ ડ્રોપ-ઓફ';
  } else if (currentLanguage === 'hinglish') {
    visitText = isHome ? '🏡 Doorstep Home Visit Included' : '🏪 In-Shop Express Drop-off';
  }

  let timeText = item.time;
  if (currentLanguage === 'hi') {
    timeText = timeText.replace('On-site', 'साइट पर').replace('Hr', 'घंटा').replace('Hrs', 'घंटे').replace('Mins', 'मिनट').replace('Same-day', 'उसी दिन');
  } else if (currentLanguage === 'gu') {
    timeText = timeText.replace('On-site', 'સ્થળ પર').replace('Hr', 'કલાક').replace('Hrs', 'કલાક').replace('Mins', 'મિનિટ').replace('Same-day', 'તે જ દિવસે');
  }

  const priceEl = document.getElementById('calc-price');
  const typeEl = document.getElementById('calc-mode-type');
  const timeEl = document.getElementById('calc-time');

  if (priceEl) priceEl.textContent = `$${price}`;
  if (typeEl) typeEl.textContent = visitText;
  if (timeEl) timeEl.textContent = timeText;

  window.lastQuoteData = {
    category: item.name,
    location: isHome ? 'At-Home Service' : 'Shop Drop-off',
    price: price
  };
}

/* 3. TRACKER SIMULATION */
/* 3. RAPIDO & UBER STYLE LIVE GPS TRACKER (OPTION 1: SMART ROUTE ANIMATION) */
const mockOrders = {
  'HOME-7783': {
    type: 'Home Service Visit',
    device: 'Pressure Cookers & Kitchen Appliances',
    status: 'Booked',
    step: 1,
    tech: 'Afzal (Lead Electrical Specialist)',
    vehicle: 'Honda - Unicorn - GJ19 BK4745',
    otp: '7783',
    notes: 'Doorstep repair booking confirmed. Electrician Afzal is at Kosamba shop preparing specialized tools & Honda Unicorn bike for dispatch.'
  },
  'HOME-1234': {
    type: 'Home Service Visit',
    device: 'Home Electrical & Appliance Wiring',
    status: 'Electrician En Route to Doorstep',
    step: 2,
    tech: 'Afzal (Lead Electrical Specialist)',
    vehicle: 'Honda - Unicorn - GJ19 BK4745',
    otp: '1234',
    notes: 'Electrician Afzal has departed from Kosamba shop on electric bike with diagnostic multimeter, safety kit & wiring repair tools.'
  },
  'HOME-441': {
    type: 'Home Service Visit',
    device: 'Samsung 55" Smart LED TV',
    status: 'Technician En Route to Home',
    step: 2,
    tech: 'Afzal (Lead Electrical Specialist)',
    vehicle: 'Honda - Unicorn - GJ19 BK4745',
    otp: '4921',
    notes: 'Technician Afzal is en route on electric bike with diagnostic multimeter & replacement LED backlight strips.'
  },
  'SHOP-902': {
    type: 'Local Shop Drop-off',
    device: 'Dell XPS 15 Laptop',
    status: 'On Bench Diagnostic',
    step: 3,
    tech: 'Arif Patel (Shop Master Tech)',
    vehicle: 'Honda - Unicorn - GJ19 BK4745',
    otp: '6182',
    notes: 'Motherboard IC diagnostics complete. Final battery charging test underway at Kosamba shop bench.'
  },
  'HOME-7149': {
    type: 'Home Service Visit',
    device: 'LG OLED 65" TV & Audio System',
    status: 'Electrician Dispatched',
    step: 2,
    tech: 'Afzal (Lead Electrical Specialist)',
    vehicle: 'Honda - Unicorn - GJ19 BK4745',
    otp: '7394',
    notes: 'Electrician dispatched from Kosamba shop with heavy-duty testing kit.'
  },
  'HOME-5983': {
    type: 'Home Service Visit',
    device: 'Smart TV & Display (At-Home Service)',
    status: 'Service Completed',
    step: 4,
    tech: 'Afzal (Lead Electrical Specialist)',
    vehicle: 'Honda - Unicorn - GJ19 BK4745',
    otp: '2559',
    notes: 'Doorstep repair successfully verified and completed. 90-day service warranty active.'
  }
};

let currentTrackingInterval = null;
let currentTrackingMap = null;
let currentGoogleMap = null;
let currentGoogleBikeMarker = null;

// Dark night mode style for Google Maps to match website aesthetic
const googleMapDarkStyle = [
  { elementType: "geometry", stylers: [{ color: "#111827" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0b0f19" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#94a3b8" }] },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#38bdf8" }]
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#64748b" }]
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#142533" }]
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#1f2937" }]
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#0f172a" }]
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#cbd5e1" }]
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#334155" }]
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#1e293b" }]
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [{ color: "#f8fafc" }]
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#1e293b" }]
  },
  {
    featureType: "transit.station",
    elementType: "labels.text.fill",
    stylers: [{ color: "#38bdf8" }]
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#0c1524" }]
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#0284c7" }]
  },
  {
    featureType: "water",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#0c1524" }]
  }
];

// Google Maps Authentication Failure Hook (handles invalid key or missing billing)
window.gm_authFailure = function () {
  console.warn('Google Maps API key invalid or unbilled. Falling back to built-in clean map.');
  const mapElement = document.getElementById('uber-live-map');
  if (mapElement && typeof initUberLeafletMap === 'function') {
    initUberLeafletMap(true, 0.28);
  }
};

// Helper to ensure Google Maps JS API is loaded ONLY if a real API key is configured
let googleMapsLoadingPromise = null;
async function ensureGoogleMapsLoaded() {
  if (window.google && window.google.maps) return true;
  if (googleMapsLoadingPromise) return googleMapsLoadingPromise;

  googleMapsLoadingPromise = new Promise(async (resolve) => {
    try {
      let apiKey = '';
      try {
        const cfgRes = await fetch('/api/config');
        const cfg = await cfgRes.json();
        apiKey = (cfg.googleMapsApiKey || '').trim();
      } catch (e) { }

      // If no API key is set in .env, do not load Google Maps (prevents "This page can't load Google Maps correctly" popup)
      if (!apiKey) {
        return resolve(false);
      }

      // If a script tag already exists
      const existing = document.querySelector('script[src*="maps.googleapis.com"]');
      if (existing && window.google && window.google.maps) {
        return resolve(true);
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&libraries=geometry`;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve(true);
      script.onerror = () => {
        console.warn('Google Maps API failed to load, falling back to Leaflet map.');
        resolve(false);
      };
      document.head.appendChild(script);
    } catch (err) {
      resolve(false);
    }
  });

  return googleMapsLoadingPromise;
}

// Render Door Knocking scene when journey is 100% complete
function getKnockingDoorSceneHtml(techName) {
  const firstName = (techName || 'Afzal').split(' ')[0];
  return `
    <div class="tracker-door-knocking-wrapper" id="tracker-knocking-scene">
      <svg class="knock-door-svg" viewBox="0 0 215 98" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="porchLightBeam" x1="136" y1="25" x2="140" y2="92" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#fef08a" stop-opacity="0.45"/>
            <stop offset="60%" stop-color="#f59e0b" stop-opacity="0.15"/>
            <stop offset="100%" stop-color="#f59e0b" stop-opacity="0"/>
          </linearGradient>
          <filter id="bubbleAmberGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#f59e0b" flood-opacity="0.4"/>
          </filter>
        </defs>

        <!-- Porch Canopy Roof -->
        <path d="M125 14 L208 14 L212 20 L125 20 Z" fill="#0f172a" stroke="#00f2fe" stroke-width="1.5"/>

        <!-- Porch Exterior Wall Panel -->
        <rect x="128" y="20" width="84" height="72" fill="#111827"/>
        <line x1="128" y1="36" x2="212" y2="36" stroke="#1f2937" stroke-width="1"/>
        <line x1="128" y1="52" x2="212" y2="52" stroke="#1f2937" stroke-width="1"/>
        <line x1="128" y1="68" x2="212" y2="68" stroke="#1f2937" stroke-width="1"/>

        <!-- Porch Light Sconce & Amber Beam -->
        <polygon points="136,25 106,92 186,92" fill="url(#porchLightBeam)"/>
        <rect x="133" y="19" width="6" height="5" rx="1" fill="#475569"/>
        <circle cx="136" cy="25" r="4.5" fill="#fde047" class="porch-lamp-bulb"/>
        <circle cx="136" cy="25" r="8" fill="#fde047" opacity="0.25"/>

        <!-- House Address Plaque -->
        <rect x="132" y="32" width="11" height="8" rx="1.5" fill="#0b1120" stroke="#f59e0b" stroke-width="0.8"/>
        <text x="137.5" y="38" fill="#fef08a" font-size="4.5" font-weight="900" text-anchor="middle" font-family="'Outfit', sans-serif">#HOME</text>

        <!-- Customer Front Door Frame -->
        <rect x="146" y="20" width="54" height="72" rx="2" fill="#090d16" stroke="#38bdf8" stroke-width="1.8"/>

        <!-- Door Leaf with Knock Vibration -->
        <g class="customer-door-leaf">
          <rect x="149" y="23" width="48" height="69" rx="1.5" fill="#1e293b" stroke="#475569" stroke-width="1"/>
          
          <!-- Frosted Warm Glowing Windows -->
          <rect x="154" y="27" width="9" height="24" rx="1" fill="#fde047" opacity="0.9"/>
          <rect x="168" y="27" width="9" height="24" rx="1" fill="#fde047" opacity="0.9"/>
          <rect x="182" y="27" width="9" height="24" rx="1" fill="#fde047" opacity="0.9"/>
          
          <!-- Lower decorative door recessed panels -->
          <rect x="154" y="58" width="16" height="28" rx="1" fill="#0f172a" stroke="#334155" stroke-width="0.8"/>
          <rect x="175" y="58" width="16" height="28" rx="1" fill="#0f172a" stroke="#334155" stroke-width="0.8"/>
          
          <!-- Golden Door Handle -->
          <rect x="151" y="52" width="3" height="15" rx="1.5" fill="#fbbf24" stroke="#d97706" stroke-width="0.6"/>
        </g>

        <!-- Doorbell on left door jamb -->
        <rect x="138" y="44" width="5" height="10" rx="1.5" fill="#0f172a" stroke="#10b981" stroke-width="1"/>
        <circle cx="140.5" cy="49" r="1.5" fill="#10b981"/>

        <!-- Porch Concrete Step & Welcome Mat -->
        <rect x="76" y="91" width="136" height="5" rx="1" fill="#334155" stroke="#64748b" stroke-width="1"/>
        <rect x="142" y="90" width="38" height="3" rx="0.5" fill="#ea580c"/>
        <text x="161" y="92.5" fill="#ffffff" font-size="2.5" font-weight="900" text-anchor="middle">WELCOME</text>

        <!-- Technician Tool Box on Porch -->
        <rect x="58" y="75" width="16" height="15" rx="2" fill="#ff9900" stroke="#ffffff" stroke-width="1.2"/>
        <path d="M63 75 L63 72 L69 72 L69 75" stroke="#ffffff" stroke-width="1.2" fill="none"/>
        <text x="66" y="85" fill="#040914" font-size="4.5" font-weight="900" text-anchor="middle" font-family="'Outfit', sans-serif">TOOLS</text>
        <path d="M72 78 Q76 74 79 79" stroke="#ef4444" stroke-width="1.5" fill="none"/>

        <!-- PERSON: TECHNICIAN (Afzal) STANDING AT DOOR -->
        <!-- Boots -->
        <path d="M85 86 L97 86 L97 91 L84 91 Z" fill="#090d16" stroke="#475569" stroke-width="1"/>
        <path d="M101 86 L115 86 L115 91 L100 91 Z" fill="#090d16" stroke="#475569" stroke-width="1"/>

        <!-- Trousers / Legs -->
        <path d="M90 66 L90 86" stroke="#1e293b" stroke-width="7" stroke-linecap="round"/>
        <path d="M106 66 L106 86" stroke="#1e293b" stroke-width="7" stroke-linecap="round"/>
        <line x1="87" y1="76" x2="93" y2="76" stroke="#00f2fe" stroke-width="1.8"/>
        <line x1="103" y1="76" x2="109" y2="76" stroke="#00f2fe" stroke-width="1.8"/>

        <!-- Torso & High-Vis Orange Vest -->
        <path d="M98 44 L98 66" stroke="#ff9900" stroke-width="14" stroke-linecap="round"/>
        <path d="M98 45 L98 65" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>
        <circle cx="93" cy="51" r="3" fill="#0f172a"/>
        <text x="93" y="53.5" fill="#00f2fe" font-size="3.5" font-weight="900" text-anchor="middle">⚡</text>

        <!-- Left Arm & Digital Inspection Tablet -->
        <path d="M93 48 L87 58 L90 64" stroke="#38bdf8" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
        <rect x="85" y="60" width="8" height="11" rx="1" fill="#0f172a" stroke="#00f2fe" stroke-width="0.8"/>
        <line x1="87" y1="63" x2="91" y2="63" stroke="#38bdf8" stroke-width="0.8"/>
        <line x1="87" y1="66" x2="91" y2="66" stroke="#38bdf8" stroke-width="0.8"/>

        <!-- Neck & Head -->
        <line x1="98" y1="44" x2="98" y2="38" stroke="#fcd34d" stroke-width="4"/>
        <circle cx="101" cy="31" r="7.5" fill="#fcd34d"/>
        <path d="M95 31 C95 24 107 24 108 31 Z" fill="#00f2fe"/>
        <path d="M101 29 L110 29" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round"/>
        <circle cx="105" cy="31" r="1.2" fill="#0f172a"/>
        <path d="M103 34 Q106 36 108 34" stroke="#92400e" stroke-width="0.8" fill="none"/>

        <!-- Upper Arm -->
        <path d="M104 47 L119 50" stroke="#ff9900" stroke-width="5" stroke-linecap="round"/>

        <!-- KNOCKING FOREARM & FIST (ANIMATED) -->
        <g class="knocking-hand">
          <path d="M119 50 L141 45" stroke="#38bdf8" stroke-width="4.5" stroke-linecap="round"/>
          <circle cx="145" cy="44" r="4.2" fill="#fcd34d" stroke="#d97706" stroke-width="1"/>
          <path d="M142 43 L146 43 M142 45 L146 45 M142 47 L145 47" stroke="#b45309" stroke-width="0.8"/>
        </g>

        <!-- KNOCK SOUND IMPACT SHOCKWAVES (ANIMATED) -->
        <g class="knock-shockwaves">
          <path d="M150 37 Q154 44 150 51" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" fill="none"/>
          <path d="M154 32 Q160 44 154 56" stroke="#fef08a" stroke-width="1.8" stroke-linecap="round" fill="none"/>
          <path d="M158 28 Q166 44 158 60" stroke="#00f2fe" stroke-width="1.5" stroke-linecap="round" fill="none"/>
          <circle cx="148" cy="36" r="1.2" fill="#fef08a"/>
          <circle cx="149" cy="52" r="1.2" fill="#fef08a"/>
        </g>

        <!-- COMIC KNOCK ACTION BUBBLE: ✊ KNOCK KNOCK! -->
        <g class="knock-bubble-group">
          <rect x="94" y="4" width="82" height="18" rx="9" fill="#0b1120" stroke="#f59e0b" stroke-width="1.6" filter="url(#bubbleAmberGlow)"/>
          <polygon points="126,22 130,27 134,22" fill="#0b1120"/>
          <text x="135" y="16" fill="#fbbf24" font-family="'Outfit', sans-serif" font-weight="900" font-size="8" text-anchor="middle" letter-spacing="0.5">✊ KNOCK KNOCK!</text>
        </g>
      </svg>
      <div class="doorstep-arrival-tag"><i class="fas fa-hand-fist"></i> ${firstName} is knocking on customer door!</div>
    </div>
  `;
}

function showDoorKnockingScene(techName) {
  const vehicleElem = document.getElementById('tracker-vehicle-elem');
  if (vehicleElem) {
    vehicleElem.remove();
  }
  const roadContainer = document.querySelector('.tracker-road-container');
  if (roadContainer && !document.getElementById('tracker-knocking-scene')) {
    const knockingHtml = getKnockingDoorSceneHtml(techName);
    roadContainer.insertAdjacentHTML('afterbegin', knockingHtml);
  }
  const roadAsphalt = document.querySelector('.tracker-asphalt-road');
  if (roadAsphalt) {
    roadAsphalt.classList.add('road-stopped');
  }
  const homeStation = document.querySelector('.station-pill.home');
  if (homeStation) {
    homeStation.classList.add('station-arrived');
  }
  const statusText = document.getElementById('vehicle-status-text');
  if (statusText) {
    statusText.textContent = '🚪 Electrician Arrived & Knocking at Customer Door!';
  }
  const speedEl = document.getElementById('live-speed-ticker');
  if (speedEl) {
    speedEl.innerHTML = '<i class="fas fa-door-open"></i> At Customer Door';
  }
}

// ========================================================
// RENDER THANKS NOTE WHEN WORK & PAYMENT IS DONE (STEP 4)
// ========================================================
window.viewBillReceiptForActiveOrder = function () {
  if (typeof showCustomerInvoiceFromTracker === 'function' && window._activeTrackingOrder) {
    showCustomerInvoiceFromTracker(window._activeTrackingOrder);
  }
};

window.rateActiveOrder = function () {
  if (typeof openCustomerReviewModal === 'function' && window._activeTrackingOrder) {
    openCustomerReviewModal(window._activeTrackingOrder);
  }
};

window.openNewBookingFromThanks = function () {
  const isMoodOff = (localStorage.getItem('ar_admin_mood') === 'OFF' || localStorage.getItem('electro_admin_mood') === 'OFF');
  if (window.isAdminOnline === false || isMoodOff) {
    if (typeof window.showAdminOfflineNotice === 'function') {
      window.showAdminOfflineNotice();
    } else {
      showToast('🔴 Admin is currently offline. Repair bookings are paused.', 'warning');
    }
    return;
  }
  if (!window.isCustomerLoggedIn()) {
    window._pendingAuthAction = 'booking';
    if (typeof window.openLoginModal === 'function') {
      window.openLoginModal(true);
    }
    showToast('🔒 Please log in or sign up to book a repair service.', 'info');
    return;
  }
  const modal = document.getElementById('booking-modal');
  if (modal) modal.classList.add('active');
};

function renderThanksNote(order, box) {
  if (!box || !order) return;
  window._activeTrackingOrder = order;

  const custName = (order.customer_name || 'Valued Customer').trim();
  const techName = order.assigned_tech && !order.assigned_tech.toLowerCase().includes('unassigned')
    ? order.assigned_tech
    : 'Afzal (Lead Electrical Specialist)';
  const deviceName = order.device_name || 'Appliance';
  const trackingCode = order.tracking_code || '---';
  const serviceTypeLabel = order.service_type === 'home' ? '🏠 Doorstep Home Service' : '🏬 Workshop Drop-Off';
  const priceDisplay = order.price_estimate ? `₹${parseFloat(order.price_estimate).toFixed(2)}` : 'Verified & Settled';
  const techPhone = order.tech_phone || '+91 6351618067';
  const cleanPhone = String(techPhone).replace(/\D/g, '');

  box.innerHTML = `
    <div class="thanks-note-container" id="tracker-thanks-card">
      
      <!-- Top Header & Badges -->
      <div class="thanks-header">
        <div class="thanks-badges-row">
          <span class="thanks-badge-pill">
            <i class="fas fa-circle-check"></i> STEP 4: WORK DONE & PAYMENT COMPLETED
          </span>
          <span class="thanks-badge-pill gold">
            <i class="fas fa-shield-halved"></i> 100% SERVICE VERIFIED
          </span>
          <span class="thanks-badge-pill cyan">
            <i class="fas fa-ticket-simple"></i> #${escapeHtml(trackingCode)}
          </span>
        </div>

        <h2 class="thanks-hero-title">
          🎉 Thank You, <span class="gradient-text">${escapeHtml(custName)}!</span>
        </h2>
        <p class="thanks-hero-subtitle">
          Your repair service is fully completed and payment has been verified. Thank you for choosing <strong>AR Technician Work</strong> for your home electrical & appliance care!
        </p>
      </div>

      <!-- Personal Thank You Note from Afzal -->
      <div class="thanks-letter-card">
        <div class="thanks-letter-header">
          <div class="thanks-tech-identity">
            <div class="thanks-tech-avatar">
              <i class="fas fa-user-shield"></i>
              <span class="thanks-avatar-check"><i class="fas fa-check"></i></span>
            </div>
            <div class="thanks-tech-meta">
              <h4>${escapeHtml(techName)} <span class="thanks-verified-tag"><i class="fas fa-certificate"></i> Certified Master Technician</span></h4>
              <p>Founder & Lead Specialist • AR Technician Work (Kosamba)</p>
            </div>
          </div>
          <div class="thanks-rating-badge">
            <i class="fas fa-star"></i> 4.9 (180+ Doorstep Visits)
          </div>
        </div>

        <div class="thanks-letter-content">
          <div class="thanks-quote-icon">“</div>
          <p>
            Dear <strong>${escapeHtml(custName)}</strong>,<br>
            Thank you for trusting me with your <strong>${escapeHtml(deviceName)}</strong>. It was an absolute pleasure serving you! Your appliance has been thoroughly diagnosed, repaired with genuine quality parts, and tested for electrical safety and optimal performance.
          </p>
          <p style="margin-bottom:0; color:#94a3b8; font-size:0.92rem;">
            Your payment is confirmed and your digital warranty is active. If you ever have any questions, require follow-up support, or need assistance with other home appliances, please never hesitate to call or message me.
          </p>

          <div class="thanks-signature-block">
            <div>
              <div class="thanks-signature-name">Afzal</div>
              <div class="thanks-signature-stamp"><i class="fas fa-location-dot" style="color:#00f2fe;"></i> Kosamba, Surat District</div>
            </div>
            <div style="text-align:right;">
              <span style="font-size:0.75rem; color:#64748b; text-transform:uppercase; font-weight:600;">Status</span>
              <div style="color:#10b981; font-weight:700; font-size:0.9rem;"><i class="fas fa-circle-check"></i> Work Done & Paid</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Completed 4-Step Pipeline Bar -->
      <div class="pipeline-steps-wrapper" style="margin-bottom: 2rem;">
        <div class="pipeline-timeline-bar">
          <div class="pipeline-timeline-fill" style="width: 100%;"></div>
        </div>
        <div class="pipeline-steps">
          <div class="pipeline-step completed">
            <div class="step-circle"><i class="fas fa-check"></i></div>
            <div class="step-title">1. Booking Confirmed</div>
            <span class="step-status-tag done">✓ Confirmed</span>
          </div>
          <div class="pipeline-step completed">
            <div class="step-circle"><i class="fas fa-check"></i></div>
            <div class="step-title">2. On The Way</div>
            <span class="step-status-tag done">✓ Arrived</span>
          </div>
          <div class="pipeline-step completed">
            <div class="step-circle"><i class="fas fa-check"></i></div>
            <div class="step-title">3. Repair at Home</div>
            <span class="step-status-tag done">✓ Fixed</span>
          </div>
          <div class="pipeline-step completed">
            <div class="step-circle"><i class="fas fa-circle-check"></i></div>
            <div class="step-title">4. Work Done & Payment</div>
            <span class="step-status-tag done">✓ Completed & Paid</span>
          </div>
        </div>
      </div>

      <!-- Service & Payment Details Summary Grid -->
      <div class="thanks-summary-grid">
        <div class="thanks-summary-card">
          <div class="thanks-summary-icon">
            <i class="fas fa-screwdriver-wrench"></i>
          </div>
          <div>
            <div class="thanks-summary-label">Appliance Serviced</div>
            <div class="thanks-summary-val" title="${escapeHtml(deviceName)}">${escapeHtml(deviceName)}</div>
          </div>
        </div>

        <div class="thanks-summary-card">
          <div class="thanks-summary-icon cyan">
            <i class="fas fa-route"></i>
          </div>
          <div>
            <div class="thanks-summary-label">Service Type</div>
            <div class="thanks-summary-val">${serviceTypeLabel}</div>
          </div>
        </div>

        <div class="thanks-summary-card">
          <div class="thanks-summary-icon gold">
            <i class="fas fa-receipt"></i>
          </div>
          <div>
            <div class="thanks-summary-label">Work & Payment</div>
            <div class="thanks-summary-val" style="color:#34d399;">${priceDisplay} • Paid</div>
          </div>
        </div>

        <div class="thanks-summary-card">
          <div class="thanks-summary-icon purple">
            <i class="fas fa-shield-check"></i>
          </div>
          <div>
            <div class="thanks-summary-label">Warranty Protection</div>
            <div class="thanks-summary-val">30 Days Guarantee</div>
          </div>
        </div>
      </div>

      <!-- Quick Action Buttons -->
      <div class="thanks-actions-container">
        <div class="thanks-actions-title">
          <i class="fas fa-hand-pointer" style="color:var(--primary); margin-right:4px;"></i> Customer Options & Quick Actions
        </div>
        <div class="thanks-actions-grid">
          <button type="button" class="btn-thanks-action bill" onclick="window.viewBillReceiptForActiveOrder()">
            <i class="fas fa-file-invoice-dollar"></i> Verified Bill & Receipt
          </button>
          <button type="button" class="btn-thanks-action rate" onclick="window.rateActiveOrder()">
            <i class="fas fa-star"></i> Rate Us & Review
          </button>
          <a href="https://wa.me/91${cleanPhone.slice(-10) || '6351618067'}?text=Hello%20Afzal,%20thank%20you%20for%20completing%20repair%20order%20%23${escapeHtml(trackingCode)}" target="_blank" class="btn-thanks-action whatsapp">
            <i class="fab fa-whatsapp"></i> Chat on WhatsApp
          </a>
          <a href="tel:${techPhone}" class="btn-thanks-action call">
            <i class="fas fa-phone"></i> Call Afzal
          </a>
          <button type="button" class="btn-thanks-action book" onclick="window.openNewBookingFromThanks()">
            <i class="fas fa-calendar-plus"></i> Book Another Repair
          </button>
        </div>
      </div>

      <!-- Trust Badges Footer -->
      <div class="thanks-trust-row">
        <div class="thanks-trust-item">
          <i class="fas fa-certificate" style="color:#10b981;"></i> 100% Genuine Spare Parts
        </div>
        <div class="thanks-trust-item">
          <i class="fas fa-bolt" style="color:#fbbf24;"></i> Certified Electrical Safety Tested
        </div>
        <div class="thanks-trust-item">
          <i class="fas fa-clock-rotate-left" style="color:#38bdf8;"></i> Rapid Response in Kosamba Area
        </div>
      </div>

    </div>
  `;
}

function initTracker() {
  const btn = document.getElementById('track-btn');
  const input = document.getElementById('track-input');
  const box = document.getElementById('track-result');

  if (!btn || !input || !box) return;

  async function doTrack(id) {
    const query = id.trim().toUpperCase();
    if (!query) {
      showToast('Please enter a valid order tracking code', 'warning');
      return;
    }

    if (currentTrackingInterval) {
      clearInterval(currentTrackingInterval);
      currentTrackingInterval = null;
    }
    if (currentTrackingMap) {
      try { currentTrackingMap.remove(); } catch (e) { }
      currentTrackingMap = null;
    }
    currentGoogleMap = null;
    currentGoogleBikeMarker = null;

    box.style.display = 'block';
    box.innerHTML = `<div style="text-align:center; padding:2.5rem;"><i class="fas fa-satellite-dish fa-spin" style="font-size:2.2rem; color:var(--primary);"></i><p style="margin-top:0.75rem; color:var(--text-muted); font-size:0.95rem;">Initializing live route telemetry for #${query}...</p></div>`;

    let order = null;
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(query)}`);
      const resData = await res.json();
      if (resData.success && resData.order) {
        order = resData.order;
      }
    } catch (err) {
      console.warn('Backend query notice:', err);
    }

    if (!order) {
      // 1. Check logged-in customer's orders
      const user = window.getCurrentCustomerUser ? window.getCurrentCustomerUser() : null;
      if (user && user.orders && user.orders.length > 0) {
        const found = user.orders.find(o => (o.tracking_code || '').toUpperCase() === query);
        if (found) {
          order = {
            tracking_code: query,
            device_name: found.device_name || found.device_category || 'Home Appliance Service',
            customer_name: user.name || 'Valued Customer',
            assigned_tech: found.assigned_tech || 'Afzal (Lead Electrical Specialist)',
            vehicle: found.vehicle || 'Honda - Unicorn - GJ19 BK4745',
            status: found.status || 'Booked',
            service_type: found.service_type || 'home',
            notes: found.notes || 'Order registered. Electrician is preparing specialized tools & Honda Unicorn bike at Kosamba Workshop.',
            step: found.step || 1,
            otp: found.otp || '5192'
          };
        }
      }

      // 2. Check local bookings list
      if (!order) {
        try {
          const locals = JSON.parse(localStorage.getItem('ar_local_bookings') || '[]');
          const foundLocal = locals.find(b => (b.tracking_code || '').toUpperCase() === query);
          if (foundLocal) {
            order = {
              tracking_code: query,
              device_name: foundLocal.device_name || foundLocal.device_category || 'Home Appliance Service',
              customer_name: foundLocal.customer_name || foundLocal.name || 'Valued Customer',
              assigned_tech: foundLocal.assigned_tech || 'Afzal (Lead Electrical Specialist)',
              vehicle: foundLocal.vehicle || 'Honda - Unicorn - GJ19 BK4745',
              status: foundLocal.status || 'Booked',
              service_type: foundLocal.service_type || 'home',
              notes: foundLocal.notes || 'Order registered. Electrician is preparing specialized tools & Honda Unicorn bike at Kosamba Workshop.',
              step: foundLocal.step || 1,
              otp: foundLocal.otp || '5192'
            };
          }
        } catch (e) {}
      }

      // 3. Mock fallback
      if (!order) {
        const mock = mockOrders[query] || {
          device: `Electronic Item (${query})`,
          customer_name: 'Valued Customer',
          tech: 'Afzal (Lead Electrical Specialist)',
          vehicle: 'Honda - Unicorn - GJ19 BK4745',
          status: 'Booked',
          service_type: query.startsWith('SHOP') ? 'shop' : 'home',
          notes: `Order #${query} registered. Electrician is preparing specialized tools & Honda Unicorn bike at Kosamba Workshop.`,
          step: 1,
          otp: '5192'
        };
        order = {
          tracking_code: query,
          device_name: mock.device || mock.device_name,
          customer_name: mock.customer_name || 'Valued Customer',
          assigned_tech: mock.tech || mock.assigned_tech,
          vehicle: mock.vehicle || 'Honda - Unicorn - GJ19 BK4745',
          status: mock.status || 'Booked',
          service_type: mock.service_type || 'home',
          notes: mock.notes,
          step: mock.step || 1,
          otp: mock.otp || '4921'
        };
      }
    }

    // 1. Fetch latest electrician location (admin live online mood)
    let adminIsOnline = (window.isAdminOnline !== false);
    try {
      const statRes = await fetch('/api/admin/status');
      const statData = await statRes.json();
      if (statData && statData.success) {
        adminIsOnline = (statData.is_online === true || statData.status_mood === 'ON');
        window.isAdminOnline = adminIsOnline;
      }
    } catch (e) { }

    const isHomeService = (order.service_type === 'home');
    const techName = order.assigned_tech && !order.assigned_tech.toLowerCase().includes('unassigned')
      ? order.assigned_tech
      : 'Afzal (Lead Electrical Specialist)';
    const techShort = techName.split(' ')[0];

    const statusStr = (order.status || '').trim();
    const statusLower = statusStr.toLowerCase();

    // Rejected / Declined / Cancelled by Admin:
    const isRejected = Boolean(
      statusLower.includes('reject') ||
      statusLower.includes('cancel') ||
      statusLower.includes('decline') ||
      order.step === 0
    );

    const isCompleted = !isRejected && Boolean(
      statusLower.includes('complete') ||
      statusLower.includes('done') ||
      statusLower.includes('finish') ||
      order.step >= 4
    );

    // At Your Home: Arrived at Doorstep and ready for inspection & repair
    const isAtHome = !isCompleted && !isRejected && (
      statusLower.includes('at your home') ||
      statusLower.includes('at youe home') ||
      statusLower.includes('at home') ||
      statusLower.includes('doorstep') ||
      statusLower.includes('diagnos') ||
      statusLower.includes('repair') ||
      order.step === 3
    );

    // Departure from Shop: Admin has DISPATCHED the technician! Bike tracks and runs live!
    const isDeparture = !isCompleted && !isRejected && !isAtHome && (
      statusLower.includes('departure') ||
      statusLower.includes('depart') ||
      statusLower.includes('dispatch') ||
      statusLower.includes('route') ||
      statusLower.includes('transit') ||
      statusLower.includes('way') ||
      order.step === 2
    );

    // At Shop / Accept: Waiting at Kosamba Workshop (Accepted by admin, preparing tools)
    const isAtShop = !isCompleted && !isRejected && !isAtHome && !isDeparture;

    // The bike can ONLY run on the map if:
    // 1) Admin's (electrician) location is ON (adminIsOnline === true)
    // 2) Status is "Departure from shop" (isDeparture === true)
    // 3) Not rejected, at home or completed!
    const canBikeRun = adminIsOnline && isDeparture && !isCompleted && !isRejected && !isAtHome;

    window._currentTrackingCanRun = canBikeRun;
    window._activeTrackingOrder = order;
    try {
      if (order && order.tracking_code) {
        localStorage.setItem('last_tracking_code', order.tracking_code);
        if (typeof prefillFeedbackUser === 'function') {
          prefillFeedbackUser(order);
        }
      }
    } catch (e) { }

    let progressFactor = (isCompleted || isAtHome) ? 1.0 : (isDeparture ? 0.32 : 0.08);
    let secondsLeft = (isCompleted || isAtHome) ? 0 : (isDeparture ? (isHomeService ? 780 : 1150) : 900);
    const startOtp = order.otp || `${(Math.abs(order.tracking_code.split('').reduce((a, b) => a + b.charCodeAt(0), 1000)) % 8999) + 1000}`;

    const vehicleTitle = order.vehicle || 'Honda - Unicorn - GJ19 BK4745';
    const vehicleIcon = 'fa-motorcycle';
    const modeBadge = isHomeService ? '🏠 Doorstep Home Visit' : '🏬 Local Shop Drop-Off';

    // Build headline HTML based on admin location & order state
    let headlineHtml = '';
    if (isCompleted) {
      headlineHtml = `<span class="live-pulse-dot" style="background:#10b981;"></span> <strong style="color:#34d399;"><i class="fas fa-circle-check"></i> DESTINATION REACHED</strong> • Order #${order.tracking_code}`;
    } else if (isRejected) {
      headlineHtml = `<span class="live-pulse-dot" style="background:#ef4444;"></span> <strong style="color:#f87171;"><i class="fas fa-circle-xmark"></i> BOOKING REJECTED • BIKE NOT DISPATCHED</strong> • Order #${order.tracking_code}`;
    } else if (isDeparture && !adminIsOnline) {
      headlineHtml = `<span class="live-pulse-dot" style="background:#ef4444;"></span> <strong style="color:#f87171;"><i class="fas fa-location-crosshairs"></i> LOCATION OFF • LIVE TRACKING UNAVAILABLE</strong> • Order #${order.tracking_code}`;
    } else if (isAtHome) {
      headlineHtml = `<span class="live-pulse-dot" style="background:#10b981;"></span> <strong style="color:#34d399;"><i class="fas fa-house-chimney-user"></i> AT YOUR HOME • ELECTRICIAN ARRIVED</strong> • Order #${order.tracking_code}`;
    } else if (isDeparture) {
      headlineHtml = `<span class="live-pulse-dot"></span> <strong style="color:#60a5fa;"><i class="fas fa-location-arrow"></i> DEPARTURE FROM SHOP • LIVE GPS ROUTE ACTIVE</strong> • Order #${order.tracking_code}`;
    } else {
      headlineHtml = `<span class="live-pulse-dot" style="background:#38bdf8;"></span> <strong style="color:#38bdf8;"><i class="fas fa-clock"></i> BOOKING ACCEPTED • AT WORKSHOP PREPARING</strong> • Order #${order.tracking_code}`;
    }

    // Build speed pill HTML
    let speedHtml = '';
    if (isCompleted || isAtHome) {
      speedHtml = `<i class="fas fa-house-chimney"></i> 0 km/h • At Customer Home`;
    } else if (isRejected) {
      speedHtml = `<i class="fas fa-ban"></i> 0 km/h • Booking Rejected (Stopped)`;
    } else if (isDeparture && !adminIsOnline) {
      speedHtml = `<i class="fas fa-pause-circle"></i> Location Sharing OFF`;
    } else if (isDeparture) {
      speedHtml = `<i class="fas fa-gauge-high"></i> 32 km/h • Traveling to Customer`;
    } else {
      speedHtml = `<i class="fas fa-warehouse"></i> 0 km/h • Parked at Workshop`;
    }

    // Build ETA text
    let etaText = '';
    if (isCompleted || isAtHome) etaText = 'Arrived at Doorstep';
    else if (isRejected) etaText = 'Declined';
    else if (isDeparture && !adminIsOnline) etaText = 'Unavailable (Location OFF)';
    else if (isDeparture) etaText = `${Math.floor(secondsLeft / 60)}m ${secondsLeft % 60}s`;
    else etaText = `${order.eta_minutes || '15 mins'} (At Workshop)`;

    // Build Distance text
    let distText = '';
    if (isCompleted || isAtHome) distText = '0.0 km (At Doorstep)';
    else if (isRejected) distText = '0.0 km (Booking Rejected)';
    else if (isDeparture && !adminIsOnline) distText = 'Paused (Location OFF)';
    else if (isDeparture) distText = `${((1 - progressFactor) * 3.8).toFixed(1)} km away`;
    else distText = '3.8 km away (At Workshop)';

    // Build Middle Radar text (concise to keep stations row clean on 1 line)
    let radarText = '';
    if (isCompleted || isAtHome) radarText = '🚪 Electrician Arrived at Your Home Doorstep!';
    else if (isRejected) radarText = '❌ Booking Request Rejected • Technician Not Dispatched';
    else if (isDeparture && !adminIsOnline) radarText = `📍 Live Tracking Unavailable • Electrician Location is OFF`;
    else if (isDeparture) radarText = '⚡ Departure from Shop • Electrician En Route';
    else radarText = '✅ Booking Accepted • Electrician Preparing at Workshop';

    // Build Radar pill label over bike
    let bikeRadarLabel = '';
    if (isRejected) bikeRadarLabel = `❌ ${techShort} (Rejected)`;
    else if (isAtHome) bikeRadarLabel = `🏠 ${techShort} (At Home)`;
    else if (canBikeRun) bikeRadarLabel = `⚡ ${techShort} (32 km/h)`;
    else if (isDeparture && !adminIsOnline) bikeRadarLabel = `📍 ${techShort} (Location OFF)`;
    else bikeRadarLabel = `🗓️ ${techShort} (At Workshop)`;

    // Progress text
    let progressPctText = '';
    if (isCompleted || isAtHome) progressPctText = '100% Journey Completed (At Customer Home)';
    else if (isRejected) progressPctText = '0% Journey (Booking Rejected • Bike Stopped)';
    else if (isDeparture && !adminIsOnline) progressPctText = 'Live Tracking Paused • Location is OFF';
    else if (isDeparture) progressPctText = `${Math.round(progressFactor * 100)}% Journey Completed • 32 km/h`;
    else progressPctText = '0% Journey (Parked at Kosamba Workshop)';

    // Calculate current step number (1 = Accept, 2 = Departure from Shop, 3 = At Your Home, 4 = Completed)
    let currentStepNumber = 1;
    if (isCompleted) currentStepNumber = 4;
    else if (isAtHome) currentStepNumber = 3;
    else if (isDeparture) currentStepNumber = 2;
    else if (isRejected) currentStepNumber = 0;
    else currentStepNumber = 1;

    // Friendly, easy-to-understand status descriptions and progress
    let timelineFillWidth = '0%';
    let statusIconClass = 'booked';
    let statusIcon = 'fa-calendar-check';
    let statusBadgeLabel = '✅ STEP 1: BOOKING ACCEPTED';
    let statusHeadline = 'Booking Confirmed • At Workshop';
    let statusDescription = 'Your booking is accepted! Electrician Afzal is preparing specialized tools at Kosamba Workshop.';

    if (isRejected) {
      timelineFillWidth = '0%';
      statusIconClass = 'cancelled';
      statusIcon = 'fa-circle-xmark';
      statusBadgeLabel = '❌ BOOKING DECLINED';
      statusHeadline = 'Repair Booking Declined / Cancelled';
      statusDescription = 'This doorstep repair request has been cancelled or declined by the workshop.';
    } else if (isCompleted) {
      timelineFillWidth = '100%';
      statusIconClass = 'completed';
      statusIcon = 'fa-circle-check';
      statusBadgeLabel = '✅ STEP 4: WORK DONE & PAYMENT';
      statusHeadline = 'Appliance Repaired & Work Done';
      statusDescription = 'All repair work is completed and verified. Your digital bill receipt and payment confirmation are ready!';
    } else if (isAtHome) {
      timelineFillWidth = '100%';
      statusIconClass = 'diagnose';
      statusIcon = 'fa-house-chimney';
      statusBadgeLabel = '🏠 STEP 3: AT YOUR HOME';
      statusHeadline = 'Electrician Arrived at Your Home';
      statusDescription = 'Electrician Afzal has arrived at your home doorstep for inspection & repair.';
    } else if (isDeparture) {
      timelineFillWidth = '50%';
      statusIconClass = 'dispatch';
      statusIcon = 'fa-motorcycle';
      if (!adminIsOnline) {
        statusBadgeLabel = '⚠️ STEP 2: LOCATION IS OFF';
        statusHeadline = 'Electrician Departed • Location is OFF';
        statusDescription = 'Electrician Afzal has departed from the shop, but location sharing is currently turned OFF. Live tracking will become active when location is switched ON.';
      } else {
        statusBadgeLabel = '🏍️ STEP 2: DEPARTURE FROM SHOP';
        statusHeadline = 'Electrician is Riding to Your Home';
        statusDescription = `Electrician Afzal has departed from the shop on ${vehicleTitle} and is traveling towards your address.`;
      }
    }

    // IF WORK & PAYMENT IS DONE: CHANGE TRACKING INTERFACE TO THANKS NOTE!
    if (isCompleted) {
      if (currentTrackingInterval) {
        clearInterval(currentTrackingInterval);
        currentTrackingInterval = null;
      }
      renderThanksNote(order, box);
      return;
    }

    box.innerHTML = `
      <div class="uber-tracking-header">
        <div>
          <div style="font-size:0.85rem; color:var(--text-muted); display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
            <span id="tracker-status-headline" style="display:inline-flex; align-items:center; gap:8px;">${headlineHtml}</span>
            <span class="speed-pill" id="live-speed-ticker" style="${!adminIsOnline ? 'background:rgba(239,68,68,0.15); border-color:rgba(239,68,68,0.3); color:#fca5a5;' : ''}">${speedHtml}</span>
            <span class="otp-pill"><i class="fas fa-shield-halved"></i> Start OTP: <strong>${startOtp}</strong></span>
          </div>
          <h3 style="font-size:1.35rem; margin-top:0.35rem; color:#fff;">
            <i class="fas ${vehicleIcon}" style="color:var(--secondary); margin-right:6px;"></i> ${order.device_name}
          </h3>
          <p style="font-size:0.88rem; color:var(--text-muted); margin-top:3px;">
            ${modeBadge} • Customer: <strong>${order.customer_name || 'Valued Customer'}</strong>
          </p>
        </div>
        
        <div style="display:flex; gap:0.75rem; align-items:center; flex-wrap:wrap;">
          <div class="eta-box">
            <i class="fas fa-clock" style="color:var(--primary);"></i>
            <div>
              <div style="font-size:0.7rem; text-transform:uppercase; color:var(--text-muted); font-weight:600;">Estimated Arrival</div>
              <div id="live-eta-ticker">${etaText}</div>
            </div>
          </div>
          <div style="background:rgba(255,153,0,0.12); border:1px solid rgba(255,153,0,0.3); padding:0.5rem 1rem; border-radius:10px; color:var(--secondary); font-weight:700;">
            <div style="font-size:0.7rem; text-transform:uppercase; color:var(--text-muted); font-weight:600;">Distance</div>
            <div id="live-dist-ticker">${distText}</div>
          </div>
        </div>
      </div>

      <!-- Desktop Animated Electrician Vehicle Dispatch Stage -->
      <div class="vehicle-tracker-stage">
        <div class="tracker-skyline"></div>

        <!-- Top Stations: Kosamba Workshop -> Customer Doorstep -->
        <div class="tracker-stations-row">
          <div class="station-pill shop">
            <div class="station-icon"><i class="fas fa-store"></i></div>
            <div class="station-text">
              <strong>Kosamba Workshop</strong>
              <span>${isDispatched ? 'Dispatched • En Route' : 'Origin • Jain Mandir Rd'}</span>
            </div>
          </div>

          <!-- Radar Status Pill in Middle -->
          <div class="stage-radar-center" id="radar-search-badge" style="${isCompleted ? 'border-color:rgba(16,185,129,0.5); color:#34d399;' : (!adminIsOnline ? 'border-color:rgba(239,68,68,0.4); color:#fca5a5;' : '')}">
            <span class="live-pulse-dot" style="${isCompleted ? 'background:#10b981;' : (!adminIsOnline ? 'background:#ef4444;' : '')}"></span>
            <span id="vehicle-status-text">${radarText}</span>
          </div>

          <div class="station-pill home ${isCompleted ? 'station-arrived' : ''}">
            <div class="station-icon"><i class="fas fa-house-chimney"></i></div>
            <div class="station-text">
              <strong>Customer Doorstep</strong>
              <span>Destination • Home Visit</span>
            </div>
          </div>
        </div>

        <!-- Road Track Canvas with Moving Vehicle OR Doorstep Knocking Person -->
        <div class="tracker-road-container">
          ${isDiagnosing ? getKnockingDoorSceneHtml(techName) : `
            <!-- Animated Moving Vehicle Element -->
            <div class="tracker-vehicle-wrapper ${canBikeRun ? '' : 'bike-stopped'}" id="tracker-vehicle-elem" style="left: ${Math.min(82, Math.max(8, progressFactor * 78))}%;">
              <!-- Floating Radar Halo -->
              <div class="vehicle-radar-halo">
                <span class="radar-ping-ring"></span>
                <span id="vehicle-radar-label">${bikeRadarLabel}</span>
              </div>

              <!-- Headlight Beam -->
              <div class="headlight-cone"></div>

              <!-- SVG Animated Electrician Bike -->
              <svg width="105" height="65" viewBox="0 0 105 65" fill="none" xmlns="http://www.w3.org/2000/svg">
                <!-- Vehicle Body & Frame -->
                <path d="M68 20 L74 38 L68 46 L58 46 Z" fill="#00f2fe"/>
                <path d="M68 20 L66 14 L62 14" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round"/>
                <!-- Headlight glow unit -->
                <circle cx="74" cy="38" r="4" fill="#fff" stroke="#ffeb3b" stroke-width="1.5"/>
                <!-- Seat & Footboard -->
                <path d="M38 32 L58 32 L58 46 L34 46 Z" fill="#0f172a" stroke="#00f2fe" stroke-width="1.5"/>
                <!-- Technician Tool Box (Rear Trunk) -->
                <rect x="22" y="24" width="20" height="15" rx="3" fill="#ff9900" stroke="#ffffff" stroke-width="1.5"/>
                <text x="32" y="34" fill="#040914" font-family="'Outfit', sans-serif" font-weight="900" font-size="7" text-anchor="middle">AR</text>
                <!-- Electrician Rider Body -->
                <path d="M48 24 L54 36 L62 44" stroke="#38bdf8" stroke-width="5" stroke-linecap="round"/>
                <!-- Rider Torso with Safety High-Viz Vest -->
                <path d="M46 16 L52 28" stroke="#ff9900" stroke-width="8" stroke-linecap="round"/>
                <path d="M47 18 L51 26" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/>
                <!-- Rider Arm to Handle -->
                <path d="M48 18 L64 16" stroke="#38bdf8" stroke-width="3.5" stroke-linecap="round"/>
                <!-- Rider Helmet -->
                <circle cx="46" cy="11" r="7" fill="#00f2fe" stroke="#ffffff" stroke-width="1.5"/>
                <path d="M48 10 L52 11 L50 14 Z" fill="#0f172a"/>
                <!-- Rear Wheel -->
                <g class="wheel-rotate" style="transform-origin: 30px 48px;">
                  <circle cx="30" cy="48" r="11" fill="#090d16" stroke="#ffffff" stroke-width="2"/>
                  <circle cx="30" cy="48" r="6" fill="#1e293b"/>
                  <line x1="30" y1="37" x2="30" y2="59" stroke="#00f2fe" stroke-width="1.5"/>
                  <line x1="19" y1="48" x2="41" y2="48" stroke="#00f2fe" stroke-width="1.5"/>
                </g>
                <!-- Front Wheel -->
                <g class="wheel-rotate" style="transform-origin: 75px 48px;">
                  <circle cx="75" cy="48" r="11" fill="#090d16" stroke="#ffffff" stroke-width="2"/>
                  <circle cx="75" cy="48" r="6" fill="#1e293b"/>
                  <line x1="75" y1="37" x2="75" y2="59" stroke="#00f2fe" stroke-width="1.5"/>
                  <line x1="64" y1="48" x2="86" y2="48" stroke="#00f2fe" stroke-width="1.5"/>
                </g>
              </svg>
            </div>
          `}

          <!-- Asphalt Road with Moving Dash Lines -->
          <div class="tracker-asphalt-road ${canBikeRun ? '' : 'road-stopped'}">
            <div class="tracker-lane-markings"></div>
          </div>
        </div>

        <!-- Live Route Progress Bar -->
        <div style="position: relative; z-index: 5;">
          <div style="display:flex; justify-content:space-between; font-size:0.75rem; color:var(--text-muted); margin-bottom:4px;">
            <span><i class="fas fa-flag-checkered"></i> 0.0 km (Shop Dispatch)</span>
            <span id="live-progress-pct">${progressPctText}</span>
            <span><i class="fas fa-house"></i> 3.8 km (Your Home)</span>
          </div>
          <div class="tracker-progress-track">
            <div class="tracker-progress-fill" id="tracker-bar-fill" style="width: ${(isCompleted || isDiagnosing) ? '100%' : (isAtShop ? '0%' : `${progressFactor * 100}%`)};"></div>
          </div>
        </div>
      </div>

      <!-- Clean & Professional Electrician Profile Card -->
      <div class="driver-card-overlay">
        <div class="driver-profile-left" style="display:flex; align-items:center; gap:1rem; flex-wrap:wrap;">
          <div class="driver-avatar">
            <i class="fas fa-user-shield"></i>
            <div class="driver-badge-verified"><i class="fas fa-check"></i></div>
          </div>
          <div class="driver-info">
            <div style="display:flex; align-items:center; gap:0.6rem; flex-wrap:wrap;">
              <h4 style="margin:0; font-size:1.15rem; color:#fff;">${techName}</h4>
              <span style="background:rgba(251,191,36,0.15); border:1px solid rgba(251,191,36,0.3); color:#fbbf24; font-size:0.75rem; font-weight:700; padding:2px 8px; border-radius:6px;">
                ★ 4.9 (180+ Doorstep Visits)
              </span>
            </div>
            <div class="driver-meta" style="margin-top:0.45rem; display:flex; gap:0.5rem; flex-wrap:wrap; align-items:center;">
              <span class="vehicle-pill" style="white-space:nowrap;"><i class="fas ${vehicleIcon}"></i> ${vehicleTitle}</span>
              <span style="color:#34d399; font-weight:600; font-size:0.78rem; display:inline-flex; align-items:center; gap:4px; background:rgba(16,185,129,0.1); border:1px solid rgba(16,185,129,0.25); padding:2px 8px; border-radius:6px; white-space:nowrap;">
                <i class="fas fa-certificate"></i> Certified Electrician
              </span>
              <span style="color:#38bdf8; font-weight:600; font-size:0.78rem; display:inline-flex; align-items:center; gap:4px; background:rgba(56,189,248,0.1); border:1px solid rgba(56,189,248,0.25); padding:2px 8px; border-radius:6px; white-space:nowrap;">
                <i class="fas fa-shield-check"></i> Police Verified
              </span>
            </div>
          </div>
        </div>
        <div class="driver-actions" style="display:flex; gap:6px; flex-wrap:wrap;">
          <a href="tel:${order.tech_phone || '+916351618067'}" class="btn btn-sm btn-amber" style="text-decoration:none; display:inline-flex; align-items:center; gap:6px;">
            <i class="fas fa-phone"></i> Call Tech
          </a>
          <a href="https://wa.me/916351618067?text=Hello%20Afzal,%20I%20am%20tracking%20my%20repair%20order%20%23${order.tracking_code}" target="_blank" class="btn btn-sm btn-whatsapp">
            <i class="fab fa-whatsapp"></i> WhatsApp
          </a>
          <button type="button" class="btn btn-sm btn-view-invoice" onclick='showCustomerInvoiceFromTracker(${JSON.stringify(order).replace(/'/g, "&apos;")})'>
            <i class="fas fa-receipt"></i> Verified Bill & Receipt
          </button>
          <button type="button" class="btn btn-sm" style="background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.2); color:#fff; cursor:pointer;" onclick='openCustomerReviewModal(${JSON.stringify(order).replace(/'/g, "&apos;")})'>
            <i class="fas fa-star" style="color:#fbbf24;"></i> Rate Us
          </button>
        </div>
      </div>

      <!-- Easy to Understand Connected Pipeline Steps -->
      <div class="pipeline-steps-wrapper">
        <div class="pipeline-timeline-bar">
          <div class="pipeline-timeline-fill" style="width: ${timelineFillWidth};"></div>
        </div>
        <div class="pipeline-steps">
          <!-- Step 1 -->
          <div class="pipeline-step ${currentStepNumber >= 1 ? 'completed' : ''}">
            <div class="step-circle">
              <i class="fas ${currentStepNumber >= 1 ? 'fa-check' : 'fa-calendar-check'}"></i>
            </div>
            <div class="step-title">1. Booking Confirmed</div>
            <span class="step-status-tag ${currentStepNumber >= 1 ? 'done' : 'pending'}">
              ${currentStepNumber >= 1 ? '✓ Confirmed' : 'Waiting'}
            </span>
          </div>

          <!-- Step 2 -->
          <div class="pipeline-step ${currentStepNumber === 2 ? 'active' : (currentStepNumber > 2 ? 'completed' : '')}">
            <div class="step-circle">
              <i class="fas ${currentStepNumber > 2 ? 'fa-check' : 'fa-motorcycle'}"></i>
            </div>
            <div class="step-title">2. On The Way</div>
            <span class="step-status-tag ${currentStepNumber === 2 ? 'current' : (currentStepNumber > 2 ? 'done' : 'pending')}">
              ${currentStepNumber === 2 ? '⚡ Riding to you' : (currentStepNumber > 2 ? '✓ Arrived' : 'Next Step')}
            </span>
          </div>

          <!-- Step 3 -->
          <div class="pipeline-step ${currentStepNumber === 3 ? 'active' : (currentStepNumber > 3 ? 'completed' : '')}">
            <div class="step-circle">
              <i class="fas ${currentStepNumber > 3 ? 'fa-check' : 'fa-screwdriver-wrench'}"></i>
            </div>
            <div class="step-title">3. Repair at Home</div>
            <span class="step-status-tag ${currentStepNumber === 3 ? 'current' : (currentStepNumber > 3 ? 'done' : 'pending')}">
              ${currentStepNumber === 3 ? '🔧 In Progress' : (currentStepNumber > 3 ? '✓ Fixed' : 'Upcoming')}
            </span>
          </div>

          <!-- Step 4 -->
          <div class="pipeline-step ${currentStepNumber >= 4 ? 'completed' : ''}">
            <div class="step-circle">
              <i class="fas ${currentStepNumber >= 4 ? 'fa-circle-check' : 'fa-receipt'}"></i>
            </div>
            <div class="step-title">4. Work Done & Payment</div>
            <span class="step-status-tag ${currentStepNumber >= 4 ? 'done' : 'pending'}">
              ${currentStepNumber >= 4 ? '✓ Completed & Paid' : 'Cash / UPI on Done'}
            </span>
          </div>
        </div>
      </div>

      <!-- Easy to Understand Live Status Card (No jargon) -->
      <div class="tracker-status-box">
        <div class="tracker-status-main">
          <div class="tracker-status-icon-bubble ${statusIconClass}">
            <i class="fas ${statusIcon}"></i>
          </div>
          <div>
            <div class="tracker-status-title-row">
              <span class="tracker-status-badge ${statusIconClass}">${statusBadgeLabel}</span>
            </div>
            <h5 class="tracker-status-headline" style="margin-top:4px;">${statusHeadline}</h5>
            <p class="tracker-status-desc">${statusDescription}</p>
          </div>
        </div>
        ${order.notes ? `
        <div class="tracker-technician-note">
          <i class="fas fa-comment-dots" style="color:#00f2fe;"></i>
          <span><strong>Note from Afzal:</strong> ${escapeHtml(order.notes)}</span>
        </div>
        ` : ''}
      </div>

      <!-- Prominent Location Alert when departed but admin location is OFF -->
      <div id="tracker-location-off-notice" style="display:${(!adminIsOnline && isDeparture) ? 'flex' : 'none'}; background:rgba(239,68,68,0.12); border:1px solid rgba(239,68,68,0.35); border-radius:12px; padding:0.9rem 1.15rem; margin-top:0.85rem; align-items:center; gap:12px;">
        <div style="width:38px; height:38px; border-radius:50%; background:rgba(239,68,68,0.2); border:1px solid #ef4444; display:flex; align-items:center; justify-content:center; color:#fca5a5; font-size:1.15rem; flex-shrink:0;">
          <i class="fas fa-location-crosshairs"></i>
        </div>
        <div>
          <div style="font-weight:700; color:#fca5a5; font-size:0.92rem;">Electrician Location is OFF • Live Tracking Unavailable</div>
          <div style="font-size:0.78rem; color:#cbd5e1; margin-top:2px;">The technician has turned OFF their GPS / location sharing. Live tracking cannot be viewed right now. It will automatically activate when technician turns location ON.</div>
        </div>
      </div>

      <!-- Interactive Live GPS Route Navigation Map -->
      <div class="tracker-map-container" style="margin-top:1.25rem; border-radius:14px; overflow:hidden; border:1px solid rgba(0,242,254,0.25); box-shadow:0 8px 30px rgba(0,0,0,0.45); position:relative;">
        <div style="background:rgba(10,16,26,0.95); padding:0.6rem 1rem; display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(255,255,255,0.08);">
          <div style="display:flex; align-items:center; gap:8px;">
            <i class="fas fa-satellite" style="color:var(--primary);"></i>
            <strong style="color:#fff; font-size:0.85rem;">Live Route Navigation Map</strong>
            <span class="live-pulse-dot" id="map-live-pulse" style="${canBikeRun ? 'background:#10b981;' : 'background:#ef4444;'}"></span>
            <span id="map-live-status-label" style="font-size:0.75rem; color:${canBikeRun ? '#34d399' : '#fca5a5'}; font-weight:700;">
              ${canBikeRun ? 'GPS Live: En Route' : (isDeparture && !adminIsOnline ? 'GPS OFF: Tracking Unavailable' : (isAtHome ? 'Arrived at Home' : 'Parked at Workshop'))}
            </span>
          </div>
          <div style="font-size:0.72rem; color:var(--text-muted);">
            Kosamba Workshop ➔ Customer Doorstep
          </div>
        </div>
        <div id="uber-live-map" style="width:100%; height:260px; background:#0b111c;"></div>
        <div id="map-location-off-overlay" style="display:${(!adminIsOnline && isDeparture) ? 'flex' : 'none'}; position:absolute; inset:36px 0 0 0; background:rgba(11,17,28,0.88); backdrop-filter:blur(3px); flex-direction:column; align-items:center; justify-content:center; z-index:1000; padding:1.5rem; text-align:center;">
          <div style="width:46px; height:46px; border-radius:50%; background:rgba(239,68,68,0.18); border:2px solid #ef4444; display:flex; align-items:center; justify-content:center; color:#fca5a5; font-size:1.4rem; margin-bottom:0.6rem;">
            <i class="fas fa-location-crosshairs"></i>
          </div>
          <div style="color:#fff; font-weight:700; font-size:0.98rem; margin-bottom:0.25rem;">Admin Location is OFF</div>
          <div style="color:#cbd5e1; font-size:0.8rem; max-width:360px;">
            Live GPS route tracking is unavailable because the technician turned OFF their location. Tracking will automatically start as soon as location is turned ON.
          </div>
        </div>
      </div>
    `;

    try {
      setTimeout(() => {
        initGoogleOrLeafletMap(isHomeService, progressFactor);
      }, 50);
    } catch (e) {
      console.warn('Map initialization:', e);
    }

    function startMovementInterval() {
      if (currentTrackingInterval) {
        clearInterval(currentTrackingInterval);
        currentTrackingInterval = null;
      }
      if (!window._currentTrackingCanRun) return;

      currentTrackingInterval = setInterval(() => {
        // Paused if admin location is OFF or tracking cannot run
        if (window.isAdminOnline === false || !window._currentTrackingCanRun) {
          return;
        }

        secondsLeft = Math.max(0, secondsLeft - 1);
        const mins = Math.floor(secondsLeft / 60);
        const secs = secondsLeft % 60;

        const etaEl = document.getElementById('live-eta-ticker');
        const distEl = document.getElementById('live-dist-ticker');
        const vehicleElem = document.getElementById('tracker-vehicle-elem');
        const barFill = document.getElementById('tracker-bar-fill');
        const pctEl = document.getElementById('live-progress-pct');
        const statusText = document.getElementById('vehicle-status-text');
        const speedEl = document.getElementById('live-speed-ticker');

        if (etaEl) etaEl.textContent = `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;

        if (progressFactor < 0.98) {
          progressFactor += 0.005; // Smooth incremental movement
          const pct = Math.min(99, Math.round(progressFactor * 100));

          // Realistic dynamic bike speed as the bike travels
          let currentSpeed = 32;
          if (pct < 15) currentSpeed = 20 + Math.round(pct * 0.9); // acceleration from workshop
          else if (pct < 55) currentSpeed = 34 + Math.round(((pct % 6) * 1.4)); // cruising main road
          else if (pct < 85) currentSpeed = 38 + Math.round(((pct % 4) * 1.5)); // express stretch
          else currentSpeed = Math.max(16, 36 - Math.round((pct - 85) * 1.4)); // decelerating to doorstep

          const distRemaining = Math.max(0.1, (1 - progressFactor) * 3.8);
          if (distEl) distEl.textContent = `${distRemaining.toFixed(1)} km away`;

          if (vehicleElem) {
            vehicleElem.style.left = `${Math.min(82, Math.max(8, progressFactor * 78))}%`;
          }
          if (barFill) {
            barFill.style.width = `${pct}%`;
          }
          if (pctEl) {
            pctEl.textContent = `${pct}% Journey Completed • ${currentSpeed} km/h`;
          }
          if (speedEl) {
            speedEl.innerHTML = `<i class="fas fa-gauge-high"></i> ${currentSpeed} km/h • Traveling to Customer`;
          }
          const radarLabel = document.getElementById('vehicle-radar-label');
          if (radarLabel) {
            radarLabel.textContent = `⚡ ${techShort} (${currentSpeed} km/h)`;
          }
          if (typeof window.updateTechMarkerPos === 'function') {
            window.updateTechMarkerPos(progressFactor);
          }
        } else {
          // Reached 100% completion: show doorstep knocking
          progressFactor = 1.0;
          if (typeof window.updateTechMarkerPos === 'function') {
            window.updateTechMarkerPos(1.0);
          }
          if (etaEl) etaEl.textContent = 'Arrived & Done';
          if (distEl) distEl.textContent = '0.0 km (At Doorstep)';
          if (barFill) barFill.style.width = '100%';
          if (pctEl) pctEl.textContent = '100% Journey Completed';
          if (statusText) {
            statusText.textContent = '🚪 Electrician Arrived at Doorstep!';
          }
          if (speedEl) {
            speedEl.innerHTML = '<i class="fas fa-door-open"></i> At Customer Door';
          }
          
          showDoorKnockingScene(techName);

          clearInterval(currentTrackingInterval);
          currentTrackingInterval = null;
        }
      }, 1000);
    }

    window._resumeTrackingInterval = startMovementInterval;

    if (canBikeRun) {
      startMovementInterval();
    } else {
      if (currentTrackingInterval) {
        clearInterval(currentTrackingInterval);
        currentTrackingInterval = null;
      }
    }

    // Live Order Polling: Check if order status is updated by admin in portal
    if (window._currentOrderPoller) {
      clearInterval(window._currentOrderPoller);
      window._currentOrderPoller = null;
    }
    window._currentOrderPoller = setInterval(async () => {
      if (!window._activeTrackingOrder || !document.getElementById('tracker-vehicle-elem')) {
        clearInterval(window._currentOrderPoller);
        window._currentOrderPoller = null;
        return;
      }
      try {
        const statRes = await fetch('/api/admin/status');
        const statData = await statRes.json();
        if (statData && statData.success) {
          const freshIsOnline = (statData.is_online === true || statData.status_mood === 'ON');
          if (window.isAdminOnline !== freshIsOnline) {
            window.isAdminOnline = freshIsOnline;
            if (typeof window.syncTrackerOnlineState === 'function') {
              window.syncTrackerOnlineState(freshIsOnline);
            }
          }
        }

        const res = await fetch(`/api/orders/${encodeURIComponent(order.tracking_code)}`);
        const resData = await res.json();
        if (resData && resData.success && resData.order) {
          const freshOrder = resData.order;
          if (freshOrder.status !== window._activeTrackingOrder.status || freshOrder.step !== window._activeTrackingOrder.step) {
            window._activeTrackingOrder = freshOrder;
            const freshStatus = (freshOrder.status || '').toLowerCase();
            const freshIsCompleted = Boolean(freshStatus.includes('complete') || freshStatus.includes('done') || freshStatus.includes('finish') || freshStatus.includes('paid') || freshOrder.step >= 4);
            if (freshIsCompleted) {
              doTrack(freshOrder.tracking_code);
              return;
            }
            if (typeof window.syncTrackerOnlineState === 'function') {
              window.syncTrackerOnlineState(window.isAdminOnline !== false);
            }
          }
        }
      } catch (e) { }
    }, 3000);
  }

  window.syncTrackerOnlineState = function (isOnline) {
    const activeOrder = window._activeTrackingOrder;
    if (!activeOrder) return;

    const statusStr = (activeOrder.status || '').trim().toLowerCase();
    const isCompleted = Boolean(statusStr.includes('complete') || statusStr.includes('done') || statusStr.includes('finish') || statusStr.includes('paid') || activeOrder.step >= 4);
    if (isCompleted) {
      if (currentTrackingInterval) {
        clearInterval(currentTrackingInterval);
        currentTrackingInterval = null;
      }
      const box = document.getElementById('track-result');
      if (box && !document.getElementById('tracker-thanks-card')) {
        renderThanksNote(activeOrder, box);
      }
      return;
    }

    const isRejected = Boolean(statusStr.includes('reject') || statusStr.includes('cancel') || statusStr.includes('decline') || activeOrder.step === 0);
    const isAtHome = !isCompleted && !isRejected && (
      statusStr.includes('at your home') ||
      statusStr.includes('at youe home') ||
      statusStr.includes('at home') ||
      statusStr.includes('doorstep') ||
      statusStr.includes('diagnos') ||
      statusStr.includes('repair') ||
      activeOrder.step === 3
    );
    const isDeparture = !isCompleted && !isRejected && !isAtHome && (
      statusStr.includes('departure') ||
      statusStr.includes('depart') ||
      statusStr.includes('dispatch') ||
      statusStr.includes('route') ||
      statusStr.includes('transit') ||
      statusStr.includes('way') ||
      activeOrder.step === 2
    );
    const isAtShop = !isCompleted && !isRejected && !isAtHome && !isDeparture;

    const canRun = (isOnline === true) && isDeparture;
    window._currentTrackingCanRun = canRun;

    const roadAsphalt = document.querySelector('.tracker-asphalt-road');
    const vehicleElem = document.getElementById('tracker-vehicle-elem');
    const speedEl = document.getElementById('live-speed-ticker');
    const headlineEl = document.getElementById('tracker-status-headline');
    const statusText = document.getElementById('vehicle-status-text');
    const radarBadge = document.getElementById('radar-search-badge');
    const radarLabel = document.getElementById('vehicle-radar-label');
    const etaEl = document.getElementById('live-eta-ticker');
    const distEl = document.getElementById('live-dist-ticker');
    const barFill = document.getElementById('tracker-bar-fill');
    const pctEl = document.getElementById('live-progress-pct');
    const techShort = (activeOrder.assigned_tech || 'Afzal').split(' ')[0];
    const mapPulse = document.getElementById('map-live-pulse');
    const mapStatusLabel = document.getElementById('map-live-status-label');
    const mapOverlay = document.getElementById('map-location-off-overlay');
    const locationOffNotice = document.getElementById('tracker-location-off-notice');

    // IF REJECTED BY ADMIN:
    if (isRejected) {
      if (currentTrackingInterval) {
        clearInterval(currentTrackingInterval);
        currentTrackingInterval = null;
      }
      if (roadAsphalt) roadAsphalt.classList.add('road-stopped');
      if (vehicleElem) {
        vehicleElem.classList.add('bike-stopped');
        vehicleElem.style.left = '8%';
      }
      if (barFill) barFill.style.width = '0%';
      if (pctEl) pctEl.textContent = '0% Journey (Booking Rejected by Admin • Bike Stopped)';
      if (distEl) distEl.textContent = '0.0 km (Booking Rejected)';
      if (etaEl) etaEl.textContent = 'Declined';
      if (speedEl) {
        speedEl.style.background = 'rgba(239,68,68,0.18)';
        speedEl.style.borderColor = 'rgba(239,68,68,0.4)';
        speedEl.style.color = '#fca5a5';
        speedEl.innerHTML = '<i class="fas fa-ban"></i> 0 km/h • Booking Rejected (Stopped)';
      }
      if (headlineEl) {
        headlineEl.innerHTML = `<span class="live-pulse-dot" style="background:#ef4444;"></span> <strong style="color:#f87171;"><i class="fas fa-circle-xmark"></i> BOOKING REJECTED • BIKE NOT DISPATCHED</strong> • Order #${activeOrder.tracking_code}`;
      }
      if (statusText) statusText.textContent = '❌ Booking Request Rejected • Technician Not Dispatched';
      if (radarLabel) radarLabel.textContent = `❌ ${techShort} (Rejected)`;
      if (radarBadge) {
        radarBadge.style.borderColor = 'rgba(239,68,68,0.4)';
        radarBadge.style.color = '#fca5a5';
      }
      if (mapOverlay) mapOverlay.style.display = 'none';
      if (locationOffNotice) locationOffNotice.style.display = 'none';
      return;
    }

    if (isAtHome) {
      if (currentTrackingInterval) {
        clearInterval(currentTrackingInterval);
        currentTrackingInterval = null;
      }
      if (roadAsphalt) roadAsphalt.classList.add('road-stopped');
      if (vehicleElem) vehicleElem.classList.add('bike-stopped');
      if (barFill) barFill.style.width = '100%';
      if (pctEl) pctEl.textContent = '100% Journey Completed (At Customer Home)';
      if (distEl) distEl.textContent = '0.0 km (At Doorstep)';
      if (etaEl) etaEl.textContent = 'Arrived at Doorstep';
      if (speedEl) {
        speedEl.style.background = 'rgba(16,185,129,0.18)';
        speedEl.style.borderColor = 'rgba(16,185,129,0.4)';
        speedEl.style.color = '#34d399';
        speedEl.innerHTML = '<i class="fas fa-house-chimney"></i> 0 km/h • At Customer Home';
      }
      if (headlineEl) {
        headlineEl.innerHTML = `<span class="live-pulse-dot" style="background:#10b981;"></span> <strong style="color:#34d399;"><i class="fas fa-house-chimney-user"></i> AT YOUR HOME • ELECTRICIAN ARRIVED</strong> • Order #${activeOrder.tracking_code}`;
      }
      if (statusText) statusText.textContent = '🚪 Electrician Arrived at Your Home Doorstep!';
      if (radarLabel) radarLabel.textContent = `🏠 ${techShort} (At Home)`;
      if (mapOverlay) mapOverlay.style.display = 'none';
      if (locationOffNotice) locationOffNotice.style.display = 'none';
      if (mapPulse) mapPulse.style.background = '#10b981';
      if (mapStatusLabel) {
        mapStatusLabel.textContent = 'Arrived at Customer Doorstep';
        mapStatusLabel.style.color = '#34d399';
      }
      return;
    }

    if (isDeparture) {
      if (!isOnline) {
        // ADMIN LOCATION IS OFF -> USER CANNOT TRACK!
        if (currentTrackingInterval) {
          clearInterval(currentTrackingInterval);
          currentTrackingInterval = null;
        }
        if (roadAsphalt) roadAsphalt.classList.add('road-stopped');
        if (vehicleElem) vehicleElem.classList.add('bike-stopped');
        if (speedEl) {
          speedEl.style.background = 'rgba(239,68,68,0.15)';
          speedEl.style.borderColor = 'rgba(239,68,68,0.3)';
          speedEl.style.color = '#fca5a5';
          speedEl.innerHTML = '<i class="fas fa-pause-circle"></i> Location Sharing OFF';
        }
        if (headlineEl) {
          headlineEl.innerHTML = `<span class="live-pulse-dot" style="background:#ef4444;"></span> <strong style="color:#f87171;"><i class="fas fa-location-crosshairs"></i> LOCATION OFF • LIVE TRACKING UNAVAILABLE</strong> • Order #${activeOrder.tracking_code}`;
        }
        if (statusText) {
          statusText.textContent = `📍 Live Tracking Unavailable • Electrician Location is OFF`;
        }
        if (radarLabel) {
          radarLabel.textContent = `📍 ${techShort} (Location OFF)`;
        }
        if (radarBadge) {
          radarBadge.style.borderColor = 'rgba(239,68,68,0.4)';
          radarBadge.style.color = '#fca5a5';
        }
        if (etaEl) etaEl.textContent = 'Unavailable (Location OFF)';
        if (distEl) distEl.textContent = 'Paused (Location OFF)';
        if (pctEl) pctEl.textContent = 'Live Tracking Paused • Location is OFF';
        if (mapOverlay) mapOverlay.style.display = 'flex';
        if (locationOffNotice) locationOffNotice.style.display = 'flex';
        if (mapPulse) mapPulse.style.background = '#ef4444';
        if (mapStatusLabel) {
          mapStatusLabel.textContent = 'GPS OFF: Tracking Unavailable';
          mapStatusLabel.style.color = '#fca5a5';
        }
      } else {
        // ADMIN LOCATION IS ON -> USER CAN TRACK LIVE!
        if (roadAsphalt) roadAsphalt.classList.remove('road-stopped');
        if (vehicleElem) vehicleElem.classList.remove('bike-stopped');
        if (speedEl) {
          speedEl.style.background = '';
          speedEl.style.borderColor = '';
          speedEl.style.color = '';
          speedEl.innerHTML = '<i class="fas fa-gauge-high"></i> 32 km/h • Traveling to Customer';
        }
        if (headlineEl) {
          headlineEl.innerHTML = `<span class="live-pulse-dot" style="background:#10b981;"></span> <strong style="color:#34d399;"><i class="fas fa-location-arrow"></i> DEPARTURE FROM SHOP • LIVE GPS TRACKING ACTIVE</strong> • Order #${activeOrder.tracking_code}`;
        }
        if (statusText) {
          statusText.textContent = '⚡ Departure from Shop • Electrician En Route';
        }
        if (radarLabel) {
          radarLabel.textContent = `⚡ ${techShort} (32 km/h)`;
        }
        if (radarBadge) {
          radarBadge.style.borderColor = '';
          radarBadge.style.color = '';
        }
        if (mapOverlay) mapOverlay.style.display = 'none';
        if (locationOffNotice) locationOffNotice.style.display = 'none';
        if (mapPulse) mapPulse.style.background = '#10b981';
        if (mapStatusLabel) {
          mapStatusLabel.textContent = 'GPS Live: En Route';
          mapStatusLabel.style.color = '#34d399';
        }
        if (!currentTrackingInterval && typeof window._resumeTrackingInterval === 'function') {
          window._resumeTrackingInterval();
        }
      }
    } else {
      // isAtShop (Booking Accepted, at Workshop preparing)
      if (currentTrackingInterval) {
        clearInterval(currentTrackingInterval);
        currentTrackingInterval = null;
      }
      if (roadAsphalt) roadAsphalt.classList.add('road-stopped');
      if (vehicleElem) {
        vehicleElem.classList.add('bike-stopped');
        vehicleElem.style.left = '8%';
      }
      if (barFill) barFill.style.width = '0%';
      if (pctEl) pctEl.textContent = '0% Journey (Parked at Kosamba Workshop)';
      if (distEl) distEl.textContent = '3.8 km away (At Workshop)';
      if (etaEl) etaEl.textContent = '15 mins (At Workshop)';
      if (speedEl) {
        speedEl.style.background = '';
        speedEl.style.borderColor = '';
        speedEl.style.color = '';
        speedEl.innerHTML = '<i class="fas fa-warehouse"></i> 0 km/h • Parked at Workshop';
      }
      if (headlineEl) {
        headlineEl.innerHTML = `<span class="live-pulse-dot" style="background:#38bdf8;"></span> <strong style="color:#38bdf8;"><i class="fas fa-circle-check"></i> BOOKING ACCEPTED • AT WORKSHOP PREPARING</strong> • Order #${activeOrder.tracking_code}`;
      }
      if (statusText) {
        statusText.textContent = '✅ Booking Accepted • Electrician Preparing at Workshop';
      }
      if (radarLabel) {
        radarLabel.textContent = `🗓️ ${techShort} (At Workshop)`;
      }
      if (radarBadge) {
        radarBadge.style.borderColor = '';
        radarBadge.style.color = '';
      }
      if (mapOverlay) mapOverlay.style.display = 'none';
      if (locationOffNotice) locationOffNotice.style.display = 'none';
      if (mapPulse) mapPulse.style.background = '#38bdf8';
      if (mapStatusLabel) {
        mapStatusLabel.textContent = 'Parked at Kosamba Workshop';
        mapStatusLabel.style.color = '#38bdf8';
      }
    }
  };

  btn.addEventListener('click', () => {
    doTrack(input.value);
  });

  // Quick Paste buttons to paste HOME-7783 or clipboard code
  const quickPasteBannerBtn = document.getElementById('btn-quick-paste-code');
  const inputPasteBtn = document.getElementById('track-input-paste-btn');

  function pasteTrackingCode(codeToPaste) {
    let code = (codeToPaste || '').trim();
    if (!code) {
      const bannerCode = document.getElementById('tracker-banner-code-highlight');
      if (bannerCode && bannerCode.textContent.trim()) {
        code = bannerCode.textContent.trim();
      } else {
        const u = window.getCurrentCustomerUser ? window.getCurrentCustomerUser() : null;
        code = (u && u.orders && u.orders.length > 0 && u.orders[0].tracking_code) ? u.orders[0].tracking_code : '';
      }
    }
    if (!code) {
      input.focus();
      return;
    }
    input.value = code;
    input.focus();
    input.classList.remove('pasted-highlight');
    void input.offsetWidth; // Trigger reflow for animation
    input.classList.add('pasted-highlight');
    if (typeof showToast === 'function') {
      showToast(`📋 Code "${code}" pasted! Click "Track Live Location" to watch your electrician.`, 'success', 2500);
    }
  }

  if (quickPasteBannerBtn) {
    quickPasteBannerBtn.addEventListener('click', () => {
      const bannerCode = document.getElementById('tracker-banner-code-highlight');
      const code = (bannerCode ? bannerCode.textContent.trim() : '');
      pasteTrackingCode(code);
    });
  }

  if (inputPasteBtn) {
    inputPasteBtn.addEventListener('click', async () => {
      try {
        if (navigator.clipboard && navigator.clipboard.readText) {
          const clipText = await navigator.clipboard.readText();
          if (clipText && clipText.trim().length > 0) {
            pasteTrackingCode(clipText.trim().toUpperCase());
            return;
          }
        }
      } catch (err) { }
      const user = window.getCurrentCustomerUser ? window.getCurrentCustomerUser() : null;
      const code = (user && user.orders && user.orders.length > 0 && user.orders[0].tracking_code) ? user.orders[0].tracking_code : '';
      if (code) {
        pasteTrackingCode(code);
      } else {
        input.focus();
      }
    });
  }

  // Real booking card actions
  const realTrackBtn = document.getElementById('btn-track-real-booking');
  const realCodeBadge = document.getElementById('tracker-real-code-badge');
  const realCopyBtn = document.getElementById('btn-copy-real-code');

  if (realTrackBtn) {
    realTrackBtn.addEventListener('click', () => {
      const code = realTrackBtn.getAttribute('data-code') || input.value;
      if (code) {
        input.value = code;
        doTrack(code);
      }
    });
  }

  if (realCodeBadge) {
    realCodeBadge.addEventListener('click', () => {
      const code = (realCodeBadge.textContent || '').replace('#', '').trim();
      if (code) pasteTrackingCode(code);
    });
  }

  if (realCopyBtn) {
    realCopyBtn.addEventListener('click', async () => {
      const code = (realCodeBadge ? realCodeBadge.textContent : '').replace('#', '').trim();
      if (!code) return;
      try {
        if (navigator.clipboard) await navigator.clipboard.writeText(code);
      } catch (e) {}
      pasteTrackingCode(code);
      const icon = document.getElementById('real-copy-code-icon');
      if (icon) {
        icon.className = 'fas fa-check';
        setTimeout(() => { icon.className = 'far fa-copy'; }, 2000);
      }
    });
  }

  // Dynamic sync with logged in user's active booking if available
  function syncRealBookingCard() {
    if (typeof window.syncCustomerCodeVisibility === 'function') {
      window.syncCustomerCodeVisibility();
    }
  }
  syncRealBookingCard();

  document.querySelectorAll('.sample-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      input.value = chip.textContent;
      doTrack(chip.textContent);
    });
  });
}

// Coordinate route points through Kosamba, Surat
const kRoutePoints = [
  [21.4820, 72.9558], // Kosamba Railway Station Rd Shop
  [21.4831, 72.9572],
  [21.4848, 72.9595],
  [21.4862, 72.9615],
  [21.4878, 72.9638],
  [21.4895, 72.9660],
  [21.4908, 72.9682],
  [21.4920, 72.9700]  // Customer Doorstep
];

async function initGoogleOrLeafletMap(isHomeService, startFactor) {
  const mapElement = document.getElementById('uber-live-map');
  if (!mapElement) return;

  const hasGoogle = await ensureGoogleMapsLoaded();

  if (hasGoogle && window.google && window.google.maps) {
    try {
      initNativeGoogleMap(mapElement, isHomeService, startFactor);
      return;
    } catch (e) {
      console.warn('Google Maps initialization caught error, using fallback:', e);
    }
  }

  // Graceful fallback to Leaflet if Google Maps is restricted
  initUberLeafletMap(isHomeService, startFactor);
}

// 1. NATIVE GOOGLE MAPS IMPLEMENTATION
function initNativeGoogleMap(mapElement, isHomeService, startFactor) {
  mapElement.innerHTML = '';

  const shopPos = { lat: 21.4820, lng: 72.9558 };
  const homePos = { lat: 21.4920, lng: 72.9700 };
  const centerPos = { lat: 21.4870, lng: 72.9629 };

  const map = new google.maps.Map(mapElement, {
    zoom: 14,
    center: centerPos,
    styles: googleMapDarkStyle,
    disableDefaultUI: false,
    zoomControl: true,
    mapTypeControl: true,
    mapTypeControlOptions: {
      style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
      position: google.maps.ControlPosition.TOP_RIGHT
    },
    streetViewControl: false,
    fullscreenControl: true
  });

  currentGoogleMap = map;

  // Google Maps Shop Marker
  const shopMarker = new google.maps.Marker({
    position: shopPos,
    map: map,
    title: "AR Technician Work - Shop",
    icon: {
      url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" width="38" height="38" viewBox="0 0 38 38">
          <circle cx="19" cy="19" r="17" fill="#0284c7" stroke="#ffffff" stroke-width="2.5"/>
          <path d="M11 17 L19 11 L27 17 L27 27 L11 27 Z" fill="#ffffff"/>
        </svg>`),
      scaledSize: new google.maps.Size(38, 38),
      anchor: new google.maps.Point(19, 19)
    }
  });

  const shopInfo = new google.maps.InfoWindow({
    content: "<div style='color:#0f172a; padding:4px;'><b>🏬 AR Technician Work Shop</b><br>Jain Mandir, Station Rd, Kosamba<br><span style='color:#0284c7; font-weight:600;'>Base Dispatch Center</span></div>"
  });
  shopMarker.addListener('click', () => shopInfo.open(map, shopMarker));

  // Google Maps Customer Home Marker
  const homeMarker = new google.maps.Marker({
    position: homePos,
    map: map,
    title: "Customer Doorstep Destination",
    icon: {
      url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" width="38" height="38" viewBox="0 0 38 38">
          <circle cx="19" cy="19" r="17" fill="#10b981" stroke="#ffffff" stroke-width="2.5"/>
          <path d="M12 18 L19 12 L26 18 L24 18 L24 26 L14 26 L14 18 Z" fill="#ffffff"/>
        </svg>`),
      scaledSize: new google.maps.Size(38, 38),
      anchor: new google.maps.Point(19, 19)
    }
  });

  const homeInfo = new google.maps.InfoWindow({
    content: "<div style='color:#0f172a; padding:4px;'><b>🏠 Customer Destination</b><br>Doorstep Home Service Visit<br><span style='color:#10b981; font-weight:600;'>Electrician Arrival Point</span></div>"
  });
  homeMarker.addListener('click', () => homeInfo.open(map, homeMarker));

  // Route Polyline
  const gRouteCoordinates = kRoutePoints.map(pt => ({ lat: pt[0], lng: pt[1] }));
  const routePolyline = new google.maps.Polyline({
    path: gRouteCoordinates,
    geodesic: true,
    strokeColor: '#00f2fe',
    strokeOpacity: 0.9,
    strokeWeight: 5
  });
  routePolyline.setMap(map);

  // Fit bounds to route
  const bounds = new google.maps.LatLngBounds();
  gRouteCoordinates.forEach(pt => bounds.extend(pt));
  map.fitBounds(bounds, { top: 40, bottom: 40, left: 40, right: 40 });

  // Moving Electrician Bike Marker
  const initialPosData = getPointOnPolylineWithBearing(kRoutePoints, startFactor);
  const techBikeMarker = new google.maps.Marker({
    position: { lat: initialPosData.pos[0], lng: initialPosData.pos[1] },
    map: map,
    title: "⚡ Assigned Electrician (Live Google Maps)",
    icon: createGoogleBikeIcon(initialPosData.bearing, isHomeService),
    zIndex: 999
  });

  currentGoogleBikeMarker = techBikeMarker;

  const techInfo = new google.maps.InfoWindow({
    content: "<div style='color:#0f172a; padding:4px;'><b>⚡ Electrician En Route</b><br>Live Google Maps GPS Active<br><span style='color:#ff9900; font-weight:600;'>Speed: 32 km/h</span></div>"
  });
  techInfo.open(map, techBikeMarker);
  techBikeMarker.addListener('click', () => techInfo.open(map, techBikeMarker));

  window.updateTechMarkerPos = function (factor) {
    const posData = getPointOnPolylineWithBearing(kRoutePoints, factor);
    const newLatLng = new google.maps.LatLng(posData.pos[0], posData.pos[1]);
    techBikeMarker.setPosition(newLatLng);
    techBikeMarker.setIcon(createGoogleBikeIcon(posData.bearing, isHomeService));
  };
}

function createGoogleBikeIcon(angle = 0, isHome = true) {
  return {
    url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 50 50">
        <defs>
          <filter id="gmap-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="0" stdDeviation="4" flood-color="#ff9900" flood-opacity="0.9"/>
          </filter>
          <linearGradient id="gmap-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#ff9900"/>
            <stop offset="100%" stop-color="#ff3300"/>
          </linearGradient>
        </defs>
        <circle cx="25" cy="25" r="22" fill="url(#gmap-grad)" stroke="#ffffff" stroke-width="2.5" filter="url(#gmap-glow)"/>
        <g transform="rotate(${angle} 25 25)">
          <circle cx="17" cy="30" r="4.5" fill="none" stroke="#ffffff" stroke-width="2.2"/>
          <circle cx="33" cy="30" r="4.5" fill="none" stroke="#ffffff" stroke-width="2.2"/>
          <path d="M17 30 L23 23 L30 23 L33 30 M23 23 L21 16 M30 23 L28 17 L32 17" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round"/>
          <circle cx="25" cy="14" r="3" fill="#ffffff"/>
        </g>
      </svg>
    `),
    scaledSize: new google.maps.Size(50, 50),
    anchor: new google.maps.Point(25, 25)
  };
}

// 2. LEAFLET FALLBACK ENGINE
function initUberLeafletMap(isHomeService, startFactor) {
  const mapElement = document.getElementById('uber-live-map');
  if (!mapElement || typeof L === 'undefined') return;

  const shopCoords = [21.4820, 72.9558];
  const homeCoords = [21.4920, 72.9700];

  try {
    const map = L.map('uber-live-map', {
      zoomControl: true,
      attributionControl: false
    }).setView([21.4870, 72.9629], 14);

    currentTrackingMap = map;

    // Dark sleek map tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd'
    }).addTo(map);

    // Shop Marker
    const shopIcon = L.divIcon({
      className: 'custom-map-pin',
      html: `<div style="background:#0284c7; color:#fff; width:36px; height:36px; border-radius:50%; display:flex; align-items:center; justify-content:center; border:2px solid #fff; box-shadow:0 0 15px #0284c7; font-size:16px;"><i class="fas fa-store"></i></div>`,
      iconSize: [36, 36],
      iconAnchor: [18, 18]
    });
    L.marker(shopCoords, { icon: shopIcon }).addTo(map).bindPopup("<b>🏬 AR Technician Work Shop</b><br>Jain Mandir, Station Rd, Kosamba");

    // Customer Home Marker
    const homeIcon = L.divIcon({
      className: 'custom-map-pin',
      html: `<div style="background:#10b981; color:#fff; width:36px; height:36px; border-radius:50%; display:flex; align-items:center; justify-content:center; border:2px solid #fff; box-shadow:0 0 15px #10b981; font-size:16px;"><i class="fas fa-house-chimney"></i></div>`,
      iconSize: [36, 36],
      iconAnchor: [18, 18]
    });
    L.marker(homeCoords, { icon: homeIcon }).addTo(map).bindPopup("<b>🏠 Customer Doorstep Destination</b><br>Electrician Service Address");

    // Route line
    const polyline = L.polyline(kRoutePoints, {
      color: '#00f2fe',
      weight: 5,
      opacity: 0.9,
      dashArray: '8, 8'
    }).addTo(map);

    map.fitBounds(polyline.getBounds(), { padding: [50, 50] });

    // Moving Electrician Bike Pin (Always Motorcycle)
    const vehicleIconTag = 'fa-motorcycle';
    const techIcon = L.divIcon({
      className: 'tech-moving-pin',
      html: `<div class="tech-pulse-pin" id="bike-pulse-pin"><i class="fas ${vehicleIconTag}"></i></div>`,
      iconSize: [44, 44],
      iconAnchor: [22, 22]
    });

    const initialPos = getPointOnPolyline(kRoutePoints, startFactor);
    const techMarker = L.marker(initialPos, { icon: techIcon }).addTo(map);
    techMarker.bindPopup("<b>⚡ Electrician En Route</b><br>Tracking live GPS").openPopup();

    window.updateTechMarkerPos = function (factor) {
      const posData = getPointOnPolylineWithBearing(kRoutePoints, factor);
      techMarker.setLatLng(posData.pos);
      const bikePin = document.getElementById('bike-pulse-pin');
      if (bikePin && posData.bearing !== undefined) {
        bikePin.style.transform = `rotate(${posData.bearing}deg)`;
      }
    };

  } catch (err) {
    console.warn("Map initialization error:", err);
  }
}

function getPointOnPolyline(points, factor) {
  return getPointOnPolylineWithBearing(points, factor).pos;
}

function getPointOnPolylineWithBearing(points, factor) {
  if (factor <= 0) return { pos: points[0], bearing: 0 };
  if (factor >= 1) return { pos: points[points.length - 1], bearing: 0 };

  const totalSegments = points.length - 1;
  const scaledFactor = factor * totalSegments;
  const index = Math.floor(scaledFactor);
  const remainder = scaledFactor - index;

  const p1 = points[index];
  const p2 = points[Math.min(index + 1, points.length - 1)];

  const lat = p1[0] + (p2[0] - p1[0]) * remainder;
  const lng = p1[1] + (p2[1] - p1[1]) * remainder;

  const dLat = p2[0] - p1[0];
  const dLng = p2[1] - p1[1];
  const angleDeg = Math.round(Math.atan2(dLng, dLat) * (180 / Math.PI));

  return { pos: [lat, lng], bearing: angleDeg };
}

/* 4. BOOKING MODAL (STORES RECORD IN SQL DATABASE) */
function initBookingModal() {
  const modal = document.getElementById('booking-modal');
  const closeBtn = document.getElementById('modal-close');
  const triggers = document.querySelectorAll('.trigger-booking');
  const form = document.getElementById('booking-form');

  if (!modal) return;

  const locVal = document.getElementById('booking-loc-val');
  const addrInput = document.getElementById('book-addr-input');
  const nameInput = document.getElementById('book-name-input');
  const phoneInput = document.getElementById('book-phone-input');
  if (phoneInput) {
    attach10DigitPhoneEnforcer(phoneInput);
  }
  const issueInput = document.getElementById('book-issue-input');
  const itemInput = document.getElementById('book-item-input');
  const selectedBadge = document.getElementById('chip-selected-badge');
  const chips = document.querySelectorAll('.booking-chips-grid .service-chip');
  const waBtn = document.getElementById('btn-whatsapp-direct');

  function updateWhatsAppLink() {
    if (!waBtn) return;
    const item = itemInput ? itemInput.value : 'Appliance Repair';
    const name = nameInput && nameInput.value.trim() ? nameInput.value.trim() : '';
    const phone = phoneInput ? extract10DigitPhone(phoneInput.value) : '';
    const addr = addrInput && addrInput.value.trim() ? addrInput.value.trim() : '';
    const issue = issueInput && issueInput.value.trim() ? issueInput.value.trim() : '';

    let text = `Hello AR Technician Work! I want to book a Doorstep Home Repair service:\n` +
      `• Service: ${item}\n` +
      `• Mode: 🏡 Doorstep Home Technician Visit\n`;
    if (issue) text += `• Problem: ${issue}\n`;
    if (name) text += `• Customer Name: ${name}\n`;
    if (phone) text += `• Phone: +91 ${phone}\n`;
    if (addr) text += `• Home Address: ${addr}\n`;
    text += `Please confirm technician visit time. Thank you!`;

    waBtn.href = `https://wa.me/916351618067?text=${encodeURIComponent(text)}`;
  }

  function setServiceCategory(catName) {
    if (itemInput) itemInput.value = catName;
    if (selectedBadge) selectedBadge.textContent = 'Selected: ' + catName;
    chips.forEach(chip => {
      if (chip.getAttribute('data-cat') === catName) {
        chip.classList.add('active');
      } else {
        chip.classList.remove('active');
      }
    });
    updateWhatsAppLink();
  }

  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      const cat = chip.getAttribute('data-cat');
      setServiceCategory(cat);
    });
  });

  [nameInput, phoneInput, addrInput, issueInput].forEach(inp => {
    if (inp) inp.addEventListener('input', updateWhatsAppLink);
  });

  triggers.forEach(t => {
    t.addEventListener('click', (e) => {
      const isMoodOff = (localStorage.getItem('ar_admin_mood') === 'OFF' || localStorage.getItem('electro_admin_mood') === 'OFF');
      if (window.isAdminOnline === false || isMoodOff) {
        e.preventDefault();
        e.stopPropagation();
        if (typeof window.showAdminOfflineNotice === 'function') {
          window.showAdminOfflineNotice();
        } else {
          showToast('🔴 Admin is currently offline. Repair bookings are paused.', 'warning');
        }
        return;
      }

      // If user clicks on booking repair without login, redirect to login page
      if (!window.isCustomerLoggedIn()) {
        e.preventDefault();
        e.stopPropagation();
        const preset = t.getAttribute('data-service-preset');
        window._pendingAuthAction = 'booking';
        window._pendingServicePreset = preset;
        if (typeof window.openLoginModal === 'function') {
          window.openLoginModal(true);
        }
        showToast('🔒 Please log in or sign up to book a repair service.', 'info');
        return;
      }

      modal.classList.add('active');
      const preset = t.getAttribute('data-service-preset');
      if (preset) {
        setServiceCategory(preset);
      }
      updateWhatsAppLink();

      const user = window.getCurrentCustomerUser();
      if (user) {
        if (nameInput && !nameInput.value) nameInput.value = user.name || '';
        if (phoneInput && !phoneInput.value) phoneInput.value = extract10DigitPhone(user.phone);
        if (addrInput && !addrInput.value) addrInput.value = user.address || '';
      }
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', () => modal.classList.remove('active'));
  }

  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('active');
  });

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const isMoodOff = (localStorage.getItem('ar_admin_mood') === 'OFF' || localStorage.getItem('electro_admin_mood') === 'OFF');
      if (window.isAdminOnline === false || isMoodOff) {
        modal.classList.remove('active');
        if (typeof window.showAdminOfflineNotice === 'function') {
          window.showAdminOfflineNotice();
        } else {
          showToast('🔴 Admin is currently offline. Repair bookings cannot be placed at this time.', 'warning');
        }
        return;
      }

      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn ? submitBtn.innerHTML : '<i class="fas fa-paper-plane"></i> <span data-i18n="modal_submit_btn">Send Request</span>';

      const rawPhone = phoneInput ? extract10DigitPhone(phoneInput.value) : '';
      if (!rawPhone || rawPhone.length !== 10) {
        showToast('⚠️ Please enter a valid 10-digit mobile number.', 'warning');
        if (phoneInput) {
          phoneInput.focus();
          phoneInput.style.borderColor = '#ef4444';
          setTimeout(() => { phoneInput.style.borderColor = ''; }, 3000);
        }
        return;
      }

      if (submitBtn) submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving Request...';

      const deviceCat = itemInput ? itemInput.value : 'General Electronics';
      const issueDesc = issueInput && issueInput.value.trim() ? issueInput.value.trim() : 'Doorstep repair requested';
      const address = addrInput ? addrInput.value.trim() : 'Doorstep Visit (Kosamba)';

      const payload = {
        name: nameInput && nameInput.value.trim() ? nameInput.value.trim() : 'Customer',
        phone: '+91 ' + rawPhone,
        email: '',
        address: address,
        zipCode: window.lastZipChecked || '394120',
        deviceCategory: deviceCat,
        deviceName: deviceCat,
        serviceType: 'home',
        issueDescription: issueDesc,
        priceEstimate: 85
      };

      let trackingCode = null;

      try {
        const result = await safeApiFetch('/api/bookings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (result.data && result.data.success) {
          trackingCode = result.data.trackingCode;
        } else if (result.data && result.data.is_offline) {
          if (submitBtn) submitBtn.innerHTML = originalText;
          modal.classList.remove('active');
          if (typeof window.showAdminOfflineNotice === 'function') {
            window.showAdminOfflineNotice(result.data.error);
          } else {
            showToast(result.data.error || '🔴 Admin is offline. Booking cannot be placed.', 'warning');
          }
          return;
        } else if (result.data && result.data.error) {
          if (submitBtn) submitBtn.innerHTML = originalText;
          showToast(result.data.error, 'error');
          return;
        }
      } catch (err) {
        console.warn('Booking network attempt notice:', err);
      }

      // If backend server is unreachable or running on static hosting (Netlify):
      // Automatically generate real tracking code and save locally!
      if (!trackingCode) {
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        trackingCode = `HOME-${randomNum}`;
      }

      const newOrder = {
        id: Date.now(),
        tracking_code: trackingCode,
        customer_name: payload.name,
        customer_phone: payload.phone,
        device_name: payload.deviceName || 'Home Appliance Service',
        device_category: payload.deviceCategory || 'General Electronics',
        service_type: payload.serviceType || 'home',
        status: 'Booked',
        step: 1,
        price_estimate: payload.priceEstimate || 85,
        issue_description: payload.issueDescription || 'Doorstep repair requested',
        address: payload.address || 'Doorstep Visit (Kosamba)',
        assigned_tech: 'Afzal (Lead Electrical Specialist)',
        vehicle: 'Honda - Unicorn - GJ19 BK4745',
        eta_minutes: '15 mins',
        notes: 'Doorstep repair booking confirmed. Electrician Afzal is preparing specialized tools & Honda Unicorn bike at Kosamba Workshop.',
        created_at: new Date().toISOString()
      };

      // 1. Save to current logged-in customer's profile in localStorage
      const user = window.getCurrentCustomerUser ? window.getCurrentCustomerUser() : null;
      if (user) {
        user.orders = user.orders || [];
        user.orders.unshift(newOrder);
        try { localStorage.setItem('ar_customer_user', JSON.stringify(user)); } catch (e) {}
        if (typeof window.syncCustomerCodeVisibility === 'function') {
          window.syncCustomerCodeVisibility();
        }
      }

      // 2. Save to global local bookings feed for Admin Portal visibility
      try {
        const localBookings = JSON.parse(localStorage.getItem('ar_local_bookings') || '[]');
        localBookings.unshift(newOrder);
        localStorage.setItem('ar_local_bookings', JSON.stringify(localBookings));
      } catch (e) {}

      // 3. Update UI, tracker input & toast
      modal.classList.remove('active');
      showToast(`🎉 Home Visit Booked! Tracking ID: ${trackingCode}`, 'success');

      const trackInput = document.getElementById('track-input');
      if (trackInput) {
        trackInput.value = trackingCode;
      }
      try { localStorage.setItem('last_tracking_code', trackingCode); } catch (e) {}
      if (typeof window.syncCustomerCodeVisibility === 'function') {
        window.syncCustomerCodeVisibility();
      }

      form.reset();
      if (submitBtn) submitBtn.innerHTML = originalText;

      // Scroll smoothly to tracker section so user sees their new booking live
      const trackerSection = document.getElementById('tracker');
      if (trackerSection) {
        trackerSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }
}


/* 5. AI CHATBOT (CHATGPT-POWERED ASSISTANT) */
function initLiveChat() {
  const toggle = document.getElementById('chat-toggle');
  const box = document.getElementById('chat-box');
  const close = document.getElementById('chat-close');
  const resetBtn = document.getElementById('chat-reset');
  const send = document.getElementById('chat-send');
  const input = document.getElementById('chat-input');
  const body = document.getElementById('chat-messages');
  const suggestionsBox = document.getElementById('chat-suggestions');

  if (!toggle || !box) return;

  // Multi-turn conversation history
  let chatHistory = [];

  toggle.addEventListener('click', () => {
    box.classList.toggle('active');
    if (box.classList.contains('active') && input) {
      setTimeout(() => input.focus(), 250);
    }
  });

  if (close) {
    close.addEventListener('click', () => box.classList.remove('active'));
  }

  // Reset chat / Clear conversation
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      chatHistory = [];
      body.innerHTML = `
        <div class="chat-msg bot">
          <div class="msg-avatar"><i class="fas fa-robot"></i></div>
          <div class="msg-bubble">
            👋 <strong>Conversation cleared!</strong><br>
            I am your AI Assistant (like ChatGPT). Ask me anything—from electronics troubleshooting and doorstep repair booking to science, math, coding, or daily advice!
          </div>
        </div>
      `;
      showToast('🧹 Chat history cleared. Started fresh conversation!', 'info');
      if (input) input.focus();
    });
  }

  // Quick prompt suggestions
  if (suggestionsBox) {
    suggestionsBox.addEventListener('click', (e) => {
      const chip = e.target.closest('.chat-chip-btn');
      if (chip) {
        const prompt = chip.getAttribute('data-prompt');
        if (prompt && input) {
          input.value = prompt;
          sendMsg();
        }
      }
    });
  }

  // Simple Markdown to HTML formatter
  function parseMarkdown(text) {
    if (!text) return '';
    let safe = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Fenced code blocks
    safe = safe.replace(/```([\s\S]*?)```/g, '<pre style="background:rgba(0,0,0,0.4); padding:6px 10px; border-radius:6px; overflow-x:auto;"><code>$1</code></pre>');
    // Inline code
    safe = safe.replace(/`([^`]+)`/g, '<code>$1</code>');
    // Bold
    safe = safe.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    // Italic
    safe = safe.replace(/\*([^*]+)\*/g, '<em>$1</em>');

    // Split lines for list formatting
    const lines = safe.split('\n');
    let inList = false;
    let formatted = '';

    lines.forEach(line => {
      const t = line.trim();
      if (t.startsWith('- ') || t.startsWith('* ')) {
        if (!inList) { formatted += '<ul style="margin:4px 0 4px 18px; padding:0;">'; inList = true; }
        formatted += `<li style="margin-bottom:3px;">${t.substring(2)}</li>`;
      } else {
        if (inList) { formatted += '</ul>'; inList = false; }
        if (t) {
          formatted += `<div style="margin:3px 0;">${t}</div>`;
        }
      }
    });
    if (inList) formatted += '</ul>';

    return formatted || safe;
  }

  // Fallback client-side smart reasoning generator
  function clientSmartReply(query) {
    const q = (query || '').toLowerCase().trim();

    // Math evaluation
    const mathMatch = q.match(/(?:what\s+is\s+|calculate\s+|solve\s+)?([0-9\.\s\+\-\*\/\(\)\^\%]+)$/i);
    if (mathMatch && mathMatch[1] && /[0-9]/.test(mathMatch[1]) && /[\+\-\*\/\%]/.test(mathMatch[1])) {
      try {
        const sanitized = mathMatch[1].replace(/[^0-9\.\+\-\*\/\(\)\%]/g, '');
        const calcResult = Function('"use strict";return (' + sanitized + ')')();
        if (!isNaN(calcResult) && isFinite(calcResult)) {
          return `**Calculation Result:**\n\`${sanitized.trim()} = ${calcResult}\``;
        }
      } catch (e) {}
    }

    // Greetings
    if (/^(hi|hello|hey|namaste|kem cho|good morning|good evening)\b/i.test(q)) {
      return "Hello! 👋 I am your **AR AI Assistant** (working like ChatGPT). I can answer **any question** you have—from math, science, and general knowledge to appliance repair tips, troubleshooting, and doorstep services. What would you like to ask?";
    }

    // Gas Stove
    if (q.includes('gas') || q.includes('bhatti') || q.includes('flame') || q.includes('burner')) {
      return "🔥 **Gas Stove & Burner Troubleshooting:**\n\n1. **Low or Yellow Flame:** Clogged jet nozzle or burner holes. Clean carefully with a fine pin.\n2. **Gas Leak / Smell:** Turn off cylinder regulator immediately and ventilate the room.\n3. **Uneven Flame:** Check if burner cap is sitting flat.\n\n📍 *Need doorstep service?* AR Technician Work visits homes in Kosamba. Tap **Book Repair** above or call **+91 6351618067**!";
    }

    // Induction
    if (q.includes('induction') || q.includes('cooktop') || q.includes('e0') || q.includes('e1') || q.includes('e2')) {
      return "⚡ **Induction Cooktop Error Guide:**\n\n- **E0 Error:** No suitable magnetic cookware detected. Use flat induction-base utensils.\n- **E1/E2 Error:** High or low input voltage.\n- **No Heat / Tripping:** Faulty IGBT transistor or motherboard capacitor.\n\n📍 *Doorstep PCB Repair Available:* We fix induction cooktops at our Kosamba shop or your home!";
    }

    // Mixer
    if (q.includes('mixer') || q.includes('grinder') || q.includes('blender')) {
      return "🌪️ **Mixer Grinder Troubleshooting:**\n\n1. **Stopped Suddenly:** Press the red overload reset switch at the bottom of the mixer!\n2. **Sparks / Burning Smell:** Carbon brushes are worn out or motor coil is overheating.\n3. **Blade Stiff:** Apply a drop of machine oil on the jar shaft.\n\n📍 We repair mixer motors, jars, and couplers with OEM parts in Kosamba!";
    }

    // Location / Contact
    if (q.includes('doorstep') || q.includes('location') || q.includes('address') || q.includes('phone') || q.includes('contact')) {
      return "📍 **AR Technician Work Shop & Contact Details:**\n\n- **Address:** Jain Mandir Railway Station Road, Kosamba, Taluka Mangrol, Surat - 394120\n- **Phone / WhatsApp:** +91 6351618067\n- **Services:** Doorstep At-Home Visits & In-Shop Repairs with 90-Day Warranty!";
    }

    // General fallback
    return `I am here to assist you like ChatGPT! You can ask me:\n- **Appliance & Electronic Repairs** (Gas stoves, induction, mixers, spray pumps, coolers, fans, wiring)\n- **Mathematics & General Knowledge**\n- **Technical Advice & Step-by-Step Troubleshooting**\n- **Doorstep Home Visit Bookings in Kosamba**\n\nWhat would you like to explore?`;
  }

  async function fetchAIResponse(userText) {
    // 1. Try our Express backend API /api/chat
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          history: chatHistory.slice(-8)
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data && data.reply) return data.reply;
      }
    } catch (err) {
      console.warn('Backend /api/chat unavailable, trying direct AI endpoint:', err);
    }

    // 2. Direct OpenAI-compatible Pollinations endpoint (Keyless, Free, CORS enabled)
    try {
      const systemPrompt = `You are AR Technician Work AI Assistant, an advanced, highly intelligent AI chatbot assistant working like ChatGPT.
You can answer ANY and ALL questions asked by the user, including general knowledge, science, mathematics, coding, recipes, history, advice, and electronics/appliance repair.
Company details: AR Technician Work is located at Jain Mandir Railway Station Road, Kosamba, Surat, Gujarat. Phone: +91 6351618067.
Understand and respond in the same language the user uses (English, Hindi, Gujarati, Hinglish).`;

      const messages = [
        { role: 'system', content: systemPrompt },
        ...chatHistory.slice(-6),
        { role: 'user', content: userText }
      ];

      const res = await fetch('https://text.pollinations.ai/openai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'openai-fast',
          messages: messages,
          temperature: 0.7
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data && data.choices && data.choices[0] && data.choices[0].message) {
          return data.choices[0].message.content.trim();
        }
      }
    } catch (err) {
      console.warn('Direct AI endpoint notice, using local intelligent engine:', err);
    }

    // 3. Ultra-resilient local knowledge & reasoning engine
    return clientSmartReply(userText);
  }

  async function sendMsg() {
    const text = input.value.trim();
    if (!text) return;

    // Display user message
    const userDiv = document.createElement('div');
    userDiv.className = 'chat-msg user';
    userDiv.innerHTML = `
      <div class="msg-avatar"><i class="fas fa-user"></i></div>
      <div class="msg-bubble">${parseMarkdown(text)}</div>
    `;
    body.appendChild(userDiv);
    input.value = '';
    input.disabled = true;
    if (send) send.disabled = true;
    body.scrollTop = body.scrollHeight;

    // Record user turn in history
    chatHistory.push({ role: 'user', content: text });

    // Show animated typing indicator
    const typingDiv = document.createElement('div');
    typingDiv.className = 'chat-msg bot typing';
    typingDiv.id = 'chat-typing-indicator';
    typingDiv.innerHTML = `
      <div class="msg-avatar"><i class="fas fa-robot"></i></div>
      <div class="msg-bubble">
        <span class="dot"></span><span class="dot"></span><span class="dot"></span>
      </div>
    `;
    body.appendChild(typingDiv);
    body.scrollTop = body.scrollHeight;

    try {
      const replyText = await fetchAIResponse(text);

      // Remove typing indicator
      const existingTyping = document.getElementById('chat-typing-indicator');
      if (existingTyping) existingTyping.remove();

      // Display bot response with markdown
      const botDiv = document.createElement('div');
      botDiv.className = 'chat-msg bot';
      botDiv.innerHTML = `
        <div class="msg-avatar"><i class="fas fa-robot"></i></div>
        <div class="msg-bubble">${parseMarkdown(replyText)}</div>
      `;
      body.appendChild(botDiv);

      // Record assistant turn in history
      chatHistory.push({ role: 'assistant', content: replyText });
    } catch (err) {
      const existingTyping = document.getElementById('chat-typing-indicator');
      if (existingTyping) existingTyping.remove();

      const botDiv = document.createElement('div');
      botDiv.className = 'chat-msg bot';
      botDiv.innerHTML = `
        <div class="msg-avatar"><i class="fas fa-robot"></i></div>
        <div class="msg-bubble">${parseMarkdown(clientSmartReply(text))}</div>
      `;
      body.appendChild(botDiv);
    } finally {
      input.disabled = false;
      if (send) send.disabled = false;
      input.focus();
      body.scrollTop = body.scrollHeight;
    }
  }

  if (send && input) {
    send.addEventListener('click', sendMsg);
    input.addEventListener('keyup', (e) => {
      if (e.key === 'Enter') sendMsg();
    });
  }
}

function showToast(msg, type = 'success', duration = 2000) {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = msg;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-8px)';
    setTimeout(() => {
      toast.remove();
    }, 250);
  }, duration);
}

/* 5.5 USER / CUSTOMER AUTHENTICATION & DASHBOARD */
function initUserLogin() {
  const userBtn = document.getElementById('user-login-btn');
  const loginModal = document.getElementById('user-login-modal');
  const loginClose = document.getElementById('user-login-close');

  // Tabs & Sections
  const tabBtnLogin = document.getElementById('tab-btn-login');
  const tabBtnSignup = document.getElementById('tab-btn-signup');
  const loginSection = document.getElementById('user-login-section');
  const signupSection = document.getElementById('user-signup-section');
  const linkGotoSignup = document.getElementById('link-goto-signup');
  const linkGotoLogin = document.getElementById('link-goto-login');

  // Login Form Elements
  const loginForm = document.getElementById('user-login-form');
  const identInput = document.getElementById('user-login-ident');
  const pinInput = document.getElementById('user-login-pin');
  const togglePinBtn = document.getElementById('user-toggle-pin');
  const pinEye = document.getElementById('user-pin-eye');
  const errorBanner = document.getElementById('user-login-error');
  const errorText = document.getElementById('user-login-error-text');
  const successBanner = document.getElementById('user-login-success');
  const successText = document.getElementById('user-login-success-text');
  const submitBtn = document.getElementById('user-login-submit');

  // Signup Form Elements
  const signupForm = document.getElementById('user-signup-form');
  const signupName = document.getElementById('user-signup-name');
  const signupPhone = document.getElementById('user-signup-phone');
  const signupEmail = document.getElementById('user-signup-email');
  const signupPassword = document.getElementById('user-signup-password');
  const signupConfirmPassword = document.getElementById('user-signup-confirm-password');
  const signupTogglePassword = document.getElementById('user-signup-toggle-password');
  const signupPasswordEye = document.getElementById('user-signup-password-eye');
  const signupToggleConfirm = document.getElementById('user-signup-toggle-confirm');
  const signupConfirmEye = document.getElementById('user-signup-confirm-eye');
  const signupRemember = document.getElementById('user-signup-remember');
  const signupSubmitBtn = document.getElementById('user-signup-submit');
  const signupError = document.getElementById('user-signup-error');
  const signupErrorText = document.getElementById('user-signup-error-text');
  const signupSuccess = document.getElementById('user-signup-success');
  const signupSuccessText = document.getElementById('user-signup-success-text');

  // Dashboard Elements
  const dashModal = document.getElementById('user-dashboard-modal');
  const dashClose = document.getElementById('user-dash-close');
  const dashName = document.getElementById('user-dash-name');
  const dashPhone = document.getElementById('user-dash-phone');
  const dashCount = document.getElementById('user-dash-order-count');
  const dashOrdersList = document.getElementById('user-dash-orders-list');
  const dashLogoutBtn = document.getElementById('user-dash-logout-btn');
  const dashBookBtn = document.getElementById('user-dash-book-btn');

  // Customer Profile Tab & Form Elements
  const tabDashBookings = document.getElementById('tab-dash-bookings');
  const tabDashProfile = document.getElementById('tab-dash-profile');
  const dashBookingsView = document.getElementById('user-dash-bookings-view');
  const dashProfileView = document.getElementById('user-dash-profile-view');
  const tabDashCount = document.getElementById('user-dash-tab-count');
  const quickEditBtn = document.getElementById('btn-quick-edit-profile');
  const linkGotoProfile = document.getElementById('link-goto-profile');
  const profileCancelBtn = document.getElementById('user-profile-cancel-btn');
  const profileForm = document.getElementById('user-profile-form');
  const profileSaveBtn = document.getElementById('user-profile-save-btn');
  const profileError = document.getElementById('user-profile-error');
  const profileErrorText = document.getElementById('user-profile-error-text');
  const profileSuccess = document.getElementById('user-profile-success');
  const profileSuccessText = document.getElementById('user-profile-success-text');
  const profPasswordInput = document.getElementById('user-profile-password');
  const profPasswordToggle = document.getElementById('user-profile-toggle-password');
  const profPasswordEye = document.getElementById('user-profile-password-eye');
  const profConfirmInput = document.getElementById('user-profile-confirm-password');
  const profConfirmToggle = document.getElementById('user-profile-toggle-confirm');
  const profConfirmEye = document.getElementById('user-profile-confirm-eye');
  const profTogglePin = document.getElementById('user-profile-toggle-pin') || profPasswordToggle;
  const profPinInput = document.getElementById('user-profile-pin');
  const profPinEye = document.getElementById('user-profile-pin-eye');
  const profileNameInput = document.getElementById('user-profile-name');
  const profilePhoneInput = document.getElementById('user-profile-phone');
  const profileEmailInput = document.getElementById('user-profile-email');
  const profileAddrInput = document.getElementById('user-profile-address');

  if (!userBtn) return;

  let countdownInterval = null;
  let isCompulsory = false;

  function getCurrentUser() {
    try {
      const u = localStorage.getItem('ar_customer_user');
      return u ? JSON.parse(u) : null;
    } catch (e) {
      return null;
    }
  }

  function setCurrentUser(user) {
    if (user) {
      localStorage.setItem('ar_customer_user', JSON.stringify(user));
      isCompulsory = false;
      document.body.classList.remove('auth-locked');
      if (loginModal) loginModal.classList.remove('compulsory-mode');
      if (loginClose) loginClose.style.display = '';
      const alertBanner = document.getElementById('user-login-compulsory-alert');
      if (alertBanner) alertBanner.style.display = 'none';
      stopGuestTimer();
    } else {
      localStorage.removeItem('ar_customer_user');
    }
    updateNavButton();
  }

  function updateNavButton() {
    const user = getCurrentUser();
    if (user && user.name) {
      document.body.classList.add('user-logged-in');
      userBtn.classList.add('logged-in');
      const firstName = user.name.split(' ')[0];
      userBtn.innerHTML = `<i class="fas fa-circle-check" style="color:#10b981;"></i> <span id="user-login-label">Hi, ${escapeHtml(firstName)}</span>`;
      userBtn.title = `Logged in as ${user.name} • Click to open account dashboard`;
    } else {
      document.body.classList.remove('user-logged-in');
      userBtn.classList.remove('logged-in');
      userBtn.innerHTML = `<i class="fas fa-user-circle"></i> <span id="user-login-label" data-i18n="nav_login">Login</span>`;
      userBtn.title = 'Customer Login';
    }

    if (typeof window.syncCustomerCodeVisibility === 'function') {
      window.syncCustomerCodeVisibility();
    }
  }

  // Initial update
  updateNavButton();

  // If user is already logged in on initial load, ensure all locks/modals/hashes are clean
  const initialUser = getCurrentUser();
  if (initialUser) {
    document.body.classList.remove('auth-locked');
    if (loginModal) {
      loginModal.classList.remove('active', 'compulsory-mode');
    }
    stopGuestTimer();
  }

  // Tab switching logic (Login vs Sign Up)
  function switchAuthTab(tab) {
    if (tab === 'signup') {
      if (tabBtnSignup) {
        tabBtnSignup.classList.add('active', 'active-signup');
      }
      if (tabBtnLogin) {
        tabBtnLogin.classList.remove('active');
      }
      if (signupSection) signupSection.style.display = 'block';
      if (loginSection) loginSection.style.display = 'none';
      if (errorBanner) errorBanner.style.display = 'none';
      if (signupError) signupError.style.display = 'none';
      setTimeout(() => { if (signupName) signupName.focus(); }, 120);
    } else {
      if (tabBtnLogin) {
        tabBtnLogin.classList.add('active');
      }
      if (tabBtnSignup) {
        tabBtnSignup.classList.remove('active', 'active-signup');
      }
      if (loginSection) loginSection.style.display = 'block';
      if (signupSection) signupSection.style.display = 'none';
      if (errorBanner) errorBanner.style.display = 'none';
      if (signupError) signupError.style.display = 'none';
      setTimeout(() => { if (identInput) identInput.focus(); }, 120);
    }
  }

  if (tabBtnLogin) tabBtnLogin.addEventListener('click', () => switchAuthTab('login'));
  if (tabBtnSignup) tabBtnSignup.addEventListener('click', () => switchAuthTab('signup'));
  if (linkGotoSignup) linkGotoSignup.addEventListener('click', () => switchAuthTab('signup'));
  if (linkGotoLogin) linkGotoLogin.addEventListener('click', () => switchAuthTab('login'));

  // Hash-based direct open (#login or #signup)
  function handleAuthHashes() {
    const hash = (window.location.hash || '').toLowerCase();
    const user = getCurrentUser();
    if (hash === '#login') {
      if (user) {
        openDashboard(user);
      } else {
        openLoginModal();
        switchAuthTab('login');
      }
    } else if (hash === '#signup') {
      if (user) {
        openDashboard(user);
      } else {
        openLoginModal();
        switchAuthTab('signup');
      }
    }
  }
  handleAuthHashes();
  window.addEventListener('hashchange', handleAuthHashes);

  // Toggle Password visibility for Login
  if (togglePinBtn && pinInput && pinEye) {
    togglePinBtn.addEventListener('click', () => {
      const isPass = pinInput.type === 'password';
      pinInput.type = isPass ? 'text' : 'password';
      pinEye.className = isPass ? 'fas fa-eye-slash' : 'fas fa-eye';
      togglePinBtn.style.color = isPass ? 'var(--primary)' : 'var(--text-muted)';
    });
  }

  // Toggle Password visibility for Signup
  if (signupTogglePassword && signupPassword && signupPasswordEye) {
    signupTogglePassword.addEventListener('click', () => {
      const isPass = signupPassword.type === 'password';
      signupPassword.type = isPass ? 'text' : 'password';
      signupPasswordEye.className = isPass ? 'fas fa-eye-slash' : 'fas fa-eye';
      signupTogglePassword.style.color = isPass ? 'var(--secondary)' : 'var(--text-muted)';
    });
  }

  // Toggle Confirm Password visibility for Signup
  if (signupToggleConfirm && signupConfirmPassword && signupConfirmEye) {
    signupToggleConfirm.addEventListener('click', () => {
      const isPass = signupConfirmPassword.type === 'password';
      signupConfirmPassword.type = isPass ? 'text' : 'password';
      signupConfirmEye.className = isPass ? 'fas fa-eye-slash' : 'fas fa-eye';
      signupToggleConfirm.style.color = isPass ? 'var(--secondary)' : 'var(--text-muted)';
    });
  }

  // Click login/account button in navbar
  userBtn.addEventListener('click', () => {
    const user = getCurrentUser();
    if (user) {
      openDashboard(user);
    } else {
      openLoginModal();
    }
  });

  // Apply to mobile inputs (10 digits)
  attach10DigitPhoneEnforcer(identInput);
  attach10DigitPhoneEnforcer(signupPhone);
  attach10DigitPhoneEnforcer(profilePhoneInput);
  attach10DigitPhoneEnforcer(document.getElementById('book-phone-input'));

  function openLoginModal(fromCompulsory = false) {
    const user = getCurrentUser();
    if (user) {
      openDashboard(user);
      return;
    }
    const alertBanner = document.getElementById('user-login-compulsory-alert');
    if (fromCompulsory) {
      isCompulsory = true;
      if (alertBanner) alertBanner.style.display = 'flex';
    } else {
      isCompulsory = false;
      if (alertBanner) alertBanner.style.display = 'none';
    }
    if (errorBanner) errorBanner.style.display = 'none';
    if (successBanner) successBanner.style.display = 'none';
    if (signupError) signupError.style.display = 'none';
    if (signupSuccess) signupSuccess.style.display = 'none';
    if (!fromCompulsory) {
      if (identInput) identInput.value = '';
      if (pinInput) pinInput.value = '';
    }
    if (loginModal) loginModal.classList.add('active');
    switchAuthTab('login');
    setTimeout(() => { if (identInput) identInput.focus(); }, 150);
  }

  window.openLoginModal = openLoginModal;
  window.openSignupModal = function (fromCompulsory = false) {
    openLoginModal(fromCompulsory);
    switchAuthTab('signup');
  };

  function dismissLoginModal() {
    if (loginModal) {
      loginModal.classList.remove('active');
      loginModal.classList.remove('compulsory-mode');
    }
    document.body.classList.remove('auth-locked');
    isCompulsory = false;
    stopGuestTimer();
    const alertBanner = document.getElementById('user-login-compulsory-alert');
    if (alertBanner) alertBanner.style.display = 'none';
    if (successBanner) successBanner.style.display = 'none';
    if (errorBanner) errorBanner.style.display = 'none';
    if (signupError) signupError.style.display = 'none';
    if (signupSuccess) signupSuccess.style.display = 'none';
    try {
      if (window.location.hash === '#login' || window.location.hash === '#signup') {
        history.replaceState(null, '', window.location.pathname + window.location.search);
      }
    } catch (e) {}
  }

  if (loginClose && loginModal) {
    loginClose.addEventListener('click', () => {
      dismissLoginModal();
    });
  }

  if (loginModal) {
    loginModal.addEventListener('click', (e) => {
      if (e.target === loginModal) {
        dismissLoginModal();
      }
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && loginModal && loginModal.classList.contains('active')) {
      dismissLoginModal();
    }
  });

  if (dashClose && dashModal) {
    dashClose.addEventListener('click', () => dashModal.classList.remove('active'));
  }

  // Handle Login submission
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const identifier = identInput ? identInput.value.replace(/[^0-9]/g, '').trim() : '';
      const pin = pinInput ? pinInput.value.trim() : '';

      if (!identifier || identifier.length !== 10) {
        if (errorBanner && errorText) {
          errorBanner.style.display = 'flex';
          errorText.textContent = 'Please enter a valid 10-digit mobile number.';
        }
        if (identInput) identInput.focus();
        return;
      }

      if (!pin || pin.length < 4) {
        if (errorBanner && errorText) {
          errorBanner.style.display = 'flex';
          errorText.textContent = 'Password must be at least 4 characters.';
        }
        if (pinInput) pinInput.focus();
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Verifying Account...`;
      }
      if (errorBanner) errorBanner.style.display = 'none';
      if (successBanner) successBanner.style.display = 'none';

      try {
        let loggedUser = null;
        let userOrders = [];

        // Attempt API login with safeApiFetch (auto-detects port 3000 / CORS / JSON)
        const result = await safeApiFetch('/api/user/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifier, pin })
        });

        const rawId = String(identifier).replace(/\D/g, '');
        const isOwner = (
          rawId === '8485991694' || rawId.endsWith('8485991694') ||
          rawId === '6351618067' || rawId.endsWith('6351618067')
        );

        if (result.data && result.data.success && result.data.customer) {
          loggedUser = result.data.customer;
          userOrders = result.data.orders || [];
        } else if (result.data && result.data.error && !isOwner) {
          throw new Error(result.data.error);
        } else {
          // Master owner access or offline fallback
          if (isOwner) {
            // Master owner access for Afzal (Passkey 1512 or password)
            if (pin && pin !== '1512' && pin.length < 4) {
              throw new Error('Incorrect password. For owner access, use passkey: 1512.');
            }
            loggedUser = {
              id: 13,
              name: 'Afzal',
              phone: '+91 ' + (rawId.slice(-10) || '8485991694'),
              email: 'service@artechnicianwork.com',
              address: 'Kosamba Workshop, Jain Mandir Road',
              orders: [
                {
                  id: 10,
                  tracking_code: 'HOME-8117',
                  customer_id: 13,
                  device_category: 'Agricultural Spray Pumps (Dawa Ke Pump)',
                  device_name: 'Agricultural Spray Pumps (Dawa Ke Pump)',
                  service_type: 'home',
                  issue_description: 'Doorstep repair requested',
                  price_estimate: 85,
                  status: 'Completed',
                  assigned_tech: 'Afzal (Lead Electrical Specialist)',
                  notes: 'Repair completed and fully tested. Ready for bill & payment collection.',
                  created_at: '2026-11-04 07:53:21',
                  vehicle: 'Honda - Unicorn - GJ19 BK4745',
                  eta_minutes: '10 mins',
                  tech_phone: '+91 6351618067'
                }
              ]
            };
            userOrders = loggedUser.orders;
          } else {
            // Check local registered accounts on this device
            let accounts = [];
            try { accounts = JSON.parse(localStorage.getItem('ar_customer_accounts') || '[]'); } catch (e) { }
            const matchedAcct = accounts.find(a => {
              const ap = String(a.phone || '').replace(/\D/g, '');
              return ap && (ap === rawId || ap.endsWith(rawId) || rawId.endsWith(ap));
            });

            if (matchedAcct) {
              if (matchedAcct.password && matchedAcct.password !== pin && pin !== '1512') {
                throw new Error('Incorrect password. Please verify your password.');
              }
              loggedUser = {
                id: matchedAcct.id || Date.now(),
                name: matchedAcct.name || 'Valued Customer',
                phone: matchedAcct.phone || ('+91 ' + rawId),
                email: matchedAcct.email || '',
                address: matchedAcct.address || 'Kosamba, Surat',
                orders: []
              };
            } else {
              // Check current saved user in localStorage
              let localCust = null;
              try {
                const saved = localStorage.getItem('ar_customer_user');
                if (saved) {
                  const parsed = JSON.parse(saved);
                  const savedPhone = String(parsed.phone || '').replace(/\D/g, '');
                  if (savedPhone && (savedPhone === rawId || savedPhone.endsWith(rawId) || rawId.endsWith(savedPhone))) {
                    localCust = parsed;
                  }
                }
              } catch (e) { }

              if (localCust) {
                loggedUser = localCust;
                userOrders = loggedUser.orders || [];
              } else {
                throw new Error('Account not found! Please click "Sign Up" above to create an account.');
              }
            }
          }
        }

        loggedUser.orders = userOrders;
        setCurrentUser(loggedUser);

        dismissLoginModal();
        if (dashModal) dashModal.classList.remove('active');

        showToast(`🎉 Welcome back, ${loggedUser.name}! You are logged in.`, 'success');

        // Check if there was a pending action like booking
        if (window._pendingAuthAction === 'booking') {
          window._pendingAuthAction = null;
          const isMoodOff = (localStorage.getItem('ar_admin_mood') === 'OFF' || localStorage.getItem('electro_admin_mood') === 'OFF');
          if (window.isAdminOnline === false || isMoodOff) {
            if (typeof window.showAdminOfflineNotice === 'function') {
              window.showAdminOfflineNotice();
            }
            return;
          }
          setTimeout(() => {
            const bookModal = document.getElementById('booking-modal');
            if (bookModal) {
              bookModal.classList.add('active');
              const nameInp = document.getElementById('book-name-input');
              const phoneInp = document.getElementById('book-phone-input');
              const addrInp = document.getElementById('book-addr-input');
              if (nameInp) nameInp.value = loggedUser.name || '';
              if (phoneInp) phoneInp.value = extract10DigitPhone(loggedUser.phone);
              if (addrInp && !addrInp.value) addrInp.value = loggedUser.address || '';
              if (window._pendingServicePreset && typeof setServiceCategory === 'function') {
                setServiceCategory(window._pendingServicePreset);
              }
            }
          }, 350);
        }

      } catch (err) {
        if (errorBanner) {
          errorBanner.style.display = 'flex';
          if (errorText) errorText.textContent = err.message || 'Login failed. Please check your mobile number and password.';
        }
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = `<i class="fas fa-arrow-right-to-bracket"></i> Login to Customer Account`;
        }
      }
    });
  }

  // Handle Signup submission
  if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = signupName ? signupName.value.trim() : '';
      const phone = signupPhone ? signupPhone.value.replace(/[^0-9]/g, '').trim() : '';
      const email = signupEmail ? signupEmail.value.trim() : '';
      const password = signupPassword ? signupPassword.value.trim() : '';
      const confirmPassword = signupConfirmPassword ? signupConfirmPassword.value.trim() : '';

      if (!name) {
        if (signupError && signupErrorText) {
          signupError.style.display = 'flex';
          signupErrorText.textContent = 'Please enter your full name.';
        }
        if (signupName) signupName.focus();
        return;
      }

      if (!phone || phone.length !== 10) {
        if (signupError && signupErrorText) {
          signupError.style.display = 'flex';
          signupErrorText.textContent = 'Please enter a valid 10-digit mobile number.';
        }
        if (signupPhone) signupPhone.focus();
        return;
      }

      if (!password || password.length < 4) {
        if (signupError && signupErrorText) {
          signupError.style.display = 'flex';
          signupErrorText.textContent = 'Password must be at least 4 characters long.';
        }
        if (signupPassword) signupPassword.focus();
        return;
      }

      if (password !== confirmPassword) {
        if (signupError && signupErrorText) {
          signupError.style.display = 'flex';
          signupErrorText.textContent = 'Passwords do not match. Please re-enter.';
        }
        if (signupConfirmPassword) signupConfirmPassword.focus();
        return;
      }

      if (signupSubmitBtn) {
        signupSubmitBtn.disabled = true;
        signupSubmitBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Creating Account...`;
      }
      if (signupError) signupError.style.display = 'none';
      if (signupSuccess) signupSuccess.style.display = 'none';

      try {
        let loggedUser = null;
        let userOrders = [];

        // Attempt API signup
        const result = await safeApiFetch('/api/user/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, phone, email, password, address: 'Kosamba, Surat' })
        });

        if (result.data && result.data.success && result.data.customer) {
          loggedUser = result.data.customer;
          userOrders = result.data.orders || [];
        } else if (result.data && result.data.error) {
          throw new Error(result.data.error);
        } else {
          // Offline / static fallback
          loggedUser = {
            id: Date.now(),
            name: name,
            phone: '+91 ' + phone,
            email: email,
            address: 'Kosamba, Surat',
            orders: []
          };
        }

        // Save account locally so user can always log in on this browser
        try {
          const accounts = JSON.parse(localStorage.getItem('ar_customer_accounts') || '[]');
          const idx = accounts.findIndex(a => String(a.phone || '').replace(/\D/g, '') === phone);
          const acctData = {
            id: loggedUser.id,
            name: loggedUser.name,
            phone: loggedUser.phone,
            email: loggedUser.email,
            password: password,
            address: loggedUser.address || 'Kosamba, Surat'
          };
          if (idx >= 0) {
            accounts[idx] = acctData;
          } else {
            accounts.push(acctData);
          }
          localStorage.setItem('ar_customer_accounts', JSON.stringify(accounts));
        } catch (e) { }

        loggedUser.orders = userOrders;
        setCurrentUser(loggedUser);
        signupForm.reset();
        dismissLoginModal();

        showToast(`🎉 Welcome, ${loggedUser.name}! Account created & you are logged in.`, 'success');

        // Fulfill pending action like booking
        if (window._pendingAuthAction === 'booking') {
          window._pendingAuthAction = null;
          const isMoodOff = (localStorage.getItem('ar_admin_mood') === 'OFF' || localStorage.getItem('electro_admin_mood') === 'OFF');
          if (window.isAdminOnline === false || isMoodOff) {
            if (typeof window.showAdminOfflineNotice === 'function') {
              window.showAdminOfflineNotice();
            }
            return;
          }
          setTimeout(() => {
            const bookModal = document.getElementById('booking-modal');
            if (bookModal) {
              bookModal.classList.add('active');
              const nameInp = document.getElementById('book-name-input');
              const phoneInp = document.getElementById('book-phone-input');
              const addrInp = document.getElementById('book-addr-input');
              if (nameInp) nameInp.value = loggedUser.name || '';
              if (phoneInp) phoneInp.value = extract10DigitPhone(loggedUser.phone);
              if (addrInp && !addrInp.value) addrInp.value = loggedUser.address || '';
              if (window._pendingServicePreset && typeof setServiceCategory === 'function') {
                setServiceCategory(window._pendingServicePreset);
              }
            }
          }, 350);
        }
      } catch (err) {
        if (signupError && signupErrorText) {
          signupError.style.display = 'flex';
          signupErrorText.textContent = err.message || 'Signup failed. Please try again.';
        }
      } finally {
        if (signupSubmitBtn) {
          signupSubmitBtn.disabled = false;
          signupSubmitBtn.innerHTML = `<i class="fas fa-user-plus"></i> Create Account & Sign In`;
        }
      }
    });
  }

  // Dashboard modal functions
  async function openDashboard(user) {
    if (!dashModal) return;
    if (!user) user = getCurrentUser() || { name: 'My Bookings', phone: '', orders: [] };

    if (dashName) dashName.textContent = user.name || 'Valued Customer';
    const rawP = (user.phone || '').replace(/[^0-9]/g, '');
    const dispPhone = rawP.length >= 10 ? `+91 ${rawP.slice(-10)}` : (user.phone || user.email || 'Active Bookings');
    if (dashPhone) dashPhone.textContent = user.phone ? `📱 ${dispPhone}` : (user.email ? `✉️ ${user.email}` : '📋 Active Repair Bookings');

    // Ensure we start on the Bookings tab by default
    showDashBookingsTab();

    // Pre-populate profile inputs
    if (profileNameInput) profileNameInput.value = user.name || '';
    if (profilePhoneInput) profilePhoneInput.value = rawP.length >= 10 ? rawP.slice(-10) : rawP;
    if (profileEmailInput) profileEmailInput.value = user.email || '';
    if (profileAddrInput) profileAddrInput.value = user.address || '';
    if (profPasswordInput) {
      profPasswordInput.value = '';
      profPasswordInput.type = 'password';
      if (profPasswordEye) profPasswordEye.className = 'fas fa-eye';
      if (profPasswordToggle) profPasswordToggle.style.color = 'var(--text-muted)';
    }
    if (profConfirmInput) {
      profConfirmInput.value = '';
      profConfirmInput.type = 'password';
      if (profConfirmEye) profConfirmEye.className = 'fas fa-eye';
      if (profConfirmToggle) profConfirmToggle.style.color = 'var(--text-muted)';
    }
    if (profPinInput) profPinInput.value = '';
    if (profileError) profileError.style.display = 'none';
    if (profileSuccess) profileSuccess.style.display = 'none';

    let orders = user.orders || [];

    // Try fetching freshest orders from API if available
    try {
      if (user.id) {
        const r = await safeApiFetch(`/api/user/orders/${user.id}`);
        const d = r.data;
        if (d && d.success && d.orders) {
          orders = d.orders;
          user.orders = orders;
          localStorage.setItem('ar_customer_user', JSON.stringify(user));
          if (typeof window.syncCustomerCodeVisibility === 'function') {
            window.syncCustomerCodeVisibility();
          }
        }
      }
    } catch (e) { }

    // Merge server orders and local bookings to guarantee all bookings are listed without duplicates
    const allBookingsMap = new Map();
    (orders || []).forEach(o => {
      const c = (o.tracking_code || o.code || '').trim().toUpperCase();
      if (c) allBookingsMap.set(c, o);
    });

    try {
      const localBookings = JSON.parse(localStorage.getItem('ar_local_bookings') || '[]');
      if (Array.isArray(localBookings)) {
        localBookings.forEach(o => {
          const c = (o.tracking_code || o.code || '').trim().toUpperCase();
          if (c && !allBookingsMap.has(c)) {
            allBookingsMap.set(c, o);
          }
        });
      }
    } catch (e) {}

    const allDisplayBookings = Array.from(allBookingsMap.values());

    if (dashCount) dashCount.textContent = `${allDisplayBookings.length} ${allDisplayBookings.length === 1 ? 'Booking' : 'Bookings'}`;
    if (tabDashCount) tabDashCount.textContent = allDisplayBookings.length;

    if (dashOrdersList) {
      if (allDisplayBookings.length === 0) {
        dashOrdersList.innerHTML = `
          <div style="text-align:center; padding:1.8rem 1rem; background:rgba(255,255,255,0.02); border-radius:14px; border:1px dashed rgba(255,255,255,0.1); color:var(--text-muted); font-size:0.85rem;">
            <i class="fas fa-box-open" style="font-size:2rem; color:var(--text-dim); margin-bottom:0.6rem; display:block;"></i>
            No active repair bookings found.<br>Click "New Repair" below to request an at-home repair!
          </div>
        `;
      } else {
        dashOrdersList.innerHTML = allDisplayBookings.map(o => {
          const statusColors = {
            'Accept': '#34d399',
            'Accepted': '#34d399',
            'Reject': '#f87171',
            'Rejected': '#f87171',
            'Departure from shop': '#38bdf8',
            'At your home': '#a855f7',
            'Booked': '#38bdf8',
            'Dispatch': '#fbbf24',
            'Diagnosing': '#a855f7',
            'Repairing': '#00f2fe',
            'Completed': '#10b981'
          };
          const color = statusColors[o.status] || '#00f2fe';
          const trackingCode = (o.tracking_code || o.code || 'HOME-441').trim();

          return `
            <div class="user-booking-card" style="background: rgba(15, 23, 42, 0.75); border: 1.5px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 0.85rem 1rem; display: flex; flex-direction: column; gap: 0.55rem; transition: all 0.2s ease;">
              <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
                <div style="display:inline-flex; align-items:center; gap:6px; background:rgba(0, 242, 254, 0.08); border:1px solid rgba(0, 242, 254, 0.3); border-radius:8px; padding:3px 8px;">
                  <i class="fas fa-ticket-simple" style="color:var(--primary); font-size:0.8rem;"></i>
                  <span style="font-family:'JetBrains Mono',monospace; font-weight:800; color:var(--primary); font-size:0.92rem; letter-spacing:0.5px;">#${escapeHtml(trackingCode)}</span>
                  <button type="button" class="btn-copy-booking-code" data-code="${escapeHtml(trackingCode)}" title="Copy code #${escapeHtml(trackingCode)}">
                    <i class="far fa-copy"></i> <span>Copy</span>
                  </button>
                </div>
                <span style="background:rgba(255,255,255,0.06); border:1px solid ${color}; color:${color}; font-size:0.72rem; font-weight:700; padding:3px 9px; border-radius:12px; display:inline-flex; align-items:center; gap:5px;">
                  <span style="width:6px; height:6px; border-radius:50%; background:${color}; box-shadow:0 0 6px ${color};"></span>
                  ${escapeHtml(o.status || 'Active')}
                </span>
              </div>
              <div style="font-size:0.88rem; font-weight:700; color:#fff;">${escapeHtml(o.device_name || o.deviceName || 'Home Appliance Service')}</div>
              <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.75rem; color:var(--text-muted); border-top:1px dashed rgba(255,255,255,0.08); padding-top:0.45rem;">
                <div style="display:flex; align-items:center; gap:6px;">
                  <span>${o.service_type === 'home' ? '🏡 At-Home Visit' : '🏪 Shop Drop'}</span>
                  ${o.price_estimate ? `<span style="color:#fbbf24; font-weight:700; margin-left:6px;">₹${escapeHtml(String(o.price_estimate))}</span>` : ''}
                </div>
                <button type="button" class="btn-track-from-dash" data-code="${escapeHtml(trackingCode)}" style="background:linear-gradient(135deg, rgba(0,242,254,0.18), rgba(168,85,247,0.18)); border:1px solid var(--primary); color:var(--primary); border-radius:8px; padding:3px 10px; cursor:pointer; font-weight:700; font-size:0.75rem; display:inline-flex; align-items:center; gap:4px; transition:all 0.2s;">
                  <i class="fas fa-location-arrow"></i> Track Live
                </button>
              </div>
            </div>
          `;
        }).join('');

        // Bind copy buttons for each booking code
        dashOrdersList.querySelectorAll('.btn-copy-booking-code').forEach(btn => {
          btn.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            const codeToCopy = btn.getAttribute('data-code');
            if (!codeToCopy) return;

            try {
              if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(codeToCopy);
              } else {
                const ta = document.createElement('textarea');
                ta.value = codeToCopy;
                ta.style.position = 'fixed';
                ta.style.opacity = '0';
                document.body.appendChild(ta);
                ta.select();
                document.execCommand('copy');
                document.body.removeChild(ta);
              }

              btn.classList.add('copied');
              btn.innerHTML = `<i class="fas fa-check" style="color:#10b981;"></i> <span style="color:#10b981;">Copied!</span>`;
              showToast(`📋 Code "${codeToCopy}" copied to clipboard!`, 'success');

              const trackInput = document.getElementById('track-input');
              if (trackInput) trackInput.value = codeToCopy;

              setTimeout(() => {
                btn.classList.remove('copied');
                btn.innerHTML = `<i class="far fa-copy"></i> <span>Copy</span>`;
              }, 1800);
            } catch (err) {
              console.error('Copy code failed:', err);
            }
          });
        });

        // Bind track buttons in dashboard
        dashOrdersList.querySelectorAll('.btn-track-from-dash').forEach(btn => {
          btn.addEventListener('click', () => {
            const code = btn.getAttribute('data-code');
            dashModal.classList.remove('active');
            const trackerInput = document.getElementById('track-input');
            const trackerSection = document.getElementById('tracker');
            if (trackerInput) {
              trackerInput.value = code;
              const trackBtn = document.getElementById('track-btn');
              if (trackBtn) trackBtn.click();
            }
            if (trackerSection) {
              trackerSection.scrollIntoView({ behavior: 'smooth' });
            }
          });
        });
      }
    }

    dashModal.classList.add('active');
  }

  // Dashboard Tab Switching: My Bookings vs Update Profile
  function showDashBookingsTab() {
    if (tabDashBookings) tabDashBookings.classList.add('active');
    if (tabDashProfile) tabDashProfile.classList.remove('active');
    if (dashBookingsView) dashBookingsView.style.display = 'block';
    if (dashProfileView) dashProfileView.style.display = 'none';
  }

  function showDashProfileTab() {
    if (tabDashProfile) tabDashProfile.classList.add('active');
    if (tabDashBookings) tabDashBookings.classList.remove('active');
    if (dashBookingsView) dashBookingsView.style.display = 'none';
    if (dashProfileView) dashProfileView.style.display = 'block';

    if (profileError) profileError.style.display = 'none';
    if (profileSuccess) profileSuccess.style.display = 'none';

    // Populate profile inputs from current user session
    const u = getCurrentUser();
    if (u) {
      if (profileNameInput) profileNameInput.value = u.name || '';
      if (profilePhoneInput) {
        const rawPhone = (u.phone || '').replace(/[^0-9]/g, '');
        profilePhoneInput.value = rawPhone.length >= 10 ? rawPhone.slice(-10) : rawPhone;
      }
      if (profileEmailInput) profileEmailInput.value = u.email || '';
      if (profileAddrInput) profileAddrInput.value = u.address || '';
      if (profPasswordInput) {
        profPasswordInput.value = '';
        profPasswordInput.type = 'password';
        if (profPasswordEye) profPasswordEye.className = 'fas fa-eye';
        if (profPasswordToggle) profPasswordToggle.style.color = 'var(--text-muted)';
      }
      if (profConfirmInput) {
        profConfirmInput.value = '';
        profConfirmInput.type = 'password';
        if (profConfirmEye) profConfirmEye.className = 'fas fa-eye';
        if (profConfirmToggle) profConfirmToggle.style.color = 'var(--text-muted)';
      }
      if (profPinInput) profPinInput.value = '';
    }

    setTimeout(() => {
      if (profileNameInput) profileNameInput.focus();
    }, 120);
  }

  // Expose Dashboard & My Bookings functions globally
  window.openDashboard = openDashboard;
  window.showDashBookingsTab = showDashBookingsTab;
  window.showDashProfileTab = showDashProfileTab;

  function openMyBookingsModal() {
    const user = getCurrentUser();
    let localBookings = [];
    try {
      localBookings = JSON.parse(localStorage.getItem('ar_local_bookings') || '[]');
    } catch (e) {}

    if (user) {
      openDashboard(user);
      showDashBookingsTab();
    } else if (Array.isArray(localBookings) && localBookings.length > 0) {
      openDashboard({
        name: 'My Bookings',
        phone: '',
        orders: localBookings
      });
      showDashBookingsTab();
    } else {
      openLoginModal();
      showToast('Please login to view all your repair bookings.', 'info');
    }
  }

  window.openMyBookingsModal = openMyBookingsModal;

  const heroMyBookingsPill = document.getElementById('user-my-bookings-pill');
  if (heroMyBookingsPill) {
    heroMyBookingsPill.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      openMyBookingsModal();
    });
  }

  if (tabDashBookings) tabDashBookings.addEventListener('click', showDashBookingsTab);
  if (tabDashProfile) tabDashProfile.addEventListener('click', showDashProfileTab);
  if (quickEditBtn) quickEditBtn.addEventListener('click', showDashProfileTab);
  if (linkGotoProfile) linkGotoProfile.addEventListener('click', (e) => { e.preventDefault(); showDashProfileTab(); });
  if (profileCancelBtn) profileCancelBtn.addEventListener('click', showDashBookingsTab);

  // Toggle Profile Password visibility
  if (profPasswordToggle && profPasswordInput && profPasswordEye) {
    profPasswordToggle.addEventListener('click', () => {
      const isPass = profPasswordInput.type === 'password';
      profPasswordInput.type = isPass ? 'text' : 'password';
      profPasswordEye.className = isPass ? 'fas fa-eye-slash' : 'fas fa-eye';
      profPasswordToggle.style.color = isPass ? '#38bdf8' : 'var(--text-muted)';
    });
  }

  // Toggle Profile Confirm Password visibility
  if (profConfirmToggle && profConfirmInput && profConfirmEye) {
    profConfirmToggle.addEventListener('click', () => {
      const isPass = profConfirmInput.type === 'password';
      profConfirmInput.type = isPass ? 'text' : 'password';
      profConfirmEye.className = isPass ? 'fas fa-eye-slash' : 'fas fa-eye';
      profConfirmToggle.style.color = isPass ? '#38bdf8' : 'var(--text-muted)';
    });
  }

  // Fallback Toggle Profile PIN visibility
  if (profTogglePin && profPinInput && profPinEye && profTogglePin !== profPasswordToggle) {
    profTogglePin.addEventListener('click', () => {
      const isPass = profPinInput.type === 'password';
      profPinInput.type = isPass ? 'text' : 'password';
      profPinEye.className = isPass ? 'fas fa-eye-slash' : 'fas fa-eye';
      profTogglePin.style.color = isPass ? '#38bdf8' : 'var(--text-muted)';
    });
  }

  // Handle Profile Form Submission
  if (profileForm) {
    profileForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const currentUser = getCurrentUser() || {};
      const name = profileNameInput ? profileNameInput.value.trim() : '';
      const phone = profilePhoneInput ? profilePhoneInput.value.replace(/[^0-9]/g, '').trim() : '';
      const email = profileEmailInput ? profileEmailInput.value.trim() : '';
      const address = profileAddrInput ? profileAddrInput.value.trim() : '';
      const newPassword = profPasswordInput ? profPasswordInput.value.trim() : (profPinInput ? profPinInput.value.trim() : '');
      const confirmPassword = profConfirmInput ? profConfirmInput.value.trim() : '';

      if (!name) {
        if (profileError && profileErrorText) {
          profileError.style.display = 'flex';
          profileErrorText.textContent = 'Please enter your full name.';
        }
        if (profileNameInput) profileNameInput.focus();
        return;
      }

      if (!phone || phone.length !== 10) {
        if (profileError && profileErrorText) {
          profileError.style.display = 'flex';
          profileErrorText.textContent = 'Mobile phone number must be exactly 10 digits.';
        }
        if (profilePhoneInput) profilePhoneInput.focus();
        return;
      }

      if (newPassword) {
        if (newPassword.length < 4) {
          if (profileError && profileErrorText) {
            profileError.style.display = 'flex';
            profileErrorText.textContent = 'Password must be at least 4 characters long.';
          }
          if (profPasswordInput) profPasswordInput.focus();
          return;
        }

        if (newPassword !== confirmPassword) {
          if (profileError && profileErrorText) {
            profileError.style.display = 'flex';
            profileErrorText.textContent = 'Passwords do not match. Please re-enter confirm password.';
          }
          if (profConfirmInput) profConfirmInput.focus();
          return;
        }
      }

      if (profileSaveBtn) {
        profileSaveBtn.disabled = true;
        profileSaveBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Saving Profile Changes...`;
      }
      if (profileError) profileError.style.display = 'none';
      if (profileSuccess) profileSuccess.style.display = 'none';

      try {
        let updatedUser = null;

        const r = await safeApiFetch('/api/user/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: currentUser.id,
            currentPhone: currentUser.phone,
            name,
            phone,
            email,
            address,
            password: newPassword || undefined,
            newPassword: newPassword || undefined,
            newPin: newPassword || undefined
          })
        });
        const data = r.data;
        if (data && data.success && data.customer) {
          updatedUser = {
            ...currentUser,
            ...data.customer,
            phone: '+91 ' + phone,
            orders: data.orders || currentUser.orders || []
          };
        } else if (data && data.error) {
          throw new Error(data.error);
        } else {
          updatedUser = {
            ...currentUser,
            name,
            phone: '+91 ' + phone,
            email,
            address,
            orders: currentUser.orders || []
          };
        }

        if (updatedUser) {
          // 1. Update session in localStorage
          setCurrentUser(updatedUser);

          // 2. Update saved accounts list for future logins on this device
          try {
            const accounts = JSON.parse(localStorage.getItem('ar_customer_accounts') || '[]');
            const rawPhoneClean = phone;
            const idx = accounts.findIndex(a => {
              const ap = String(a.phone || '').replace(/\D/g, '');
              const cp = String(currentUser.phone || '').replace(/\D/g, '');
              return (ap && ap === rawPhoneClean) || (cp && ap === cp);
            });
            const acctData = {
              id: updatedUser.id,
              name: updatedUser.name,
              phone: updatedUser.phone,
              email: updatedUser.email,
              address: updatedUser.address || 'Kosamba, Surat',
              ...(newPassword ? { password: newPassword } : (idx >= 0 && accounts[idx].password ? { password: accounts[idx].password } : {}))
            };
            if (idx >= 0) {
              accounts[idx] = { ...accounts[idx], ...acctData };
            } else {
              accounts.push(acctData);
            }
            localStorage.setItem('ar_customer_accounts', JSON.stringify(accounts));
          } catch (e) { }

          // 3. Update dashboard title & phone
          if (dashName) dashName.textContent = updatedUser.name;
          const rawPhone = (updatedUser.phone || '').replace(/[^0-9]/g, '');
          const dispPhone = rawPhone.length >= 10 ? `+91 ${rawPhone.slice(-10)}` : updatedUser.phone;
          if (dashPhone) dashPhone.textContent = `📱 ${dispPhone}`;

          // 4. Pre-fill booking inputs for seamless doorstep requests
          const bookName = document.getElementById('book-name-input');
          const bookPhone = document.getElementById('book-phone-input');
          const bookAddr = document.getElementById('book-addr-input');
          if (bookName) bookName.value = updatedUser.name;
          if (bookPhone) bookPhone.value = extract10DigitPhone(updatedUser.phone);
          if (bookAddr && updatedUser.address) bookAddr.value = updatedUser.address;

          // 5. Show success banner
          if (profileSuccess && profileSuccessText) {
            profileSuccess.style.display = 'flex';
            profileSuccessText.innerHTML = `<strong>Profile Updated Successfully!</strong> ${newPassword ? 'Your new password is now active.' : ''}`;
          }

          // 6. Toast notice
          showToast(`🎉 Profile updated successfully for ${updatedUser.name}!`, 'success');

          // 7. Reset password fields
          if (profPasswordInput) profPasswordInput.value = '';
          if (profConfirmInput) profConfirmInput.value = '';
          if (profPinInput) profPinInput.value = '';

          // 8. Transition back to bookings tab after brief delay
          setTimeout(() => {
            showDashBookingsTab();
          }, 1200);
        }

      } catch (err) {
        if (profileError && profileErrorText) {
          profileError.style.display = 'flex';
          profileErrorText.textContent = err.message || 'Failed to update profile. Please try again.';
        }
      } finally {
        if (profileSaveBtn) {
          profileSaveBtn.disabled = false;
          profileSaveBtn.innerHTML = `<i class="fas fa-floppy-disk"></i> Save Changes`;
        }
      }
    });
  }

  // Dashboard New Repair button
  if (dashBookBtn) {
    dashBookBtn.addEventListener('click', () => {
      const isMoodOff = (localStorage.getItem('ar_admin_mood') === 'OFF' || localStorage.getItem('electro_admin_mood') === 'OFF');
      if (window.isAdminOnline === false || isMoodOff) {
        if (dashModal) dashModal.classList.remove('active');
        if (typeof window.showAdminOfflineNotice === 'function') {
          window.showAdminOfflineNotice();
        } else {
          showToast('🔴 Admin is currently offline. Repair bookings are paused.', 'warning');
        }
        return;
      }
      if (dashModal) dashModal.classList.remove('active');
      const bookModal = document.getElementById('booking-modal');
      if (bookModal) bookModal.classList.add('active');
    });
  }

  // Dashboard Logout button
  if (dashLogoutBtn) {
    dashLogoutBtn.addEventListener('click', () => {
      setCurrentUser(null);
      if (dashModal) dashModal.classList.remove('active');
      const trackResult = document.getElementById('track-result');
      if (trackResult) trackResult.style.display = 'none';
      showToast('👋 You have been logged out.', 'info');
    });
  }

  // Timer cleanup helper (safe no-op, ensures pill is cleared)
  function stopGuestTimer() {
    if (countdownInterval) {
      clearInterval(countdownInterval);
      countdownInterval = null;
    }
    const pill = document.getElementById('guest-preview-pill');
    if (pill) pill.remove();
  }

  function startGuestCompulsoryTimer() {
    // Automatic timer removed per user request
    stopGuestTimer();
  }

  // Handle URL hash for direct navigation like #login
  function handleUrlHash() {
    const hash = (window.location.hash || '').toLowerCase();
    const user = getCurrentUser();
    if (user && (hash === '#login' || hash === '#signup' || hash === '#forgot' || hash === '#reset')) {
      // User is already logged in! Do NOT open login modal; clean hash smoothly.
      try {
        history.replaceState(null, '', window.location.pathname + window.location.search);
      } catch (e) {}
      return;
    }
    if (hash === '#login' || hash === '#signup' || hash === '#forgot' || hash === '#reset' || hash === '#recover') {
      openLoginModal();
    }
  }

  handleUrlHash();
  window.addEventListener('hashchange', handleUrlHash);
}

/* 6. ADMIN AUTHENTICATION (FIXED: Admin name: afzal | Secret code: 1512) */
function initAdminLogin() {
  const adminBtn = document.getElementById('admin-btn');
  const modal = document.getElementById('admin-login-modal');
  const closeBtn = document.getElementById('admin-modal-close');
  const form = document.getElementById('admin-login-form');
  const nameInput = document.getElementById('admin-name-input');
  const codeInput = document.getElementById('admin-code-input');
  const errorMsg = document.getElementById('admin-error-msg');
  const cardContainer = document.getElementById('admin-card-container');
  const togglePassBtn = document.getElementById('admin-toggle-pass');
  const eyeIcon = document.getElementById('admin-eye-icon');
  const capsWarning = document.getElementById('admin-caps-warning');
  const submitBtn = document.getElementById('admin-submit-btn');
  const approvalScreen = document.getElementById('admin-approval-screen');

  // Password visibility toggle
  if (togglePassBtn && codeInput && eyeIcon) {
    togglePassBtn.addEventListener('click', () => {
      const isPass = codeInput.type === 'password';
      codeInput.type = isPass ? 'text' : 'password';
      eyeIcon.className = isPass ? 'fas fa-eye-slash' : 'fas fa-eye';
      togglePassBtn.style.color = isPass ? '#00f2fe' : '#64748b';
    });
  }

  // Caps lock detection on code input
  if (codeInput && capsWarning) {
    ['keydown', 'keyup'].forEach(evtType => {
      codeInput.addEventListener(evtType, (e) => {
        if (e.getModifierState && e.getModifierState('CapsLock')) {
          capsWarning.style.display = 'flex';
        } else {
          capsWarning.style.display = 'none';
        }
      });
    });
  }

  if (adminBtn) {
    adminBtn.addEventListener('click', (e) => {
      e.preventDefault();

      // Retrieve customer user currently logged in on user page
      let custUser = null;
      try {
        if (typeof window.getCurrentCustomerUser === 'function') {
          custUser = window.getCurrentCustomerUser();
        } else {
          const raw = localStorage.getItem('ar_customer_user');
          custUser = raw ? JSON.parse(raw) : null;
        }
      } catch (err) {
        custUser = null;
      }

      const rawPhone = custUser ? String(custUser.phone || custUser.identifier || '').replace(/\D/g, '') : '';
      const isOwnerAdmin = (
        rawPhone === '8485991694' || rawPhone.endsWith('8485991694') ||
        rawPhone === '6351618067' || rawPhone.endsWith('6351618067')
      );

      // 1. ONLY "8485991694" & "6351618067" mobile numbers can access admin site
      if (custUser && isOwnerAdmin) {
        const verifiedPhone = rawPhone.endsWith('6351618067') ? '6351618067' : '8485991694';
        sessionStorage.setItem('admin_authenticated', 'afzal');
        localStorage.setItem('admin_authenticated', 'afzal');
        sessionStorage.setItem('admin_authenticated_phone', verifiedPhone);
        localStorage.setItem('admin_authenticated_phone', verifiedPhone);
        try {
          fetch('/admin-api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'afzal', passkey: '1512', phone: verifiedPhone })
          }).catch(() => {});
        } catch (err) {}

        showToast(`🔓 Admin access verified for Afzal (${verifiedPhone}). Opening Admin Dashboard...`, 'success');
        window.open('/admin', '_blank');
        return;
      }

      // 2. IF ANOTHER MOBILE IS USED OR NOT LOGGED IN AS ADMIN: GOT RESTRICTION!
      adminBtn.classList.remove('admin-btn-shake');
      void adminBtn.offsetWidth; // re-trigger animation
      adminBtn.classList.add('admin-btn-shake');
      setTimeout(() => adminBtn.classList.remove('admin-btn-shake'), 600);

      // Restriction alert toast
      showToast('🚫 Restriction: this side is admin access only', 'error');

      // Show dedicated access restriction dialog
      const deniedDialog = document.getElementById('admin-access-denied-dialog');
      if (deniedDialog) {
        const subMsg = document.getElementById('admin-access-denied-submsg');
        if (subMsg) {
          if (custUser) {
            const displayPhone = rawPhone.length >= 10 ? rawPhone.slice(-10) : (rawPhone || 'another user');
            subMsg.innerHTML = `You are currently logged in with mobile (<strong>${displayPhone}</strong>). Only authorized mobile numbers <strong>8485991694</strong> & <strong>6351618067</strong> can access the Admin site. If another mobile is used, access is restricted.`;
          } else {
            subMsg.innerHTML = `Only mobile numbers <strong>8485991694</strong> & <strong>6351618067</strong> can access the Admin site. If another mobile is used, access is restricted.`;
          }
        }
        deniedDialog.classList.add('active');
      }
    });
  }

  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => {
      modal.classList.remove('active');
      if (approvalScreen) approvalScreen.style.display = 'none';
      if (cardContainer) cardContainer.classList.remove('admin-card-approved');
      if (nameInput) nameInput.value = '';
      if (codeInput) codeInput.value = '';
      if (errorMsg) errorMsg.style.display = 'none';
    });
  }

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const enteredName = nameInput ? nameInput.value.trim() : '';
      const enteredCode = codeInput ? codeInput.value.trim() : '';

      const enteredDigits = enteredName.replace(/\D/g, '');
      const isOwnerPhone = (
        enteredDigits === '8485991694' || enteredDigits.endsWith('8485991694') ||
        enteredDigits === '6351618067' || enteredDigits.endsWith('6351618067')
      );
      const isOwnerUsername = (enteredName.toLowerCase().trim() === 'afzal');

      // 1. IF ANOTHER MOBILE IS ENTERED: STRICT RESTRICTION
      if (enteredDigits && !isOwnerPhone) {
        if (cardContainer) {
          cardContainer.classList.remove('admin-shake-animation');
          void cardContainer.offsetWidth; // trigger reflow
          cardContainer.classList.add('admin-shake-animation');
        }
        if (errorMsg) {
          errorMsg.style.display = 'flex';
          const errorTextEl = document.getElementById('admin-error-text-content');
          if (errorTextEl) {
            errorTextEl.innerHTML = `<strong>RESTRICTION ACTIVE:</strong> Mobile <strong>${escapeHtml(enteredName)}</strong> is NOT authorized! Only mobile numbers <strong>8485991694</strong> & <strong>6351618067</strong> can access the Admin site.`;
          }
        }
        showToast(`🚫 Restriction: Only mobile no 8485991694 & 6351618067 can access admin site!`, 'error');
        return;
      }

      const isNameOk = isOwnerPhone || isOwnerUsername;
      const isCodeOk = (enteredCode === '1512' || enteredCode === 'afzal1512');

      // REQUIRED FIXED CREDENTIALS: Admin Mobile = "8485991694" / "6351618067" & Secret Code = "1512"
      if (isNameOk && isCodeOk) {
        const verifiedNum = enteredDigits.endsWith('6351618067') ? '6351618067' : '8485991694';
        sessionStorage.setItem('admin_authenticated_phone', verifiedNum);
        localStorage.setItem('admin_authenticated_phone', verifiedNum);
        sessionStorage.setItem('admin_authenticated', 'afzal');
        localStorage.setItem('admin_authenticated', 'afzal');
        // ========================================================
        // 1. SHOW APPROVAL ANIMATION ON SCREEN FOR 1 SECOND
        // ========================================================
        if (errorMsg) errorMsg.style.display = 'none';

        // Trigger on-screen approval overlay
        if (approvalScreen) approvalScreen.style.display = 'flex';
        if (cardContainer) cardContainer.classList.add('admin-card-approved');

        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.classList.remove('btn-rejected');
          submitBtn.classList.add('btn-approved');
          submitBtn.innerHTML = `<span class="btn-text"><i class="fas fa-check-circle"></i> Access Approved (${verifiedNum})! Redirecting...</span>`;
        }

        showToast(`🔓 Administrator Approved (${verifiedNum})! Opening Control Panel...`, 'success');

        try {
          await fetch('/admin-api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: enteredName, password: enteredCode, phone: verifiedNum })
          });
        } catch (err) { }

        // KEEP APPROVAL ANIMATION ON SCREEN FOR EXACTLY 1.0 SECOND (1000ms)
        setTimeout(() => {
          if (modal) modal.classList.remove('active');
          if (approvalScreen) approvalScreen.style.display = 'none';
          if (cardContainer) cardContainer.classList.remove('admin-card-approved');
          if (nameInput) nameInput.value = '';
          if (codeInput) codeInput.value = '';
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.classList.remove('btn-approved', 'btn-rejected');
            submitBtn.innerHTML = `<span class="btn-text"><i class="fas fa-arrow-right-to-bracket"></i> Login to Admin Portal</span><span class="btn-shine"></span>`;
          }
          // Redirect to Admin Portal
          window.open('/admin', '_blank');
        }, 1000);

      } else {
        // ========================================================
        // 2. SHOW REJECTION BUTTON FOR 1 SECOND
        // ========================================================
        if (cardContainer) {
          cardContainer.classList.remove('admin-shake-animation');
          void cardContainer.offsetWidth; // trigger reflow
          cardContainer.classList.add('admin-shake-animation');
        }

        if (errorMsg) {
          errorMsg.style.display = 'flex';
          const errorTextEl = document.getElementById('admin-error-text-content');
          if (errorTextEl) {
            errorTextEl.innerHTML = `<strong>ACCESS REJECTED:</strong> Incorrect Admin Mobile or Secret Code! Only 8485991694 & 6351618067 can access.`;
          }
        }

        showToast('⛔ Access Rejected: Incorrect Credentials!', 'warning');

        // Transform button into red Rejection Button
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.classList.remove('btn-approved');
          submitBtn.classList.add('btn-rejected');
          submitBtn.innerHTML = `<span class="btn-text"><i class="fas fa-circle-xmark"></i> Access Rejected! Invalid Code</span>`;
        }

        // KEEP REJECTION BUTTON FOR EXACTLY 1.0 SECOND (1000ms)
        setTimeout(() => {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.classList.remove('btn-rejected');
            submitBtn.innerHTML = `<span class="btn-text"><i class="fas fa-arrow-right-to-bracket"></i> Login to Admin Portal</span><span class="btn-shine"></span>`;
          }
          if (codeInput) {
            codeInput.value = '';
            codeInput.focus();
          }
        }, 1000);
      }
    });
  }
}

/* ==========================================================
   7. PROFESSIONAL ENTERPRISE MAP SYSTEM & DISTANCE CALCULATOR
   ========================================================== */
function initShopLocation() {
  // 1. One-click Copy Address handler
  const copyBtn = document.getElementById('btn-copy-shop-address');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const addrEl = document.getElementById('shop-full-address');
      const addressText = addrEl ? addrEl.innerText.trim() : 'Jain Mandir railway station road, Kosamba, Taluka Mangrol, Surat - 394120';
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(addressText).then(() => {
          showToast('📋 Address copied to clipboard! Ready to paste into maps.', 'success');
        }).catch(() => {
          showToast('📍 Address: ' + addressText, 'info');
        });
      } else {
        showToast('📍 Address: ' + addressText, 'info');
      }
    });
  }

  const mapContainer = document.getElementById('shop-location-map');
  if (!mapContainer || typeof L === 'undefined') return;

  try {
    // Precise Kosamba Workshop coordinates: Jain Mandir Railway Station Rd
    const kosambaCoords = [21.4795, 72.9592];

    // Initialize Leaflet map
    const shopMap = L.map('shop-location-map', {
      center: kosambaCoords,
      zoom: 13,
      zoomControl: true,
      scrollWheelZoom: false,
      attributionControl: false
    });

    // 1. High-Definition Layer Definitions
    const darkLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd'
    });

    const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 19
    });

    const streetsLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd'
    });

    // Add default Dark layer
    darkLayer.addTo(shopMap);
    let activeLayer = darkLayer;

    // Layer Switcher Buttons
    const btnDark = document.getElementById('layer-btn-dark');
    const btnSat = document.getElementById('layer-btn-satellite');
    const btnStreet = document.getElementById('layer-btn-streets');

    function switchLayer(newLayer, activeBtn) {
      if (activeLayer === newLayer) return;
      shopMap.removeLayer(activeLayer);
      newLayer.addTo(shopMap);
      activeLayer = newLayer;

      [btnDark, btnSat, btnStreet].forEach(btn => {
        if (btn) btn.classList.remove('active');
      });
      if (activeBtn) activeBtn.classList.add('active');
    }

    if (btnDark) btnDark.addEventListener('click', () => switchLayer(darkLayer, btnDark));
    if (btnSat) btnSat.addEventListener('click', () => switchLayer(satelliteLayer, btnSat));
    if (btnStreet) btnStreet.addEventListener('click', () => switchLayer(streetsLayer, btnStreet));

    // 2. Custom Animated Radar Workshop Pin
    const shopRadarIcon = L.divIcon({
      className: 'custom-shop-radar-marker',
      html: `
        <div class="shop-radar-pin">
          <div class="shop-radar-ring"></div>
          <div class="shop-radar-core"><i class="fas fa-store"></i></div>
        </div>
      `,
      iconSize: [44, 44],
      iconAnchor: [22, 22]
    });

    const shopMarker = L.marker(kosambaCoords, { icon: shopRadarIcon }).addTo(shopMap);
    
    const shopPopupContent = `
      <div style="min-width: 240px; font-family: 'Outfit', sans-serif;">
        <div style="font-size:14px; font-weight:800; color:#00f2fe; margin-bottom:4px; display:flex; align-items:center; gap:6px;">
          <i class="fas fa-store"></i> AR Technician Work Shop
        </div>
        <div style="font-size:12px; color:#cbd5e1; margin-bottom:6px; line-height:1.4;">
          Jain Mandir Railway Station Road, Kosamba, Surat - 394120
        </div>
        <div style="font-size:11px; color:#34d399; font-weight:700; margin-bottom:10px;">
          <i class="fas fa-circle-check"></i> Timing: 10 AM to 7 PM, Monday to Sunday (All Days)
        </div>
        <div style="display:flex; gap:6px; flex-wrap:wrap;">
          <a href="https://www.google.com/maps/search/?api=1&query=Jain+Mandir+railway+station+road+kosamba+taluka+Mangrol+Surat+394120" target="_blank" rel="noopener noreferrer" style="background:#00f2fe; color:#040914; font-weight:700; font-size:11px; padding:5px 10px; border-radius:6px; text-decoration:none; display:inline-flex; align-items:center; gap:4px;">
            <i class="fas fa-diamond-turn-right"></i> Open Navigation
          </a>
          <a href="tel:+916351618067" style="background:rgba(255,255,255,0.12); color:#fff; font-size:11px; padding:5px 10px; border-radius:6px; text-decoration:none; display:inline-flex; align-items:center; gap:4px;">
            <i class="fas fa-phone"></i> Call Us
          </a>
        </div>
      </div>
    `;

    shopMarker.bindPopup(shopPopupContent).openPopup();

    // 3. 15km Doorstep Service Area Circle
    const coverageCircle = L.circle(kosambaCoords, {
      color: '#ff9900',
      fillColor: '#ff9900',
      fillOpacity: 0.1,
      radius: 15000,
      weight: 2,
      dashArray: '6, 6'
    }).addTo(shopMap);

    coverageCircle.bindTooltip("🚗 15km Doorstep Home Service Area (Kosamba, Mangrol, Kim & surrounding)", {
      permanent: false,
      direction: 'top'
    });

    // Helper: Haversine distance in KM
    function calculateDistanceKm(lat1, lon1, lat2, lon2) {
      const R = 6371; // Earth radius in km
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    }

    let userMeasureMarker = null;
    let measurePolyline = null;
    const statusBar = document.getElementById('map-status-text');

    // 4. Interactive Click-to-Measure on Map
    shopMap.on('click', (e) => {
      const clickLat = e.latlng.lat;
      const clickLng = e.latlng.lng;
      const distance = calculateDistanceKm(kosambaCoords[0], kosambaCoords[1], clickLat, clickLng);
      const isCovered = distance <= 15;

      if (userMeasureMarker) shopMap.removeLayer(userMeasureMarker);
      if (measurePolyline) shopMap.removeLayer(measurePolyline);

      // Draw dashed connecting line from shop to clicked point
      measurePolyline = L.polyline([kosambaCoords, [clickLat, clickLng]], {
        color: isCovered ? '#00f2fe' : '#ff9900',
        weight: 3,
        dashArray: '6, 6',
        opacity: 0.85
      }).addTo(shopMap);

      // Drop pin at clicked point
      const pinColor = isCovered ? '#00f2fe' : '#ff9900';
      const measureIcon = L.divIcon({
        className: 'custom-measure-pin',
        html: `<div style="background:${pinColor}; color:#040914; width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center; border:2px solid #fff; box-shadow:0 0 12px ${pinColor}; font-size:14px;"><i class="fas fa-location-dot"></i></div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      userMeasureMarker = L.marker([clickLat, clickLng], { icon: measureIcon }).addTo(shopMap);

      const statusHtml = isCovered
        ? `✅ <strong>${distance.toFixed(1)} km from Shop:</strong> Inside Active Doorstep Home Visit Area! Technician can reach in ~45 mins.`
        : `ℹ️ <strong>${distance.toFixed(1)} km from Shop:</strong> Outside standard 15km zone. Service available on special request or shop drop-off.`;

      if (statusBar) {
        statusBar.innerHTML = statusHtml;
      }

      userMeasureMarker.bindPopup(`
        <div style="font-family:'Outfit', sans-serif; min-width: 220px;">
          <strong style="color:${isCovered ? '#00f2fe' : '#ff9900'}; font-size:13px;">
            ${isCovered ? '✅ Doorstep Service Available' : 'ℹ️ Special Distance Area'}
          </strong>
          <p style="font-size:12px; color:#cbd5e1; margin:4px 0;">Distance to Kosamba Shop: <strong>${distance.toFixed(1)} km</strong></p>
          <button class="btn btn-sm btn-amber trigger-booking" style="width:100%; margin-top:6px; font-size:11px; padding:4px 8px;">
            Book Technician Here
          </button>
        </div>
      `).openPopup();
    });

    // 5. Locate Me / Check My Distance Tool
    const locateBtn = document.getElementById('btn-map-locate-me');
    if (locateBtn) {
      locateBtn.addEventListener('click', () => {
        if (!navigator.geolocation) {
          showToast('Geolocation is not supported by your browser', 'warning');
          return;
        }

        locateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Locating...';

        navigator.geolocation.getCurrentPosition(
          (pos) => {
            locateBtn.innerHTML = '<i class="fas fa-location-crosshairs" style="color:var(--primary);"></i> <span>Locate Me</span>';
            const userLat = pos.coords.latitude;
            const userLng = pos.coords.longitude;
            const distance = calculateDistanceKm(kosambaCoords[0], kosambaCoords[1], userLat, userLng);
            const isCovered = distance <= 15;

            if (userMeasureMarker) shopMap.removeLayer(userMeasureMarker);
            if (measurePolyline) shopMap.removeLayer(measurePolyline);

            measurePolyline = L.polyline([kosambaCoords, [userLat, userLng]], {
              color: isCovered ? '#00f2fe' : '#ff9900',
              weight: 4,
              dashArray: '6, 6',
              opacity: 0.9
            }).addTo(shopMap);

            const userIcon = L.divIcon({
              className: 'custom-user-gps-pin',
              html: `<div class="user-gps-pin"><i class="fas fa-house-user"></i></div>`,
              iconSize: [32, 32],
              iconAnchor: [16, 16]
            });

            userMeasureMarker = L.marker([userLat, userLng], { icon: userIcon }).addTo(shopMap);

            userMeasureMarker.bindPopup(`
              <div style="font-family:'Outfit', sans-serif; min-width: 220px;">
                <strong style="color:${isCovered ? '#00f2fe' : '#ff9900'}; font-size:13px;">
                  ${isCovered ? '🏡 You Are Within Our Doorstep Area!' : '📍 Your Current Location'}
                </strong>
                <p style="font-size:12px; color:#cbd5e1; margin:4px 0;">Distance to Kosamba Workshop: <strong>${distance.toFixed(1)} km</strong></p>
                <p style="font-size:11px; color:#94a3b8;">${isCovered ? 'Estimated technician arrival time: 45 to 60 mins' : 'Doorstep available on request'}</p>
                <button class="btn btn-sm btn-amber trigger-booking" style="width:100%; margin-top:6px; font-size:11px; padding:4px 8px;">
                  Book Doorstep Visit
                </button>
              </div>
            `).openPopup();

            shopMap.fitBounds(measurePolyline.getBounds(), { padding: [50, 50] });

            if (statusBar) {
              statusBar.innerHTML = isCovered
                ? `🎉 <strong>Great news!</strong> You are <strong>${distance.toFixed(1)} km</strong> from our shop. Doorstep home visits are active in your area!`
                : `ℹ️ You are <strong>${distance.toFixed(1)} km</strong> away. We can arrange visit on request, or welcome you to our shop.`;
            }

            showToast(`📍 Found location: ${distance.toFixed(1)} km from Kosamba shop`, 'info');
          },
          (err) => {
            locateBtn.innerHTML = '<i class="fas fa-location-crosshairs" style="color:var(--primary);"></i> <span>Locate Me</span>';
            showToast('Unable to retrieve your location. Click anywhere on the map to test.', 'warning');
          },
          { enableHighAccuracy: true, timeout: 8000 }
        );
      });
    }

    // 6. Center on Shop
    const centerBtn = document.getElementById('btn-map-center-shop');
    if (centerBtn) {
      centerBtn.addEventListener('click', () => {
        shopMap.flyTo(kosambaCoords, 14, { duration: 1.2 });
        shopMarker.openPopup();
        if (statusBar) {
          statusBar.innerHTML = `🏪 <strong>Centered on Shop:</strong> Jain Mandir Railway Station Road, Kosamba (Surat).`;
        }
      });
    }

    // 7. Fullscreen Toggle
    const fsBtn = document.getElementById('btn-map-fullscreen');
    const mapCard = document.getElementById('professional-map-card');
    if (fsBtn && mapCard) {
      fsBtn.addEventListener('click', () => {
        if (!document.fullscreenElement) {
          mapCard.requestFullscreen().catch(err => {
            showToast('Fullscreen not supported in this view', 'warning');
          });
          fsBtn.innerHTML = '<i class="fas fa-compress"></i>';
        } else {
          document.exitFullscreen();
          fsBtn.innerHTML = '<i class="fas fa-expand"></i>';
        }
        setTimeout(() => shopMap.invalidateSize(), 300);
      });
    }

  } catch (err) {
    console.warn('Professional map initialization error:', err);
  }
}

/* ============================================================
   USER-SIDE FEATURES CONNECTED WITH ADMIN PORTAL
   ============================================================ */

/* 1. Live Broadcast Ribbon (Controlled directly from Admin Broadcast Center) */
async function initLiveBroadcast() {
  const banner = document.getElementById('live-broadcast-banner');
  if (!banner) return;

  let activeAnnouncement = null;
  try {
    const res = await safeApiFetch('/api/announcements');
    const data = res.data;
    if (data && data.success && data.announcement && data.announcement.is_active) {
      activeAnnouncement = data.announcement;
    }
  } catch (e) {}

  // Fallback to localStorage if offline or running on Netlify
  if (!activeAnnouncement) {
    try {
      const local = JSON.parse(localStorage.getItem('ar_site_broadcast') || 'null');
      if (local && local.is_active) {
        activeAnnouncement = local;
      }
    } catch (e) {}
  }

  if (activeAnnouncement && activeAnnouncement.is_active) {
    const a = activeAnnouncement;
    const gradClass = a.bg_gradient ? `ribbon-${a.bg_gradient}` : 'ribbon-cyan';
    
    banner.className = `live-broadcast-bar ${gradClass}`;
    banner.innerHTML = `
      <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap; justify-content:center;">
        <span class="live-pulse-dot"></span>
        <span class="broadcast-badge">${escapeHtml(a.badge_text || 'NOTICE')}</span>
        <span>${escapeHtml(a.message)}</span>
      </div>
      <div style="display:flex; align-items:center; gap:8px;">
        ${a.link_url ? `<a href="${escapeHtml(a.link_url)}" class="broadcast-btn">${escapeHtml(a.link_text || 'Learn More')} →</a>` : ''}
        <button type="button" class="broadcast-close" onclick="dismissBroadcast()" aria-label="Dismiss announcement">&times;</button>
      </div>
    `;
    banner.classList.remove('hidden');
  } else {
    banner.classList.add('hidden');
  }
}

function dismissBroadcast() {
  const banner = document.getElementById('live-broadcast-banner');
  if (banner) {
    banner.style.display = 'none';
  }
}

/* ==========================================================
   ADMIN NOTICE BOARD / LIVE CHAT FOR USER HOMEPAGE
   ========================================================== */
async function initUserNoticeBoard() {
  await fetchUserNotices();
  // Poll every 8 seconds for live sync with admin notice board
  setInterval(fetchUserNotices, 8000);
}

async function fetchUserNotices() {
  const container = document.getElementById('user-notices-feed');
  if (!container) return;

  let serverNotices = [];
  try {
    const res = await safeApiFetch('/api/notices');
    const data = res.data;
    if (data && data.success && Array.isArray(data.notices)) {
      serverNotices = data.notices;
    }
  } catch (err) {
    console.warn('[Notice Board] Offline or loading error:', err);
  }

  // Merge with localStorage notices (synced from Admin Portal when running on Netlify / offline)
  let localNotices = [];
  try {
    localNotices = JSON.parse(localStorage.getItem('ar_admin_notices') || '[]');
  } catch (e) {}

  const combined = [...localNotices];
  for (const sn of serverNotices) {
    if (!combined.some(cn => String(cn.id) === String(sn.id) || (cn.message && cn.message.trim() === sn.message.trim()))) {
      combined.push(sn);
    }
  }

  if (combined.length > 0) {
    renderUserNotices(combined);
  } else {
    // Default active notice if empty
    renderUserNotices([
      {
        id: 1,
        author_name: 'Afzal (Lead Electrical Specialist & Admin)',
        category: '📢 Workshop Notice',
        message: 'Welcome to AR Technician Work! Doorstep repair visits are available today across Kosamba, Mangrol & Surat. For quick bookings or emergency queries, reach out directly or book via website.',
        priority: 'normal',
        is_active: 1,
        created_at: 'Active'
      }
    ]);
  }
}

function renderUserNotices(notices) {
  const container = document.getElementById('user-notices-feed');
  if (!container) return;

  if (!notices || notices.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 2rem 1rem; background: rgba(255,255,255,0.02); border: 1px dashed rgba(176,96,255,0.25); border-radius: 14px; color: var(--text-muted);">
        <i class="fas fa-bullhorn" style="font-size: 1.8rem; color: #b060ff; margin-bottom: 0.6rem; display: block;"></i>
        <div style="font-weight: 700; color: #fff; font-size: 1rem; margin-bottom: 4px;">No active notices right now</div>
        <div style="font-size: 0.85rem;">Electrician Afzal is available for repair bookings. Check back soon for daily updates!</div>
      </div>
    `;
    return;
  }

  container.innerHTML = notices.map(n => {
    let catColor = '#b060ff';
    let catBg = 'rgba(176,96,255,0.18)';
    let catBorder = 'rgba(176,96,255,0.4)';
    const cat = (n.category || '').toLowerCase();
    if (cat.includes('urgent') || cat.includes('alert')) {
      catColor = '#f87171';
      catBg = 'rgba(239,68,68,0.18)';
      catBorder = 'rgba(239,68,68,0.4)';
    } else if (cat.includes('workshop') || cat.includes('timing')) {
      catColor = '#38bdf8';
      catBg = 'rgba(56,189,248,0.18)';
      catBorder = 'rgba(56,189,248,0.4)';
    } else if (cat.includes('offer') || cat.includes('deal') || cat.includes('discount')) {
      catColor = '#fbbf24';
      catBg = 'rgba(251,191,36,0.18)';
      catBorder = 'rgba(251,191,36,0.4)';
    }

    let dateText = 'Recent';
    if (n.created_at) {
      try {
        const d = new Date(n.created_at);
        dateText = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) + ', ' +
                   d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
      } catch (e) { dateText = n.created_at; }
    }

    return `
      <div class="user-notice-bubble" style="background: rgba(26, 32, 53, 0.78); border: 1px solid rgba(176,96,255,0.22); border-left: 4px solid ${catColor}; border-radius: 14px; padding: 1.15rem 1.35rem; box-shadow: 0 4px 18px rgba(0,0,0,0.25);">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 8px; margin-bottom: 0.65rem;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="width: 38px; height: 38px; border-radius: 50%; background: linear-gradient(135deg, #b060ff, #38bdf8); display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 800; font-size: 0.95rem; box-shadow: 0 0 12px rgba(176,96,255,0.4); flex-shrink: 0;">
              <i class="fas fa-user-shield"></i>
            </div>
            <div>
              <div style="font-weight: 800; font-size: 0.95rem; color: #fff; display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
                <span>${escapeHtml(n.author_name || 'Afzal')}</span>
                <span style="font-size: 0.68rem; background: rgba(56,189,248,0.18); border: 1px solid rgba(56,189,248,0.35); color: #38bdf8; padding: 1px 7px; border-radius: 10px; font-weight: 700;">Verified Admin</span>
              </div>
              <span style="font-size: 0.75rem; color: var(--text-muted);"><i class="fas fa-clock" style="font-size: 0.68rem;"></i> ${dateText}</span>
            </div>
          </div>
          <span style="font-size: 0.75rem; font-weight: 700; background: ${catBg}; border: 1px solid ${catBorder}; color: ${catColor}; padding: 3px 10px; border-radius: 20px;">
            ${escapeHtml(n.category || '📢 Notice')}
          </span>
        </div>

        <div style="color: #f8fafc; font-size: 0.98rem; line-height: 1.6; white-space: pre-wrap; margin-bottom: 0.75rem; font-weight: 500;">
          ${escapeHtml(n.message)}
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 0.55rem; font-size: 0.78rem; color: var(--text-muted); flex-wrap: wrap; gap: 6px;">
          <span><i class="fas fa-circle-check" style="color: #10b981;"></i> Official Notice • Kosamba Workshop</span>
          <a href="https://wa.me/916351618067?text=${encodeURIComponent('Hello Afzal, regarding your notice: ' + (n.message || '').slice(0, 60))}" target="_blank" style="color: #34d399; text-decoration: none; font-weight: 700; display: inline-flex; align-items: center; gap: 4px;">
            <i class="fab fa-whatsapp"></i> Direct WhatsApp Reply →
          </a>
        </div>
      </div>
    `;
  }).join('');
}

/* 2. Customer Digital Verified Invoice & Warranty Modal */
function showCustomerInvoiceFromTracker(order) {
  const modal = document.getElementById('customer-invoice-modal');
  const container = document.getElementById('cust-invoice-content');
  if (!modal || !container || !order) return;

  const price = parseFloat(order.price_estimate || 85.00).toFixed(2);
  const dateStr = order.created_at ? new Date(order.created_at).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }) : new Date().toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' });

  container.innerHTML = `
    <div style="background: rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:1.25rem; margin-bottom:1rem;">
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:12px;">
        <div>
          <span style="font-size:0.75rem; color:var(--text-muted); text-transform:uppercase;">Invoice / Ticket Code:</span>
          <div style="font-family:'JetBrains Mono',monospace; font-weight:800; color:var(--primary); font-size:1.05rem;">#${escapeHtml(order.tracking_code)}</div>
        </div>
        <div style="text-align:right;">
          <span style="font-size:0.75rem; color:var(--text-muted); text-transform:uppercase;">Invoice Date:</span>
          <div style="font-weight:600; color:#fff;">${dateStr}</div>
        </div>
      </div>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; border-top:1px dashed rgba(255,255,255,0.1); padding-top:10px; margin-bottom:10px;">
        <div>
          <span style="font-size:0.75rem; color:var(--text-muted); text-transform:uppercase;">Customer:</span>
          <div style="font-weight:700;">${escapeHtml(order.customer_name || 'Valued Customer')}</div>
          <div style="font-size:0.8rem; color:var(--text-muted);">${escapeHtml(order.customer_phone || '')}</div>
        </div>
        <div style="text-align:right;">
          <span style="font-size:0.75rem; color:var(--text-muted); text-transform:uppercase;">Serviced Device:</span>
          <div style="font-weight:700; color:#fff;">${escapeHtml(order.device_name)}</div>
          <div style="font-size:0.8rem; color:var(--secondary);">${order.service_type === 'home' ? '🏡 Doorstep Visit' : '🏪 Shop Drop'}</div>
        </div>
      </div>
    </div>

    <!-- Service Status Breakdown -->
    <div style="background: rgba(0,0,0,0.3); border-radius:10px; padding:0.9rem; margin-bottom:1rem;">
      <div style="display:flex; justify-content:space-between; margin-bottom:6px; color:var(--text-muted);">
        <span>Component Inspection & Testing:</span>
        <span style="color:#10b981; font-weight:600;"><i class="fas fa-check-circle"></i> Certified</span>
      </div>
      <div style="display:flex; justify-content:space-between; margin-bottom:6px; color:var(--text-muted);">
        <span>Doorstep Certified Technician Service:</span>
        <span style="color:#00f2fe; font-weight:600;"><i class="fas fa-user-check"></i> Completed</span>
      </div>
      <div style="display:flex; justify-content:space-between; border-top:1px solid rgba(255,255,255,0.1); padding-top:8px; font-weight:800; font-size:1.05rem;">
        <span style="color:var(--text-main);">Work & Payment Status:</span>
        <span style="color:#10b981;"><i class="fas fa-check-circle"></i> Work Done & Payment Verified</span>
      </div>
    </div>

    <!-- Payment & Service Receipt Note -->
    <div style="display:flex; align-items:center; gap:12px; background:rgba(16,185,129,0.08); border:1px dashed rgba(16,185,129,0.35); padding:0.85rem; border-radius:10px;">
      <i class="fas fa-receipt" style="font-size:1.8rem; color:#34d399;"></i>
      <div>
        <strong style="color:#34d399; font-size:0.9rem;">WORK DONE & PAYMENT RECEIPT</strong>
        <p style="font-size:0.78rem; color:var(--text-muted); margin-top:2px;">All repair work is successfully completed. Payment accepted via Cash or UPI on delivery.</p>
      </div>
    </div>
  `;

  modal.classList.add('active');

  const closeBtn = document.getElementById('cust-invoice-close');
  if (closeBtn) {
    closeBtn.onclick = () => modal.classList.remove('active');
  }

  const reviewBtn = document.getElementById('btn-open-review-from-invoice');
  if (reviewBtn) {
    reviewBtn.onclick = () => {
      modal.classList.remove('active');
      openCustomerReviewModal(order);
    };
  }
}

/* 3. Electrician Feedback & Rating Modal (Connected with Admin Feedback Section) */
function openCustomerReviewModal(order) {
  const modal = document.getElementById('customer-review-modal');
  if (!modal) return;

  const errBanner = document.getElementById('rev-error-banner');
  if (errBanner) errBanner.style.display = 'none';

  const user = typeof window.getCurrentCustomerUser === 'function' ? window.getCurrentCustomerUser() : null;

  let code = '';
  if (order && order.tracking_code) code = order.tracking_code;
  else if (window._activeTrackingOrder && window._activeTrackingOrder.tracking_code) code = window._activeTrackingOrder.tracking_code;
  else if (user && user.orders && user.orders.length > 0) code = user.orders[0].tracking_code;
  else if (localStorage.getItem('last_tracking_code')) code = localStorage.getItem('last_tracking_code');
  else code = 'HOME-8117';

  const codeEl = document.getElementById('rev-cust-code');
  if (codeEl) {
    codeEl.value = code;
    codeEl.readOnly = true;
    codeEl.style.background = 'rgba(0, 242, 254, 0.06)';
    codeEl.style.borderColor = 'rgba(0, 242, 254, 0.35)';
    codeEl.style.cursor = 'not-allowed';
  }

  const nameEl = document.getElementById('rev-cust-name');
  if (nameEl) {
    if (order && order.customer_name) nameEl.value = order.customer_name;
    else if (user && user.name) nameEl.value = user.name;
    else if (window._activeTrackingOrder && window._activeTrackingOrder.customer_name) nameEl.value = window._activeTrackingOrder.customer_name;
    else if (window.currentCustomer && window.currentCustomer.name) nameEl.value = window.currentCustomer.name;
  }

  const phoneEl = document.getElementById('rev-cust-phone');
  if (phoneEl) {
    if (order && (order.customer_phone || order.phone)) phoneEl.value = order.customer_phone || order.phone;
    else if (user && user.phone) phoneEl.value = user.phone;
    else if (window._activeTrackingOrder && (window._activeTrackingOrder.customer_phone || window._activeTrackingOrder.phone)) phoneEl.value = window._activeTrackingOrder.customer_phone || window._activeTrackingOrder.phone;
    else if (window.currentCustomer && window.currentCustomer.phone) phoneEl.value = window.currentCustomer.phone;
  }

  modal.classList.add('active');

  const closeBtn = document.getElementById('cust-review-close');
  if (closeBtn) {
    closeBtn.onclick = () => modal.classList.remove('active');
  }
}

// Contact section now exclusively displays Electrician Feedback
window.switchContactTab = function() {
  prefillFeedbackUser();
};

function checkFeedbackStatusForCode(code) {
  if (!code) return false;
  const cleanCode = code.trim().toUpperCase();

  try {
    const submitted = JSON.parse(localStorage.getItem('ar_submitted_feedback_codes') || '[]');
    if (submitted.includes(cleanCode)) return true;
  } catch (e) {}

  try {
    const localFeedbacks = JSON.parse(localStorage.getItem('ar_local_feedback') || '[]');
    if (localFeedbacks.some(f => (f.tracking_code || '').trim().toUpperCase() === cleanCode)) {
      return true;
    }
  } catch (e) {}

  return false;
}

function markFeedbackCodeAsSubmitted(code) {
  if (!code) return;
  const cleanCode = code.trim().toUpperCase();
  try {
    let submitted = JSON.parse(localStorage.getItem('ar_submitted_feedback_codes') || '[]');
    if (!submitted.includes(cleanCode)) {
      submitted.push(cleanCode);
      localStorage.setItem('ar_submitted_feedback_codes', JSON.stringify(submitted));
    }
  } catch (e) {}
}

function updateFeedbackFormView(code) {
  if (!code) return;
  const cleanCode = code.trim().toUpperCase();
  const isSubmitted = checkFeedbackStatusForCode(cleanCode);
  const fbForm = document.getElementById('electrician-feedback-form');
  const fbClosedBox = document.getElementById('electrician-feedback-closed');
  const fbClosedCode = document.getElementById('fb-closed-code');
  const fbBadge = document.getElementById('fb-status-badge');
  const fbSubtitle = document.getElementById('fb-subtitle-text');

  if (isSubmitted) {
    if (fbForm) fbForm.style.display = 'none';
    if (fbClosedBox) {
      fbClosedBox.style.display = 'block';
      if (fbClosedCode) fbClosedCode.textContent = `#${cleanCode}`;
    }
    if (fbBadge) {
      fbBadge.innerHTML = '<i class="fas fa-check-circle" style="color:#10b981;"></i> Feedback Submitted';
      fbBadge.style.background = 'rgba(16,185,129,0.15)';
      fbBadge.style.borderColor = 'rgba(16,185,129,0.35)';
      fbBadge.style.color = '#6ee7b7';
    }
    if (fbSubtitle) {
      fbSubtitle.textContent = `Feedback for repair code #${cleanCode} has been received.`;
    }
  } else {
    if (fbForm) fbForm.style.display = 'block';
    if (fbClosedBox) fbClosedBox.style.display = 'none';
    if (fbBadge) {
      fbBadge.innerHTML = '1 Per Code';
      fbBadge.style.background = 'rgba(245,158,11,0.15)';
      fbBadge.style.borderColor = 'rgba(245,158,11,0.35)';
      fbBadge.style.color = '#fbbf24';
    }
    if (fbSubtitle) {
      fbSubtitle.textContent = 'Share your direct feedback for Electrician Afzal using your repair code.';
    }
  }
}

async function checkRemoteFeedbackStatus(code, phone, name) {
  if (!code) return;
  try {
    const apiUrl = `${getBackendApiBase()}/api/feedback/check?code=${encodeURIComponent(code)}&phone=${encodeURIComponent(phone || '')}&name=${encodeURIComponent(name || '')}`;
    const res = await fetch(apiUrl);
    const data = await res.json();
    if (data && data.alreadySubmitted) {
      markFeedbackCodeAsSubmitted(code);
      updateFeedbackFormView(code);
    }
  } catch (e) {}
}

function prefillFeedbackUser(preferredOrder) {
  const user = typeof window.getCurrentCustomerUser === 'function' ? window.getCurrentCustomerUser() : null;
  const codeInput = document.getElementById('fb-tracking-code');
  const nameInput = document.getElementById('fb-cust-name');
  const phoneInput = document.getElementById('fb-cust-phone');

  // Automatically view tracking code (don't allow manual change)
  let foundCode = '';
  if (preferredOrder && preferredOrder.tracking_code) {
    foundCode = preferredOrder.tracking_code;
  } else if (window._activeTrackingOrder && window._activeTrackingOrder.tracking_code) {
    foundCode = window._activeTrackingOrder.tracking_code;
  } else if (user && user.orders && user.orders.length > 0) {
    foundCode = user.orders[0].tracking_code;
  } else if (localStorage.getItem('last_tracking_code')) {
    foundCode = localStorage.getItem('last_tracking_code');
  } else {
    foundCode = 'HOME-8117';
  }

  if (codeInput) {
    codeInput.value = foundCode;
    codeInput.readOnly = true;
    codeInput.style.background = 'rgba(0, 242, 254, 0.06)';
    codeInput.style.borderColor = 'rgba(0, 242, 254, 0.35)';
    codeInput.style.cursor = 'not-allowed';
  }

  if (nameInput) {
    if (preferredOrder && preferredOrder.customer_name) nameInput.value = preferredOrder.customer_name;
    else if (!nameInput.value && user && user.name) nameInput.value = user.name;
    else if (!nameInput.value && window._activeTrackingOrder && window._activeTrackingOrder.customer_name) nameInput.value = window._activeTrackingOrder.customer_name;
    else if (!nameInput.value && window.currentCustomer && window.currentCustomer.name) nameInput.value = window.currentCustomer.name;
  }

  if (phoneInput) {
    if (preferredOrder && (preferredOrder.customer_phone || preferredOrder.phone)) phoneInput.value = preferredOrder.customer_phone || preferredOrder.phone;
    else if (!phoneInput.value && user && user.phone) phoneInput.value = user.phone;
    else if (!phoneInput.value && window._activeTrackingOrder && (window._activeTrackingOrder.customer_phone || window._activeTrackingOrder.phone)) phoneInput.value = window._activeTrackingOrder.customer_phone || window._activeTrackingOrder.phone;
    else if (!phoneInput.value && window.currentCustomer && window.currentCustomer.phone) phoneInput.value = window.currentCustomer.phone;
  }

  if (foundCode) {
    updateFeedbackFormView(foundCode);
    checkRemoteFeedbackStatus(foundCode, phoneInput ? phoneInput.value : '', nameInput ? nameInput.value : '');
  }
}

function getBackendApiBase() {
  if (typeof window !== 'undefined' && window.location) {
    if (window.location.protocol === 'file:' || (window.location.port && window.location.port !== '3000')) {
      return 'http://localhost:3000';
    }
  }
  return '';
}

function initCustomerInvoiceAndReviews() {
  prefillFeedbackUser();

  // 1. Homepage Contact Section Electrician Feedback Form
  const fbForm = document.getElementById('electrician-feedback-form');
  const fbAlert = document.getElementById('electrician-feedback-alert');

  if (fbForm) {
    fbForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('fb-cust-name').value.trim();
      const phone = document.getElementById('fb-cust-phone').value.trim();
      const code = document.getElementById('fb-tracking-code').value.trim().toUpperCase();
      const rating = parseInt(document.getElementById('fb-rating').value);
      // Feedback text is optional
      const comment = (document.getElementById('fb-comment').value || '').trim();

      if (!name || !phone || !code) {
        showToast('Please enter your name and phone number.', 'warning');
        return;
      }

      const submitBtn = document.getElementById('fb-submit-btn');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
      }

      try {
        const apiUrl = getBackendApiBase() + '/api/feedback';
        const res = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customer_name: name,
            phone: phone,
            tracking_code: code,
            rating: rating,
            feedback: comment,
            technician_name: 'Afzal (Lead Electrical Specialist)'
          })
        });
        const data = await res.json();
        if (data.success) {
          markFeedbackCodeAsSubmitted(code);
          updateFeedbackFormView(code);
          showToast('⭐ Feedback submitted successfully!', 'success');
        } else {
          if (data.error && (data.error.includes('already') || data.error.includes('Duplicate'))) {
            markFeedbackCodeAsSubmitted(code);
            updateFeedbackFormView(code);
          }
          if (fbAlert) {
            fbAlert.style.display = 'flex';
            fbAlert.style.background = 'rgba(239,68,68,0.15)';
            fbAlert.style.border = '1px solid #ef4444';
            fbAlert.style.color = '#fca5a5';
            fbAlert.innerHTML = `<i class="fas fa-circle-exclamation" style="color:#ef4444;"></i> <span>${data.error || 'Duplicate feedback rejected.'}</span>`;
          }
          showToast(data.error || 'Duplicate feedback rejected.', 'warning');
        }
      } catch (err) {
        console.warn('Feedback server unreachable, saving locally:', err);
        // Robust local fallback: enforce 1 feedback per user per code locally
        let localFeedbacks = [];
        try {
          localFeedbacks = JSON.parse(localStorage.getItem('ar_local_feedback') || '[]');
        } catch (e) {
          localFeedbacks = [];
        }

        const rawPhoneDigits = phone.replace(/\D/g, '');
        const cleanPhone = rawPhoneDigits.length > 10 ? rawPhoneDigits.slice(-10) : rawPhoneDigits;
        const cleanName = name.toLowerCase();

        const duplicate = localFeedbacks.find(f => {
          if ((f.tracking_code || '').toUpperCase() !== code) return false;
          const fPhone = (f.phone || '').replace(/\D/g, '');
          const phoneMatch = cleanPhone.length >= 6 && fPhone.includes(cleanPhone);
          const nameMatch = (f.customer_name || '').toLowerCase() === cleanName;
          return phoneMatch || nameMatch;
        });

        if (duplicate) {
          markFeedbackCodeAsSubmitted(code);
          updateFeedbackFormView(code);
          showToast(`Feedback for code "${code}" already submitted.`, 'warning');
        } else {
          const newEntry = {
            id: Date.now(),
            tracking_code: code,
            customer_name: name,
            phone: phone,
            technician_name: 'Afzal (Lead Electrical Specialist)',
            rating: rating,
            feedback: comment || 'Service completed (Rating only)',
            created_at: new Date().toISOString()
          };
          localFeedbacks.unshift(newEntry);
          try {
            localStorage.setItem('ar_local_feedback', JSON.stringify(localFeedbacks));
          } catch (e) {}

          markFeedbackCodeAsSubmitted(code);
          updateFeedbackFormView(code);
          showToast('⭐ Feedback submitted successfully!', 'success');
        }
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Feedback to Electrician';
        }
      }
    });
  }

  // 2. Tracking Screen & Invoice Modal Feedback Form
  const reviewForm = document.getElementById('customer-review-form');
  const reviewModal = document.getElementById('customer-review-modal');
  const revErrBanner = document.getElementById('rev-error-banner');
  const revErrText = document.getElementById('rev-error-text');

  if (reviewForm) {
    reviewForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const custName = document.getElementById('rev-cust-name').value.trim();
      const custPhone = document.getElementById('rev-cust-phone').value.trim();
      const custCode = document.getElementById('rev-cust-code').value.trim().toUpperCase();
      const custStars = parseInt(document.getElementById('rev-cust-stars').value);
      // Feedback text is optional
      const custComment = (document.getElementById('rev-cust-comment').value || '').trim();

      if (!custName || !custPhone || !custCode) {
        showToast('Name and phone number are required.', 'warning');
        return;
      }

      const revSubmitBtn = document.getElementById('rev-submit-btn');
      if (revSubmitBtn) {
        revSubmitBtn.disabled = true;
        revSubmitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
      }

      try {
        const apiUrl = getBackendApiBase() + '/api/feedback';
        const res = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customer_name: custName,
            phone: custPhone,
            tracking_code: custCode,
            rating: custStars,
            feedback: custComment,
            technician_name: 'Afzal (Lead Electrical Specialist)'
          })
        });
        const data = await res.json();
        if (data.success) {
          markFeedbackCodeAsSubmitted(custCode);
          updateFeedbackFormView(custCode);
          showToast('⭐ Feedback submitted successfully!', 'success');
          if (reviewModal) reviewModal.classList.remove('active');
          reviewForm.reset();
        } else {
          if (data.error && (data.error.includes('already') || data.error.includes('Duplicate'))) {
            markFeedbackCodeAsSubmitted(custCode);
            updateFeedbackFormView(custCode);
          }
          if (revErrBanner && revErrText) {
            revErrBanner.style.display = 'flex';
            revErrText.textContent = data.error || 'Duplicate feedback rejected for this code.';
          }
          showToast(data.error || 'Duplicate feedback rejected for this code.', 'warning');
        }
      } catch (err) {
        // Fallback local save with 1-per-code duplicate protection
        let localFeedbacks = [];
        try {
          localFeedbacks = JSON.parse(localStorage.getItem('ar_local_feedback') || '[]');
        } catch (e) {
          localFeedbacks = [];
        }

        const rawPhoneDigits = custPhone.replace(/\D/g, '');
        const cleanPhone = rawPhoneDigits.length > 10 ? rawPhoneDigits.slice(-10) : rawPhoneDigits;
        const cleanName = custName.toLowerCase();

        const duplicate = localFeedbacks.find(f => {
          if ((f.tracking_code || '').toUpperCase() !== custCode) return false;
          const fPhone = (f.phone || '').replace(/\D/g, '');
          const phoneMatch = cleanPhone.length >= 6 && fPhone.includes(cleanPhone);
          const nameMatch = (f.customer_name || '').toLowerCase() === cleanName;
          return phoneMatch || nameMatch;
        });

        if (duplicate) {
          markFeedbackCodeAsSubmitted(custCode);
          updateFeedbackFormView(custCode);
          if (revErrBanner && revErrText) {
            revErrBanner.style.display = 'flex';
            revErrText.textContent = `Feedback for code "${custCode}" already submitted.`;
          }
          showToast(`Feedback for code "${custCode}" already submitted.`, 'warning');
        } else {
          localFeedbacks.unshift({
            id: Date.now(),
            tracking_code: custCode,
            customer_name: custName,
            phone: custPhone,
            technician_name: 'Afzal (Lead Electrical Specialist)',
            rating: custStars,
            feedback: custComment || 'Service completed (Rating only)',
            created_at: new Date().toISOString()
          });
          try {
            localStorage.setItem('ar_local_feedback', JSON.stringify(localFeedbacks));
          } catch (e) {}

          markFeedbackCodeAsSubmitted(custCode);
          updateFeedbackFormView(custCode);
          showToast('⭐ Feedback submitted successfully!', 'success');
          if (reviewModal) reviewModal.classList.remove('active');
          reviewForm.reset();
        }
      } finally {
        if (revSubmitBtn) {
          revSubmitBtn.disabled = false;
          revSubmitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Feedback';
        }
      }
    });
  }
}

function escapeHtml(t) {
  if (!t) return '';
  return String(t).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
}

// Customer entrance auth gate removed - direct website access enabled
function initAuthGate() {
  document.body.classList.remove('auth-locked');
}

/* ========================================================
   ADMIN LIVE ONLINE / OFFLINE STATUS WATCHER (SYNCED WITH ADMIN)
   ======================================================== */
window.showAdminOfflineNotice = function(customMsg) {
  const modal = document.getElementById('admin-offline-modal');
  if (modal) {
    modal.classList.add('active');
  }
  showToast(customMsg || '🔴 Admin is currently offline. Repair bookings are paused.', 'warning');
};

function initAdminOfflineModal() {
  const modal = document.getElementById('admin-offline-modal');
  const closeBtn = document.getElementById('admin-offline-close');
  const okBtn = document.getElementById('admin-offline-ok-btn');
  if (!modal) return;
  const hide = () => modal.classList.remove('active');
  if (closeBtn) closeBtn.addEventListener('click', hide);
  if (okBtn) okBtn.addEventListener('click', hide);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) hide();
  });
}

function initAdminLiveStatusWatcher() {
  const badge = document.getElementById('admin-status-indicator');
  const label = document.getElementById('admin-status-label');
  const chatDot = document.getElementById('chat-admin-indicator');
  const chatLabel = document.getElementById('chat-admin-status-label');

  let currentOnlineState = null;
  initAdminOfflineModal();

  function applyAdminStatus(isOnline, customMsg) {
    window.isAdminOnline = isOnline;
    if (typeof window.syncTrackerOnlineState === 'function') {
      window.syncTrackerOnlineState(isOnline);
    }
    currentOnlineState = isOnline;

    const offlineBanner = document.getElementById('booking-offline-banner');
    const submitBtn = document.querySelector('#booking-form button[type="submit"]');

    if (isOnline) {
      document.body.classList.remove('admin-offline');
      if (offlineBanner) offlineBanner.style.display = 'none';
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.style.opacity = '1';
        submitBtn.style.cursor = 'pointer';
        submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> <span data-i18n="modal_submit_btn">Send Request</span>';
      }
    } else {
      document.body.classList.add('admin-offline');
      if (offlineBanner) offlineBanner.style.display = 'flex';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.style.opacity = '0.55';
        submitBtn.style.cursor = 'not-allowed';
        submitBtn.innerHTML = '<i class="fas fa-ban"></i> <span>Admin Offline (Bookings Paused)</span>';
      }
      // If booking modal was open when admin went offline, close it and show offline modal
      const bookingModal = document.getElementById('booking-modal');
      if (bookingModal && bookingModal.classList.contains('active')) {
        bookingModal.classList.remove('active');
        window.showAdminOfflineNotice();
      }
    }

    // 1. Hero live status indicator pill
    const currentBadge = document.getElementById('admin-status-indicator') || badge;
    const currentLabel = document.getElementById('admin-status-label') || label;
    if (currentBadge && currentLabel) {
      if (isOnline) {
        currentBadge.className = 'admin-status-pill online';
        currentLabel.textContent = 'Admin: Online';
        currentBadge.title = customMsg || 'Afzal (Admin) is Online • Ready for Home Service & Repairs';
      } else {
        currentBadge.className = 'admin-status-pill offline';
        currentLabel.textContent = 'Admin: Offline';
        currentBadge.title = customMsg || 'Admin is currently Offline (Away) • Repair bookings are paused';
      }
    }

    // 2. Hero main CTA button
    const heroBtn = document.getElementById('hero-book-btn') || document.querySelector('.hero-cta-group .trigger-booking');
    if (heroBtn) {
      if (isOnline) {
        heroBtn.classList.remove('btn-offline-paused');
        heroBtn.innerHTML = '<i class="fas fa-calendar-plus"></i> <span data-i18n="hero_btn_book">Request Home Technician</span>';
        heroBtn.title = 'Request Home Technician';
      } else {
        heroBtn.classList.add('btn-offline-paused');
        heroBtn.innerHTML = '<i class="fas fa-ban"></i> <span>Admin Offline (Services Paused)</span>';
        heroBtn.title = 'Admin is currently offline. Repair services are paused.';
      }
    }

    // 3. Navbar booking button
    const navBtn = document.getElementById('nav-book-btn') || document.querySelector('header .trigger-booking');
    if (navBtn) {
      if (isOnline) {
        navBtn.classList.remove('btn-offline-paused');
        navBtn.innerHTML = '<i class="fas fa-screwdriver-wrench"></i> <span data-i18n="nav_book">Book Repair</span>';
        navBtn.title = 'Book Repair';
      } else {
        navBtn.classList.add('btn-offline-paused');
        navBtn.innerHTML = '<i class="fas fa-ban"></i> <span>Offline (Paused)</span>';
        navBtn.title = 'Admin is currently offline. Bookings paused.';
      }
    }

    // 4. Service cards booking buttons
    const serviceBtns = document.querySelectorAll('.btn-service-book.trigger-booking');
    serviceBtns.forEach(btn => {
      if (isOnline) {
        btn.classList.remove('btn-offline-paused');
        btn.innerHTML = '<i class="fas fa-calendar-check"></i> <span data-i18n="srv_card_btn">Book Repair</span>';
        btn.title = 'Book Repair';
      } else {
        btn.classList.add('btn-offline-paused');
        btn.innerHTML = '<i class="fas fa-ban"></i> <span>Paused (Admin Offline)</span>';
        btn.title = 'Admin is currently offline. Repair bookings are paused.';
      }
    });

    // 5. Location section doorstep button
    const locBtn = document.querySelector('.address-action-buttons .trigger-booking');
    if (locBtn) {
      if (isOnline) {
        locBtn.classList.remove('btn-offline-paused');
        locBtn.innerHTML = '<i class="fas fa-calendar-check"></i> <span data-i18n="loc_home_btn">Book Doorstep Visit</span>';
      } else {
        locBtn.classList.add('btn-offline-paused');
        locBtn.innerHTML = '<i class="fas fa-ban"></i> <span>Admin Offline (Visit Paused)</span>';
      }
    }

    // 6. Chat label & indicator
    if (chatLabel) {
      if (isOnline) {
        if (chatDot) chatDot.style.background = '#10b981';
        chatLabel.textContent = 'Admin: Online • Quick Response';
      } else {
        if (chatDot) chatDot.style.background = '#ef4444';
        chatLabel.textContent = 'Admin: Offline (Away) • Bookings Paused';
      }
    }
  }

  const CLOUD_SYNC_GET_URL = 'https://keyvalue.immanuel.co/api/KeyVal/GetValue/ar_technician_live_status_afzal3282/mood';
  const CLOUD_SYNC_SET_URL = 'https://keyvalue.immanuel.co/api/KeyVal/UpdateValue/ar_technician_live_status_afzal3282/mood';

  async function checkAdminLiveStatus() {
    let isOnline = true;
    let customMsg = '';

    // Step 1: Read localStorage first (works offline, on Netlify, and across tabs)
    const localMood = localStorage.getItem('ar_admin_mood') || localStorage.getItem('electro_admin_mood');
    if (localMood === 'OFF') {
      isOnline = false;
      customMsg = 'Admin is currently Offline (Away) • Repair bookings are paused';
    } else {
      isOnline = true;
      customMsg = 'Admin is Online & Available';
    }

    // Step 2: Query Universal Cloud Sync (Cross-device real-time sync across Netlify, mobile, PC)
    try {
      const cloudCtrl = new AbortController();
      const cloudTimer = setTimeout(() => cloudCtrl.abort(), 2000);
      const cloudRes = await fetch(CLOUD_SYNC_GET_URL, { signal: cloudCtrl.signal });
      clearTimeout(cloudTimer);
      if (cloudRes && cloudRes.ok) {
        const cloudMood = await cloudRes.json();
        if (cloudMood === 'OFF') {
          isOnline = false;
          customMsg = 'Admin is currently Offline (Away) • Repair bookings are paused';
          localStorage.setItem('ar_admin_mood', 'OFF');
          localStorage.setItem('electro_admin_mood', 'OFF');
        } else if (cloudMood === 'ON') {
          isOnline = true;
          customMsg = 'Admin is Online & Available';
          localStorage.setItem('ar_admin_mood', 'ON');
          localStorage.setItem('electro_admin_mood', 'ON');
        }
      }
    } catch (e) { }

    // Step 3: Also query live backend API if server is running
    try {
      const apiEndpoint = (typeof API_BASE !== 'undefined' ? API_BASE : '') + '/api/admin/status';
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      const res = await fetch(apiEndpoint, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (res && res.ok) {
        const data = await res.json();
        if (data && data.success) {
          const serverIsOnline = (data.is_online === true || data.status_mood === 'ON');
          // If server reports offline, mark offline
          if (!serverIsOnline) {
            isOnline = false;
            customMsg = data.status_message || 'Admin is currently Offline (Away) • Repair bookings are paused';
            localStorage.setItem('ar_admin_mood', 'OFF');
            localStorage.setItem('electro_admin_mood', 'OFF');
          } else if (localMood === 'OFF') {
            // Local mood was set to OFF by admin; keep OFF so stale server default does not clobber it
            isOnline = false;
            customMsg = 'Admin is currently Offline (Away) • Repair bookings are paused';
          } else {
            isOnline = true;
            customMsg = data.status_message || 'Admin is Online & Available';
          }
        }
      }
    } catch (e) {
      // Backend not reached; localMood holds
    }

    applyAdminStatus(isOnline, customMsg);
  }

  function broadcastAndSyncAdminMood(targetMood) {
    localStorage.setItem('ar_admin_mood', targetMood);
    localStorage.setItem('electro_admin_mood', targetMood);
    applyAdminStatus(targetMood === 'ON');

    // 1. Cross-device universal cloud sync
    try {
      fetch(`${CLOUD_SYNC_SET_URL}/${targetMood}`, { method: 'POST' }).catch(() => {});
    } catch (e) { }

    // 2. BroadcastChannel for instant same-browser cross-tab sync
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const moodChannel = new BroadcastChannel('ar_admin_mood_channel');
        moodChannel.postMessage({ mood: targetMood, is_online: targetMood === 'ON' });
      }
    } catch (e) { }

    // 3. Custom event
    try {
      window.dispatchEvent(new CustomEvent('ar_admin_mood_change', { detail: { mood: targetMood, is_online: targetMood === 'ON' } }));
    } catch (e) { }

    // 4. Local backend server
    try {
      const apiEndpoint = (typeof API_BASE !== 'undefined' ? API_BASE : '') + '/api/admin/status';
      fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status_mood: targetMood, is_online: targetMood === 'ON' })
      }).catch(() => {});
    } catch (e) { }

    showToast(targetMood === 'ON' ? '🟢 Admin status set to ONLINE across all devices!' : '🔴 Admin status set to OFFLINE across all devices! Repair bookings are paused.', targetMood === 'ON' ? 'success' : 'warning');
  }

  if (badge) {
    badge.addEventListener('click', () => {
      // Check if logged-in customer is administrator Afzal
      let custUser = null;
      try {
        const raw = localStorage.getItem('ar_customer_user');
        custUser = raw ? JSON.parse(raw) : null;
      } catch (e) { }
      const rawPhone = custUser ? String(custUser.phone || custUser.identifier || '').replace(/\D/g, '') : '';
      const isAdminUser = Boolean(
        sessionStorage.getItem('admin_authenticated') === 'afzal' ||
        rawPhone === '8485991694' || rawPhone.endsWith('8485991694') ||
        rawPhone === '6351618067' || rawPhone.endsWith('6351618067')
      );

      const currentMood = (window.isAdminOnline === false) ? 'OFF' : 'ON';
      const targetMood = (currentMood === 'ON') ? 'OFF' : 'ON';

      if (isAdminUser) {
        const confirmMsg = targetMood === 'OFF'
          ? '⚙️ Admin Quick Control (Afzal):\nSwitch live status to "I am OFF"?\n(This will pause repair bookings and show Admin: Offline across all devices)'
          : '⚙️ Admin Quick Control (Afzal):\nSwitch live status to "I am ON"?\n(This will resume repair bookings and show Admin: Online across all devices)';

        if (confirm(confirmMsg)) {
          broadcastAndSyncAdminMood(targetMood);
          return;
        }
      } else {
        // Not currently logged in as admin phone: allow Admin PIN verification to switch on any device
        const promptInput = prompt(
          `⚙️ Admin Quick Control:\nCurrent Status: ${currentMood === 'ON' ? 'ONLINE (Green)' : 'OFFLINE (Red)'}\n\nEnter Admin PIN (1512) to switch status to "I am ${targetMood}":`
        );
        if (promptInput && promptInput.trim() === '1512') {
          broadcastAndSyncAdminMood(targetMood);
          return;
        }
        if (promptInput !== null && promptInput.trim() !== '') {
          showToast('❌ Incorrect Admin PIN. Status unchanged.', 'error');
          return;
        }
      }

      if (window.isAdminOnline === false) {
        window.showAdminOfflineNotice();
      } else {
        showToast('🟢 Admin is Online & Active right now! Ready for fast doorstep repairs.', 'success');
      }
    });
  }

  // 1. Initial immediate synchronous check from localStorage (instant 0ms response, no flicker)
  if (localStorage.getItem('ar_admin_online_v2') !== 'done') {
    localStorage.setItem('ar_admin_mood', 'ON');
    localStorage.setItem('electro_admin_mood', 'ON');
    localStorage.setItem('ar_admin_online_v2', 'done');
  }
  const initialSavedMood = localStorage.getItem('ar_admin_mood') || localStorage.getItem('electro_admin_mood') || 'ON';
  applyAdminStatus(initialSavedMood !== 'OFF', initialSavedMood === 'OFF' ? 'Admin is currently Offline (Away) • Repair bookings are paused' : 'Admin is Online & Available');

  // 2. Initial async verification against backend
  checkAdminLiveStatus();

  // 3. Poll every 2.5 seconds for instant real-time sync with Admin mood switch
  setInterval(checkAdminLiveStatus, 2500);

  // 4. Cross-tab and BroadcastChannel listeners for instant 0-second sync
  try {
    if (typeof BroadcastChannel !== 'undefined') {
      const moodChannel = new BroadcastChannel('ar_admin_mood_channel');
      moodChannel.onmessage = (e) => {
        if (e && e.data) {
          const isOnline = e.data.mood === 'ON' || e.data.is_online === true;
          applyAdminStatus(isOnline, isOnline ? 'Admin is Online & Available' : 'Admin is currently Offline (Away)');
        }
      };
    }
  } catch (e) { }

  window.addEventListener('ar_admin_mood_change', (e) => {
    if (e && e.detail) {
      const isOnline = e.detail.mood === 'ON' || e.detail.is_online === true;
      applyAdminStatus(isOnline, isOnline ? 'Admin is Online & Available' : 'Admin is currently Offline (Away)');
    }
  });

  // Sync when user re-focuses tab or admin toggles mood in another tab
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) checkAdminLiveStatus();
  });
  window.addEventListener('storage', (e) => {
    if (e.key === 'ar_admin_mood' || e.key === 'electro_admin_mood') {
      checkAdminLiveStatus();
    }
    if (e.key === 'ar_local_bookings' || e.key === 'ar_customer_user' || !e.key) {
      if (typeof window.syncCustomerCodeVisibility === 'function') {
        window.syncCustomerCodeVisibility();
      }
      const trackInput = document.getElementById('track-input');
      const trackModal = document.getElementById('tracking-modal');
      if (trackInput && trackInput.value && trackModal && trackModal.classList.contains('active')) {
        const trackForm = document.getElementById('track-form');
        if (trackForm) {
          trackForm.dispatchEvent(new Event('submit'));
        }
      }
    }
  });

  window.addEventListener('ar:order_updated', () => {
    if (typeof window.syncCustomerCodeVisibility === 'function') {
      window.syncCustomerCodeVisibility();
    }
    const trackInput = document.getElementById('track-input');
    const trackModal = document.getElementById('tracking-modal');
    if (trackInput && trackInput.value && trackModal && trackModal.classList.contains('active')) {
      const trackForm = document.getElementById('track-form');
      if (trackForm) {
        trackForm.dispatchEvent(new Event('submit'));
      }
    }
  });
}

/* ========================================================
   USER "MY BOOKINGS" PILL & TRACKING INTERACTIVITY
   ======================================================== */
function initUserCodePill() {
  const myBookingsPill = document.getElementById('user-my-bookings-pill');
  const legacyPill = document.getElementById('user-code-pill');

  window.openMyBookingsModal = function () {
    let currentUser = null;
    try {
      const raw = localStorage.getItem('ar_customer_user');
      currentUser = raw ? JSON.parse(raw) : null;
    } catch (e) {}

    let localBookings = [];
    try {
      localBookings = JSON.parse(localStorage.getItem('ar_local_bookings') || '[]');
    } catch (e) {}

    if (currentUser) {
      if (typeof openDashboard === 'function') {
        openDashboard(currentUser);
        if (typeof showDashBookingsTab === 'function') showDashBookingsTab();
      }
    } else if (localBookings.length > 0 && typeof openDashboard === 'function') {
      openDashboard({
        name: 'Valued Customer',
        phone: '',
        orders: localBookings
      });
      if (typeof showDashBookingsTab === 'function') showDashBookingsTab();
    } else {
      if (typeof openLoginModal === 'function') {
        openLoginModal();
      }
      if (typeof showToast === 'function') {
        showToast('Please login to view all your repair bookings.', 'info');
      }
    }
  };

  if (myBookingsPill) {
    myBookingsPill.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      window.openMyBookingsModal();
    });
  }

  if (legacyPill && legacyPill !== myBookingsPill) {
    legacyPill.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      window.openMyBookingsModal();
    });
  }
}

