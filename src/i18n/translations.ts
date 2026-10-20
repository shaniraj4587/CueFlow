export type SupportedLanguage = 'en' | 'hi';

export interface TranslationSchema {
  // Common
  appName: string;
  tagline: string;
  save: string;
  saved: string;
  cancel: string;
  reset: string;
  edit: string;
  copy: string;
  delete: string;
  back: string;
  done: string;
  play: string;
  pause: string;
  float: string;
  prompt: string;
  settings: string;
  words: string;
  minutes: string;
  seconds: string;
  clear: string;

  // Home Screen
  newScript: string;
  searchPlaceholder: string;
  noScriptsTitle: string;
  noScriptsSub: string;
  noMatchingScripts: string;
  noMatchingScriptsSub: string;
  clearSearch: string;
  createScriptBtn: string;
  resetSampleBtn: string;
  deleteConfirmTitle: string;
  deleteConfirmMsg: string;

  // Editor Screen
  editorTitle: string;
  scriptTitlePlaceholder: string;
  scriptBodyPlaceholder: string;
  importTextFile: string;
  exportBtn: string;
  monoFont: string;
  hindiSampleBtn: string;
  englishSampleBtn: string;
  loadHindiSample: string;
  loadEnglishSample: string;
  saveChanges: string;
  saveAsNew: string;
  clearAll: string;
  wordsLabel: string;
  charsLabel: string;
  estReadingLabel: string;

  // Settings Tabs
  tabReading: string;
  tabLook: string;
  tabStage: string;
  tabVoice: string;
  tabPrivacy: string;

  // Settings Controls
  languageSection: string;
  appLanguage: string;
  resetConfirmTitle: string;
  resetConfirmMsg: string;
  scrollingAndPacing: string;
  scrollingSpeed: string;
  countdownBeforePlayback: string;
  blankLinePauseDuration: string;
  reverseScrolling: string;
  reverseScrollingSub: string;
  typographyAndMargins: string;
  textSize: string;
  lineHeight: string;
  letterSpacing: string;
  sideMargins: string;
  readingWidth: string;
  themeAndColor: string;
  themeMode: string;
  lightTheme: string;
  darkTheme: string;
  mirrorMode: string;
  mirrorModeSub: string;
  fontAndAlignment: string;
  fontStyle: string;
  fontModern: string;
  fontMono: string;
  fontSerif: string;
  textAlignment: string;
  alignCenter: string;
  alignLeft: string;
  alignRight: string;
  fullscreenEnvironment: string;
  keepScreenAwake: string;
  keepScreenAwakeSub: string;
  readingGuideStyle: string;
  readingGuidePosition: string;
  guideWindow: string;
  guideLine: string;
  guideHighlight: string;
  guideNone: string;

  // Voice Follow
  speechPacing: string;
  enableVoiceFollow: string;
  enableVoiceFollowSub: string;
  voiceSensitivity: string;
  speechLanguage: string;
  speechLanguageSub: string;
  hindiIndia: string;
  englishUS: string;
  englishIndia: string;
  privacyMicPolicy: string;
  privacyMicDesc: string;

  // Floating Overlay
  floatingOverlay: string;
  floatingWidth: string;
  floatingHeight: string;
  floatingOpacity: string;
  floatingTextSize: string;
  launchFloatingTest: string;
  floatingHelp: string;

  // Privacy & About
  appInformation: string;
  appVersion: string;
  appDesc: string;
  ourCorePromises: string;
  freeAndAdFree: string;
  freeAndAdFreeSub: string;
  localStorage: string;
  localStorageSub: string;
  noCameraPerm: string;
  noCameraPermSub: string;
}

