import * as Localization from 'expo-localization';
import { storage } from '../src/store/kisanOpsStore';

export const translations = {
  en: {
    common: {
      appName: "KisanOps / Yukti",
      saathiName: "KisanOps Saathi",
      hindi: "हिन्दी",
      english: "English",
      back: "Back",
      confirm: "Confirm",
      cancel: "Cancel",
      submit: "Submit",
      loading: "Loading...",
      retry: "Retry",
      offline: "You are offline. Showing cached data.",
      phone: "Phone Number",
      otp: "Enter OTP",
      login: "Login / Log In",
      logout: "Logout",
      acres: "acres",
      save: "Save",
      edit: "Edit",
      village: "Village",
      district: "District",
      state: "State",
      crop: "Crop",
      size: "Farm Size",
      next: "Next",
      skip: "Skip",
      whyThisMachine: "Why this machine?",
      whyThisPrice: "Why this price?",
      payNow: "Pay Now",
      payAfterHarvest: "Pay After Harvest",
      confirmBooking: "Confirm Booking",
      bookNow: "Book Now",
      viewDetails: "Details",
    },
    home: {
      greeting: "Namaste, {name} 👋",
      whatDoYouNeed: "What do you need today?",
      speak: "Speak your need",
      speakSub: "Tap & speak: e.g. 'Harvest crop tomorrow'",
      findMachine: "Find Machine",
      myBookings: "My Bookings",
      trackMachine: "Track Machine",
      payments: "Payments",
      profile: "Profile & Farm",
      help: "Help & Support",
      today: "Today",
      tomorrow: "Tomorrow",
      weatherWarning: "Rain expected. High traction risks. Check fields for heavy machinery.",
      activeBooking: "Active Booking",
      activeBookingSub: "JD Harvester arriving in 18 mins",
      recommended: "Recommended Machine",
      recommendedSub: "Optimal match for your crop context",
      writeFallback: "Or type your requirement...",
      noActiveRentals: "No active rentals scheduled.",
      browseMachinery: "Browse Machinery",
      trackTelematics: "Track Dispatch",
      viewAll: "View All",
    },
    saathi: {
      title: "KisanOps Saathi",
      tagline: "Just speak, we'll understand.",
      hint: "Speak naturally: 'Bhaiya, kal gehu katayi ke liye harvester chahiye'",
      states: {
        IDLE: " बोलकर बताएं / Speak your need",
        LISTENING: "Hearing you...",
        PROCESSING: "Understanding...",
        SEARCHING: "Finding machines...",
        RESPONDING: "Responding...",
        ERROR: "Sorry, could not process. Please retry.",
      },
      missingQuestion: "I need a bit more info: {field}",
      matchCount: "Found {count} matching machines for you.",
      confirmedMessage: "Perfect! Your booking has been confirmed.",
    },
    machines: {
      categoryTractor: "🚜 Tractor",
      categoryHarvester: "🌾 Harvester",
      categoryRotavator: "🔄 Rotavator",
      categorySeeder: "🌱 Seeder",
      categorySprayer: "💧 Sprayer",
      categoryThresher: "⚙ Thresher",
      categoryTrailer: "🚚 Transport",
      distance: "{dist} km away",
      hourlyPrice: "₹{price}/hour",
      health: "Machine Health {health}%",
      matchScore: "{score}% Match",
      suitabilityReason: "Suitable for {crop} harvesting",
      rating: "★ {rating} ({rentals} rentals)",
      operatorName: "Operator: {name}",
      operatorPhone: "Call Driver: {phone}",
      bookingProgress: "Booking Step {step} of 4",
      chooseDate: "Choose Date & Time",
      duration: "Duration (Hours)",
      acreage: "Farm Area (Acres)",
      reviewPrice: "Review Rental Booking Price",
      baseRate: "Base Operating Rate",
      demandSurge: "Regional Demand Surge",
      transportCharge: "Hub Mobilization Transit",
      discount: "Health Incentive Discount",
      estimatedTotal: "Estimated Total Bill (Incl. GST)",
    },
    bookings: {
      upcoming: "Upcoming",
      active: "Active",
      completed: "Completed",
      track: "Track Machine Location",
      viewInvoice: "View Tax Invoice",
      downloadInvoice: "Share / Save Invoice",
      operator: "Machine Operator",
      timelineTitle: "Dispatch Telematics Timeline",
      timelineConfirm: "Booking confirmed",
      timelineOperator: "Operator assigned",
      timelineDispatched: "Machine dispatched",
      timelineOnWay: "Machine on the way",
      timelineArrived: "Arrived at farm boundary",
      timelineStarted: "Work started on field",
      timelineCompleted: "Work completed & hours logged",
      statusRequested: "Requested",
      statusConfirmed: "Machine Booked",
      statusDispatched: "Machine Dispatched",
      statusInProgress: "Work In Progress",
      statusCompleted: "Rental Completed",
      statusCancelled: "Booking Cancelled",
    },
    credit: {
      title: "AgriCredit Limit Status",
      eligibleLimit: "Post-Harvest Limit",
      availableLimit: "Available Credit",
      tenure: "Repay post-harvest (within 45 days)",
      disclaimer: "Deferred payment eligibility based on land size & settlement history.",
      insufficient: "Insufficient Credit Limit. Choose UPI/Card.",
    },
    profile: {
      title: "Farmer Profile Settings",
      farmTitle: "Farmland Boundaries",
      cropStage: "Crop Cycle Stage",
      soilType: "Soil Composition",
      irrigationType: "Water Source",
      saveProfile: "Save Farmland Details",
    }
  },
  hi: {
    common: {
      appName: "किसानOps / युक्ति",
      saathiName: "किसानOps साथी",
      hindi: "हिन्दी",
      english: "English",
      back: "पीछे जाएं",
      confirm: "पुष्टि करें",
      cancel: "रद्द करें",
      submit: "जमा करें",
      loading: "लोड हो रहा है...",
      retry: "फिर से कोशिश करें",
      offline: "आप ऑफलाइन हैं। पुरानी जानकारी दिखाई जा रही है।",
      phone: "मोबाइल नंबर",
      otp: "ओटीपी दर्ज करें",
      login: "लॉगिन करें",
      logout: "लॉगआउट",
      acres: "एकड़",
      save: "सुरक्षित करें",
      edit: "बदलाव करें",
      village: "गांव",
      district: "जिला",
      state: "राज्य",
      crop: "फसल",
      size: "खेत का आकार",
      next: "आगे बढ़ें",
      skip: "छोड़ें",
      whyThisMachine: "यह मशीन क्यों?",
      whyThisPrice: "यह कीमत क्यों?",
      payNow: "अभी भुगतान करें",
      payAfterHarvest: "फसल कटाई के बाद भुगतान (AgriCredit)",
      confirmBooking: "बुकिंग पक्की करें",
      bookNow: "बुक करें",
      viewDetails: "विवरण",
    },
    home: {
      greeting: "नमस्ते, {name} 👋",
      whatDoYouNeed: "आज आपको किस चीज़ की जरूरत है?",
      speak: "बोलकर बताएं",
      speakSub: "टैप करें और बोलें: जैसे 'कल कटाई के लिए मशीन चाहिए'",
      findMachine: "मशीन खोजें",
      myBookings: "मेरी बुकिंग",
      trackMachine: "मशीन ट्रैक करें",
      payments: "पेमेंट / बिल",
      profile: "मेरा खेत और प्रोफाइल",
      help: "मदद और सहायता",
      today: "आज",
      tomorrow: "कल",
      weatherWarning: "बारिश की संभावना! भारी मशीन चलाने से पहले खेत की स्थिति जांचें।",
      activeBooking: "सक्रिय बुकिंग",
      activeBookingSub: "हार्वेस्टर 18 मिनट में पहुंच रहा है",
      recommended: "आपके लिए मशीन",
      recommendedSub: "आपके खेत के लिए सबसे बढ़िया मैच",
      writeFallback: "या अपनी जरूरत लिखकर बताएं...",
      noActiveRentals: "अभी कोई सक्रिय बुकिंग नहीं है।",
      browseMachinery: "मशीनें देखें",
      trackTelematics: "मशीन की स्थिति देखें",
      viewAll: "सभी देखें",
    },
    saathi: {
      title: "किसानOps साथी",
      tagline: "बस बोलिए, हम समझेंगे।",
      hint: "प्राकृतिक भाषा में बोलें: 'भैया कल मेरे 8 एकड़ गेहूं की कटाई करनी है'",
      states: {
        IDLE: "बोलकर बताएं / Speak your need",
        LISTENING: "सुन रहा हूँ...",
        PROCESSING: "समझ रहा हूँ...",
        SEARCHING: "आपके लिए मशीन ढूंढ रहा हूँ...",
        RESPONDING: "जवाब दे रहा हूँ...",
        ERROR: "आवाज समझने में त्रुटि। कृपया फिर कोशिश करें।",
      },
      missingQuestion: "मुझे थोड़ी और जानकारी चाहिए: {field}",
      matchCount: "आपके लिए {count} मशीनें मिली हैं।",
      confirmedMessage: "बहुत बढ़िया! आपकी बुकिंग पक्की हो चुकी है।",
    },
    machines: {
      categoryTractor: "🚜 ट्रैक्टर",
      categoryHarvester: "🌾 हार्वेस्टर",
      categoryRotavator: "🔄 रोटावेटर",
      categorySeeder: "🌱 सीडर",
      categorySprayer: "💧 स्प्रेयर",
      categoryThresher: "⚙ थ्रेशर",
      categoryTrailer: "🚚 ट्रांसपोर्ट / ट्रॉली",
      distance: "{dist} किमी दूर",
      hourlyPrice: "₹{price}/घंटा",
      health: "मशीन स्वास्थ्य {health}%",
      matchScore: "{score}% मैच",
      suitabilityReason: "{crop} की कटाई के लिए सबसे बढ़िया",
      rating: "★ {rating} ({rentals} बुकिंग)",
      operatorName: "ऑपरेटर: {name}",
      operatorPhone: "ड्राइवर को कॉल करें: {phone}",
      bookingProgress: "बुकिंग चरण {step} / 4",
      chooseDate: "तारीख और समय चुनें",
      duration: "कितने घंटे चाहिए?",
      acreage: "खेत का आकार (एकड़)",
      reviewPrice: "बुकिंग राशि का विवरण",
      baseRate: "मशीन का आधार किराया",
      demandSurge: "सीजन मांग शुल्क",
      transportCharge: "मशीन लाने का ट्रांसपोर्ट खर्च",
      discount: "मशीन स्वास्थ्य छूट",
      estimatedTotal: "कुल अनुमानित किराया (GST सहित)",
    },
    bookings: {
      upcoming: "आने वाली",
      active: "चालू",
      completed: "पूरी हो चुकी",
      track: "लोकेशन ट्रैक करें",
      viewInvoice: "बिल (रसीद) देखें",
      downloadInvoice: "बिल शेयर / डाउनलोड करें",
      operator: "मशीन ड्राइवर",
      timelineTitle: "मशीन आने की स्थिति (GPS)",
      timelineConfirm: "बुकिंग स्वीकार की गई",
      timelineOperator: "ऑपरेटर नियुक्त किया गया",
      timelineDispatched: "मशीन केंद्र से निकल चुकी है",
      timelineOnWay: "मशीन रास्ते में है",
      timelineArrived: "खेत की सीमा पर पहुंच गई है",
      timelineStarted: "खेत पर काम शुरू हो चुका है",
      timelineCompleted: "काम पूरा हुआ और घंटे दर्ज हुए",
      statusRequested: "रिक्वेस्ट भेजी गई",
      statusConfirmed: "बुकिंग स्वीकार",
      statusDispatched: "मशीन निकल चुकी है",
      statusInProgress: "काम चल रहा है",
      statusCompleted: "काम पूरा हो गया",
      statusCancelled: "बुकिंग रद्द",
    },
    credit: {
      title: "आपकी AgriCredit लिमिट",
      eligibleLimit: "फसल कटाई के बाद लिमिट",
      availableLimit: "बची हुई लिमिट",
      tenure: "कटाई के बाद चुकाएं (45 दिनों में)",
      disclaimer: "कटाई के बाद भुगतान की सुविधा आपके खेत के आकार और इतिहास पर निर्भर करती है।",
      insufficient: "AgriCredit लिमिट कम है। कृपया UPI या कार्ड चुनें।",
    },
    profile: {
      title: "किसान प्रोफाइल सेटिंग्स",
      farmTitle: "खेत और फसल की जानकारी",
      cropStage: "फसल की स्थिति",
      soilType: "मिट्टी का प्रकार",
      irrigationType: "सिंचाई का साधन",
      saveProfile: "विवरण सुरक्षित करें",
    }
  }
};