export const translations: Record<SupportedLanguage, TranslationSchema> = {
  en: {
    appName: 'CueFlow',
    tagline: 'Teleprompter',
    save: 'Save',
    saved: 'Saved',
    cancel: 'Cancel',
    reset: 'Reset',
    edit: 'Edit',
    copy: 'Copy',
    delete: 'Delete',
    back: 'Back',
    done: 'Done',
    play: 'Play',
    pause: 'Pause',
    float: 'Float',
    prompt: 'Prompt ▶',
    settings: 'Settings',
    words: 'words',
    minutes: 'm',
    seconds: 's',
    clear: 'Clear',

    newScript: '+ New Script',
    searchPlaceholder: 'Search scripts by title or text...',
    noScriptsTitle: 'No scripts yet',
    noScriptsSub: 'Tap + New Script to write your first speech, presentation, or meeting notes.',
    noMatchingScripts: 'No Matching Scripts',
    noMatchingScriptsSub: 'Try searching for another keyword or clear the search query.',
    clearSearch: 'Clear Search',
    createScriptBtn: '+ Create First Script',
    resetSampleBtn: 'Restore Sample Scripts',
    deleteConfirmTitle: 'Delete Script',
    deleteConfirmMsg: 'Are you sure you want to permanently delete this script?',

    editorTitle: 'Script Editor',
    scriptTitlePlaceholder: 'Script Title...',
    scriptBodyPlaceholder: 'Write or paste your script here...\n\nTip: Leave empty lines where you wish to take deliberate pauses.',
    importTextFile: '📂 Import File',
    exportBtn: '💾 Export',
    monoFont: '🔤 Mono',
    hindiSampleBtn: '🇮🇳 हिंदी नमूना',
    englishSampleBtn: '📑 English Sample',
    loadHindiSample: 'Load Hindi Sample (हिंदी)',
    loadEnglishSample: 'Load English Sample',
    saveChanges: 'Save Script',
    saveAsNew: 'Save as New Copy',
    clearAll: '🗑 Clear',
    wordsLabel: 'Words:',
    charsLabel: 'Chars:',
    estReadingLabel: 'Est. Reading:',

    tabReading: 'Reading',
    tabLook: 'Look',
    tabStage: 'Stage',
    tabVoice: 'Voice Follow',
    tabPrivacy: 'Privacy & About',

    languageSection: 'APP LANGUAGE / भाषा',
    appLanguage: 'Application Language',
    resetConfirmTitle: 'Reset Settings',
    resetConfirmMsg: 'Reset all reading, look, and stage preferences to defaults?',
    scrollingAndPacing: 'SCROLLING & PACING',
    scrollingSpeed: 'Scrolling Speed',
    countdownBeforePlayback: 'Countdown Before Playback',
    blankLinePauseDuration: 'Blank-line Pause Duration',
    reverseScrolling: 'Reverse Scrolling',
    reverseScrollingSub: 'Scroll upwards instead of downwards',
    typographyAndMargins: 'TYPOGRAPHY & MARGINS',
    textSize: 'Text Size',
    lineHeight: 'Line Height',
    letterSpacing: 'Letter Spacing',
    sideMargins: 'Side Margins',
    readingWidth: 'Reading Width',
    themeAndColor: 'THEME & COLOR',
    themeMode: 'Theme Mode',
    lightTheme: '☀ Light Theme',
    darkTheme: '🌙 Dark Theme',
    mirrorMode: 'Mirror Mode',
    mirrorModeSub: 'Horizontally flips script for professional teleprompter glass rigs',
    fontAndAlignment: 'FONT & ALIGNMENT',
    fontStyle: 'Font Style',
    fontModern: 'Modern',
    fontMono: 'Mono',
    fontSerif: 'Serif',
    textAlignment: 'Text Alignment',
    alignCenter: 'CENTER',
    alignLeft: 'LEFT',
    alignRight: 'RIGHT',
    fullscreenEnvironment: 'FULLSCREEN READING ENVIRONMENT',
    keepScreenAwake: 'Keep Screen Awake',
    keepScreenAwakeSub: 'Prevents screen from sleeping or dimming during presentations',
    readingGuideStyle: 'Reading Guide Style',
    readingGuidePosition: 'Reading Guide Position',
    guideWindow: 'WINDOW',
    guideLine: 'LINE',
    guideHighlight: 'HIGHLIGHT',
    guideNone: 'NONE',

    speechPacing: 'SPEECH RECOGNITION PACING',
    enableVoiceFollow: 'Enable Voice Follow',
    enableVoiceFollowSub: 'Automatically scrolls the teleprompter as you speak your script',
    voiceSensitivity: 'Voice Follow Sensitivity',
    speechLanguage: 'Speech Recognition Language',
    speechLanguageSub: 'Choose the spoken language for voice tracking',
    hindiIndia: 'हिंदी (भारत) - Hindi',
    englishUS: 'English (US)',
    englishIndia: 'English (India)',
    privacyMicPolicy: 'Privacy & Microphone Policy',
    privacyMicDesc: 'CueFlow processes microphone audio purely in real time to match spoken words against your script. No recordings are saved, stored, or sent to any server.',

    floatingOverlay: 'ANDROID FLOATING OVERLAY',
    floatingWidth: 'Floating Window Width',
    floatingHeight: 'Floating Window Height',
    floatingOpacity: 'Floating Window Opacity',
    floatingTextSize: 'Floating Text Size',
    launchFloatingTest: 'Launch Test Floating Teleprompter ⧉',
    floatingHelp: 'Drag the ↘ corner handle to freely resize the floating window to your choice!',

    appInformation: 'APP INFORMATION',
    appVersion: 'Version 1.0.0 (Production Release)',
    appDesc: 'A complete, clean, utility-grade Android teleprompter built for presentations, speeches, online lectures, and video recording with external camera setups.',
    ourCorePromises: 'OUR CORE PROMISES',
    freeAndAdFree: 'Completely Free & Ad-Free',
    freeAndAdFreeSub: 'No advertisements, no subscriptions, no paywalls, and no locked features.',
    localStorage: '100% Local Storage',
    localStorageSub: 'All scripts are saved directly on your device storage. We have no servers, no user accounts, and no cloud tracking.',
    noCameraPerm: 'No Camera Permissions',
    noCameraPermSub: 'The app never accesses your device camera. Designed for reading presentations and recording via your favorite camera app or external hardware.',
  },

  hi: {
    appName: 'क्यूफ़्लो (CueFlow)',
    tagline: 'टेलीप्रॉम्प्टर',
    save: 'सहेजें',
    saved: 'सहेजा गया',
    cancel: 'रद्द करें',
    reset: 'रीसेट',
    edit: 'संपादित करें',
    copy: 'कॉपी करें',
    delete: 'हटाएं',
    back: 'वापस',
    done: 'पूर्ण',
    play: 'चलाएं',
    pause: 'रोकें',
    float: 'फ़्लोटिंग',
    prompt: 'प्रॉम्प्ट ▶',
    settings: 'सेटिंग्स',
    words: 'शब्द',
    minutes: 'मिनट',
    seconds: 'सेकंड',
    clear: 'साफ़ करें',

    newScript: '+ नई स्क्रिप्ट',
    searchPlaceholder: 'शीर्षक या टेक्स्ट से स्क्रिप्ट खोजें...',
    noScriptsTitle: 'कोई स्क्रिप्ट नहीं मिली',
    noScriptsSub: 'अपना पहला भाषण या प्रस्तुति लिखने के लिए + नई स्क्रिप्ट पर टैप करें।',
    noMatchingScripts: 'कोई परिणाम नहीं मिला',
    noMatchingScriptsSub: 'किसी अन्य कीवर्ड से खोजें या खोज क्वेरी हटाएं।',
    clearSearch: 'खोज साफ़ करें',
    createScriptBtn: '+ पहली स्क्रिप्ट बनाएं',
    resetSampleBtn: 'नमूना स्क्रिप्ट पुनः लोड करें',
    deleteConfirmTitle: 'स्क्रिप्ट हटाएं',
    deleteConfirmMsg: 'क्या आप वाकई इस स्क्रिप्ट को हमेशा के लिए हटाना चाहते हैं?',

    editorTitle: 'स्क्रिप्ट संपादक',
    scriptTitlePlaceholder: 'स्क्रिप्ट का शीर्षक...',
    scriptBodyPlaceholder: 'अपनी स्क्रिप्ट यहाँ लिखें या पेस्ट करें...\n\nसुझाव: स्वाभाविक ठहराव के लिए जहाँ आवश्यक हो खाली पंक्तियाँ छोड़ें।',
    importTextFile: '📂 फ़ाइल आयात',
    exportBtn: '💾 निर्यात',
    monoFont: '🔤 मोनो',
    hindiSampleBtn: '🇮🇳 हिंदी नमूना',
    englishSampleBtn: '📑 English Sample',
    loadHindiSample: 'हिंदी नमूना लोड करें',
    loadEnglishSample: 'अंग्रेजी नमूना लोड करें',
    saveChanges: 'स्क्रिप्ट सहेजें',
    saveAsNew: 'नई प्रति के रूप में सहेजें',
    clearAll: '🗑 साफ़ करें',
    wordsLabel: 'शब्द:',
    charsLabel: 'अक्षर:',
    estReadingLabel: 'अनुमानित समय:',

    tabReading: 'रीडिंग',
    tabLook: 'रूप व रंग',
    tabStage: 'मंच / स्टेज',
    tabVoice: 'वॉइस फॉलो',
    tabPrivacy: 'गोपनीयता',

    languageSection: 'भाषा / APP LANGUAGE',
    appLanguage: 'ऐप की भाषा (Language)',
    resetConfirmTitle: 'सेटिंग्स रीसेट करें',
    resetConfirmMsg: 'क्या आप सभी रीडिंग, रूप और स्टेज सेटिंग्स को डिफ़ॉल्ट पर रीसेट करना चाहते हैं?',
    scrollingAndPacing: 'स्क्रॉलिंग और गति',
    scrollingSpeed: 'स्क्रॉलिंग गति',
    countdownBeforePlayback: 'शुरू होने से पहले उल्टी गिनती',
    blankLinePauseDuration: 'खाली लाइन पर ठहराव की अवधि',
    reverseScrolling: 'उल्टा स्क्रॉल',
    reverseScrollingSub: 'नीचे के बजाय ऊपर की ओर स्क्रॉल करें',
    typographyAndMargins: 'फ़ॉन्ट और मार्जिन',
    textSize: 'टेक्स्ट का आकार',
    lineHeight: 'पंक्ति की ऊँचाई',
    letterSpacing: 'अक्षरों के बीच स्थान',
    sideMargins: 'किनारे के मार्जिन',
    readingWidth: 'पढ़ने की चौड़ाई',
    themeAndColor: 'थीम और रंग',
    themeMode: 'थीम मोड',
    lightTheme: '☀ लाइट थीम',
    darkTheme: '🌙 डार्क थीम',
    mirrorMode: 'मिरर मोड (दर्पण)',
    mirrorModeSub: 'टेलीप्रॉम्प्टर ग्लास रिग के लिए टेक्स्ट को क्षैतिज रूप से उलटता है',
    fontAndAlignment: 'फ़ॉन्ट और संरेखण',
    fontStyle: 'फ़ॉन्ट शैली',
    fontModern: 'आधुनिक',
    fontMono: 'मोनो',
    fontSerif: 'सेरिफ़',
    textAlignment: 'टेक्स्ट संरेखण',
    alignCenter: 'मध्य (CENTER)',
    alignLeft: 'बाएं (LEFT)',
    alignRight: 'दाएं (RIGHT)',
    fullscreenEnvironment: 'फ़ुलस्क्रीन वाचन वातावरण',
    keepScreenAwake: 'स्क्रीन हमेशा चालू रखें',
    keepScreenAwakeSub: 'प्रस्तुति के दौरान स्क्रीन को बंद या धुंधला होने से रोकता है',
    readingGuideStyle: 'रीडिंग गाइड शैली',
    readingGuidePosition: 'रीडिंग गाइड स्थिति',
    guideWindow: 'विंडो (WINDOW)',
    guideLine: 'लाइन (LINE)',
    guideHighlight: 'हाइलाइट',
    guideNone: 'कोई नहीं',

    speechPacing: 'आवाज़ पहचान और वॉइस फॉलो',
    enableVoiceFollow: 'वॉइस फॉलो सक्षम करें',
    enableVoiceFollowSub: 'जैसे ही आप बोलेंगे, टेलीप्रॉम्प्टर अपने आप आगे बढ़ेगा',
    voiceSensitivity: 'वॉइस फॉलो संवेदनशीलता',
    speechLanguage: 'बोलने की पहचान भाषा',
    speechLanguageSub: 'वॉइस ट्रैकिंग के लिए बोली जाने वाली भाषा चुनें',
    hindiIndia: 'हिंदी (भारत) - Hindi',
    englishUS: 'English (US)',
    englishIndia: 'English (India)',
    privacyMicPolicy: 'गोपनीयता और माइक्रोफ़ोन नीति',
    privacyMicDesc: 'CueFlow केवल आपकी आवाज़ को आपकी स्क्रिप्ट से मिलाने के लिए वास्तविक समय में माइक्रोफ़ोन का उपयोग करता है। कोई भी रिकॉर्डिंग सहेजी या किसी सर्वर पर नहीं भेजी जाती।',

    floatingOverlay: 'एंड्रॉइड फ़्लोटिंग विंडो',
    floatingWidth: 'फ़्लोटिंग विंडो की चौड़ाई',
    floatingHeight: 'फ़्लोटिंग विंडो की ऊँचाई',
    floatingOpacity: 'फ़्लोटिंग विंडो की पारदर्शिता',
    floatingTextSize: 'फ़्लोटिंग टेक्स्ट का आकार',
    launchFloatingTest: 'टेस्ट फ़्लोटिंग टेलीप्रॉम्प्टर खोलें ⧉',
    floatingHelp: 'फ़्लोटिंग विंडो को अपनी पसंद के अनुसार छोटा-बड़ा करने के लिए नीचे-दाएं कोने ↘ को खींचें!',

    appInformation: 'ऐप की जानकारी',
    appVersion: 'संस्करण 1.0.0 (रिलीज़ संस्करण)',
    appDesc: 'प्रस्तुतियों, भाषणों, ऑनलाइन व्याख्यानों और वीडियो रिकॉर्डिंग के लिए बनाया गया एक संपूर्ण, स्वच्छ और उपयोगी एंड्रॉइड टेलीप्रॉम्प्टर।',
    ourCorePromises: 'हमारी मुख्य प्रतिबद्धताएं',
    freeAndAdFree: 'पूरी तरह से मुफ़्त और विज्ञापन-मुक्त',
    freeAndAdFreeSub: 'कोई विज्ञापन नहीं, कोई सदस्यता नहीं, कोई भुगतान नहीं, और कोई बंद सुविधाएँ नहीं।',
    localStorage: '100% स्थानीय संग्रहण',
    localStorageSub: 'सभी स्क्रिप्ट सीधे आपके डिवाइस में सहेजी जाती हैं। कोई सर्वर नहीं, कोई खाता नहीं, कोई ट्रैकिंग नहीं।',
    noCameraPerm: 'कैमरा अनुमति की आवश्यकता नहीं',
    noCameraPermSub: 'यह ऐप कभी भी आपके कैमरे का उपयोग नहीं करता। इसे प्रस्तुतियों को पढ़ने और बाहरी कैमरे से रिकॉर्ड करने के लिए बनाया गया है।',
  },
};