export type LanguageType = 'en' | 'hi';

// Load initial language preference
let currentLang: LanguageType = 'hi'; // Default to Hindi for Indian Smallholder focus

export function getLanguage(): LanguageType {
  const saved = storage.getItem('kisanops_lang');
  if (saved === 'en' || saved === 'hi') {
    currentLang = saved;
  } else {
    // Detect system locale
    const locales = Localization.getLocales();
    if (locales && locales.length > 0 && locales[0].languageCode?.startsWith('en')) {
      currentLang = 'en';
    }
  }
  return currentLang;
}

export function setLanguage(lang: LanguageType) {
  currentLang = lang;
  storage.setItem('kisanops_lang', lang);
}

// Simple translation getter supporting variables
export function t(keyString: string, variables?: Record<string, string | number>): string {
  const lang = getLanguage();
  const keys = keyString.split('.');
  let currentObj: any = translations[lang];

  for (const key of keys) {
    if (currentObj && currentObj[key] !== undefined) {
      currentObj = currentObj[key];
    } else {
      // Fallback to English
      let engObj: any = translations['en'];
      for (const k of keys) {
        if (engObj && engObj[k] !== undefined) {
          engObj = engObj[k];
        } else {
          return keyString;
        }
      }
      currentObj = engObj;
      break;
    }
  }

  if (typeof currentObj !== 'string') {
    return keyString;
  }

  let text = currentObj;
  if (variables) {
    Object.keys(variables).forEach((vName) => {
      text = text.replace(`{${vName}}`, String(variables[vName]));
    });
  }
  return text;
}
