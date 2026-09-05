import { VoiceLanguage } from '../utils/speechHelper';

export interface ConsentSection {
  id: number;
  title: string;
  content: string;
  keyPoints: string[];
}

export interface StudyConsentContent {
  studyTitle: string;
  studyCode: string;
  ethicsApproval: string;
  institution: string;
  leadInvestigator: string;
  supervisor: string;
  sections: ConsentSection[];
  declarations: string[];
}

export const ROBINIA_STUDY_DATA: Record<VoiceLanguage, StudyConsentContent> = {
  English: {
    studyTitle:
      'TO STUDY OF EFFECTIVENESS OF ROBINIA 30 IN MANAGEMENT OF GASTRITIS IN AGE GROUP 20 YEARS AND ABOVE IN BOTH GENDERS - A CASE SERIES STUDY',
    studyCode: 'IEC/PGH-HOM/2026/CS-04',
    ethicsApproval: 'Institutional Ethics Committee Reg. No. ECR/942/Inst/MH/2023/RR-26',
    institution: 'City Post Graduate Homoeopathic & Allopathic Medical College & Hospital',
    leadInvestigator: 'Dr. Rahul S. Kulkarni (PG Scholar)',
    supervisor: 'Dr. Sunita Deshmukh, MD (Hom) (Professor & Guide)',
    sections: [
      {
        id: 1,
        title: '1. Title & Institutional Identification',
        content:
          'This clinical study is conducted under the Department of Homoeopathic Materia Medica at City Post Graduate Homoeopathic & Allopathic Medical College & Hospital, approved by the Institutional Ethics Committee.',
        keyPoints: ['Academic Case Series Study', 'Ethics Committee Clearance No: ECR/942', 'Institutional protocol'],
      },
      {
        id: 2,
        title: '2. Nature & Clinical Purpose of Study',
        content:
          'The purpose is to evaluate the therapeutic efficacy of potentized homeopathic remedy Robinia Pseudacacia 30 in relieving hyperacidity, sour eructations, epigastric burning, frontal headache, and associated symptoms of acute or chronic gastritis in adults aged 20 years and above.',
        keyPoints: ['Aimed at adult patients (20+ yrs)', 'Focus on hyperacidity & gastric burning', 'Holistic symptom scoring'],
      },
      {
        id: 3,
        title: '3. Vernacular Explanation & Accessibility',
        content:
          'The complete procedure, potential benefits, and nature of the homeopathic preparation have been explained in the patient\'s mother tongue (English, Hindi, or Marathi). The patient has been given ample opportunity to clarify questions.',
        keyPoints: ['Explained in mother tongue', 'Opportunity to ask questions', 'Full transparency'],
      },
      {
        id: 4,
        title: '4. Voluntary Participation & Right to Withdraw',
        content:
          'Participation in this case series is purely voluntary. Refusal or withdrawal of consent at any point will not affect regular medical treatment, emergency care, or rights at this institution in any manner.',
        keyPoints: ['100% Voluntary', 'Can withdraw anytime without penalty', 'Standard care preserved'],
      },
      {
        id: 5,
        title: '5. Study Procedure & Dosage Protocol',
        content:
          'The patient will receive prescribed homeopathic doses of Robinia 30 (globules or liquid dilution) according to organon principles. Follow-up reviews will be scheduled at weekly or bi-weekly intervals to track symptomatic improvement.',
        keyPoints: ['Robinia 30 administration', 'Regular OPD follow-up visits', 'Standard homeopathic dispensing'],
      },
      {
        id: 6,
        title: '6. Baseline Diagnostics & Laboratory Investigations',
        content:
          'Standard diagnostic evaluations including Complete Blood Count (CBC), Fasting Blood Sugar, Helicobacter pylori serology/antigen, or abdominal ultrasonography may be requested to establish objective clinical correlation.',
        keyPoints: ['Routine baseline tests', 'H. pylori / Ultrasound if needed', 'Objective medical records'],
      },
      {
        id: 7,
        title: '7. Confidentiality & Data Privacy (ABDM / DISHA)',
        content:
          'All personal health data, case records, and demographic details will be stored securely in compliance with the Ayushman Bharat Digital Mission (ABDM) and national health data security regulations. Identities will be anonymized in publications.',
        keyPoints: ['Strict patient privacy', 'Data anonymization in research', 'ABDM digital standards'],
      },
      {
        id: 8,
        title: '8. Clinical Documentation & Scientific Photography',
        content:
          'Anonymized medical photographs (such as tongue coating, diagnostic scan reports) may be captured strictly for clinical monitoring and scientific dissemination. Facial identities will not be exposed without specific additional consent.',
        keyPoints: ['Anonymized clinical photography', 'For scientific documentation only', 'Face masked unless permitted'],
      },
      {
        id: 9,
        title: '9. Patient Responsibilities & Dietary Guidelines',
        content:
          'The patient agrees to follow prescribed dietary restrictions (avoiding excessive raw spices, coffee, tobacco, and irregular meal intervals), maintain regular intake of remedies, and promptly report any unexpected changes.',
        keyPoints: ['Adherence to diet guidance', 'Avoid stimulants during treatment', 'Prompt reporting of changes'],
      },
      {
        id: 10,
        title: '10. Ethics Committee Oversight & Contact Information',
        content:
          'For any inquiries regarding patient rights, study ethics, or reporting adverse sensations, patients may contact the Institutional Ethics Committee Secretary or the hospital superintendent at +91 22 2548 9900.',
        keyPoints: ['Ethics Committee contact available', 'Direct hospital line: +91 22 2548 9900', 'Independent patient advocate'],
      },
    ],
    declarations: [
      'I confirm that I have read and understood the study information sheet provided above.',
      'The purpose, procedures, benefits, and voluntary nature have been explained to me in a language I understand.',
      'I have had an opportunity to ask questions and all queries were resolved to my satisfaction.',
      'I freely give my informed written consent to participate in this Robinia 30 gastritis clinical case study.',
    ],
  },
  Hindi: {
    studyTitle:
      '२० वर्ष और उससे अधिक आयु वर्ग के पुरुषों और महिलाओं में गैस्ट्र्रिटिस के प्रबंधन में रोबिनिया ३० की प्रभावशीलता का अध्ययन - एक केस सीरीज़ अध्ययन',
    studyCode: 'IEC/PGH-HOM/2026/CS-04',
    ethicsApproval: 'संस्थागत नीतिशास्त्र समिति पंजीकरण सं. ECR/942/Inst/MH/2023/RR-26',
    institution: 'सिटी पोस्ट ग्रॅज्युएट होमिओपॅथिक व ॲलोपॅथिक मेडिकल कॉलेज आणि रुग्णालय',
    leadInvestigator: 'डॉ. राहुल एस. कुलकर्णी (पीजी स्कॉलर)',
    supervisor: 'डॉ. सुनीता देशमुख, एमडी (होम) (प्राध्यापक व मार्गदर्शक)',
    sections: [
      {
        id: 1,
        title: '१. शीर्षक एवं संस्थागत पहचान',
        content:
          'यह नैदानिक ​​अध्ययन संस्थागत नीतिशास्त्र समिति द्वारा अनुमोदित सिटी पोस्ट ग्रॅज्युएट होमिओपॅथिक व ॲलोपॅथिक मेडिकल कॉलेज और अस्पताल के होमिओपॅथिक मटेरिया मेडिका विभाग के अंतर्गत संचालित है।',
        keyPoints: ['अकादमिक केस सीरीज़ अध्ययन', 'नीतिशास्त्र समिति अनुमोदन सं: ECR/942', 'मान्यताप्राप्त संस्थागत प्रोटोकॉल'],
      },
      {
        id: 2,
        title: '२. अध्ययन का स्वरूप एवं नैदानिक उद्देश्य',
        content:
          'इस अध्ययन का उद्देश्य २० वर्ष और उससे अधिक उम्र के वयस्कों में तीव्र या पुराने गैस्ट्र्रिटिस (पेट में जलन, खट्टी डकारें, सीने में जलन, सिरदर्द) के लक्षणों में होमिओपैथिक औषधि रोबिनिया ३० की उपचारात्मक प्रभावशीलता का वैज्ञानिक मूल्यांकन करना है।',
        keyPoints: ['वयस्क मरीजों (२०+ वर्ष) के लिए', 'अम्लता और पेट में जलन पर ध्यान', 'समग्र लक्षण सुधार'],
      },
      {
        id: 3,
        title: '३. मातृभाषा में स्पष्टीकरण एवं समझ',
        content:
          'संपूर्ण उपचार प्रक्रिया, संभावित लाभ तथा होम्योपैथिक दवा के स्वरूप को मरीज की मातृभाषा (हिंदी / मराठी / अंग्रेजी) में विस्तार से समझाया गया है, जिसे मरीज ने भली-भांति समझ लिया है।',
        keyPoints: ['मातृभाषा में पूर्ण जानकारी', 'प्रश्न पूछने की स्वतंत्रता', 'पारदर्शी संवाद'],
      },
      {
        id: 4,
        title: '४. स्वैच्छिक सहभागिता एवं नाम वापसी का अधिकार',
        content:
          'इस अध्ययन में भाग लेना पूर्णतः स्वैच्छिक है। यदि कोई मरीज किसी भी समय अपनी सहमति वापस लेता है, तो अस्पताल में उसके सामान्य इलाज या अधिकारों पर कोई प्रतिकूल प्रभाव नहीं पड़ेगा।',
        keyPoints: ['१००% स्वैच्छिक', 'बिना किसी दंड के वापसी संभव', 'नियमित उपचार सुरक्षित'],
      },
      {
        id: 5,
        title: '५. अध्ययन प्रक्रिया एवं खुराक प्रोटोकॉल',
        content:
          'योग्य डॉक्टरों की देखरेख में रोबिनिया ३० की निर्धारित खुराक दी जाएगी। लक्षणों में सुधार की प्रगति का आकलन करने के लिए मरीज को निर्धारित अंतरालों पर ओपीडी फॉलो-अप के लिए आना होगा।',
        keyPoints: ['रोबिनिया ३० का नियमित सेवन', 'समय पर ओपीडी फॉलो-अप', 'प्रमाणित खुराक नियम'],
      },
      {
        id: 6,
        title: '६. बुनियादी नैदानिक एवं प्रयोगशाला जांच',
        content:
          'नैदानिक पुष्टि के लिए आवश्यकतानुसार नियमित रक्त जांच (सीबीसी), फास्टिंग ब्लड शुगर, एच. पायलोरी जांच अथवा पेट की सोनोग्राफी की जा सकती है।',
        keyPoints: ['नियमित रक्त जांच', 'एच. पायलोरी / सोनोग्राफी जरूरत पड़ने पर', 'वैज्ञानिक रिकॉर्ड'],
      },
      {
        id: 7,
        title: '७. गोपनीयता एवं डेटा सुरक्षा (ABDM / DISHA)',
        content:
          'मरीज के सभी स्वास्थ्य रिकॉर्ड और व्यक्तिगत विवरण राष्ट्रीय स्वास्थ्य प्राधिकरण (ABDM) के डिजिटल मानकों के अनुसार पूर्णतः गोपनीय रखे जाएंगे। शोध प्रकाशन में नाम गुप्त रहेगा।',
        keyPoints: ['पूर्ण डेटा गोपनीयता', 'शोध में नाम गुप्त', 'ABDM डिजिटल सुरक्षा'],
      },
      {
        id: 8,
        title: '८. नैदानिक प्रलेखन एवं वैज्ञानिक छायाचित्रण',
        content:
          'जीभ की स्थिति अथवा स्कैन रिपोर्ट के अनाम फोटो केवल नैदानिक तुलना और वैज्ञानिक अध्ययन के लिए उपयोग किए जा सकते हैं। चेहरे की पहचान उजागर नहीं की जाएगी।',
        keyPoints: ['अनाम नैदानिक तस्वीरें', 'केवल वैज्ञानिक उद्देश्य', 'चेहरा पूरी तरह सुरक्षित'],
      },
      {
        id: 9,
        title: '९. मरीज की जिम्मेदारियां एवं आहार नियम',
        content:
          'मरीज को डॉक्टर द्वारा निर्देशित आहार नियमों का पालन करना होगा (जैसे अत्यधिक मिर्च-मसाले, चाय-कॉफी, तंबाकू से परहेज) और दवा नियमित रूप से लेनी होगी।',
        keyPoints: ['आहार नियमों का पालन', 'उत्तेजक पदार्थों से परहेज', 'नियमित दवा सेवन'],
      },
      {
        id: 10,
        title: '१०. नीतिशास्त्र समिति संपर्क विवरण',
        content:
          'मरीज के अधिकारों या अध्ययन से जुड़े किसी भी प्रश्न के लिए अस्पताल की नीतिशास्त्र समिति या अस्पताल अधीक्षक से +91 22 2548 9900 पर संपर्क किया जा सकता है।',
        keyPoints: ['नीतिशास्त्र समिति संपर्क उपलब्ध', 'सीधा फोन: +91 22 2548 9900', 'मरीज सहायता डेस्क'],
      },
    ],
    declarations: [
      'मैं पुष्टि करता/करती हूँ कि मैंने ऊपर दी गई अध्ययन सूचना पत्रक को ध्यानपूर्वक पढ़ और समझ लिया है।',
      'अध्ययन के उद्देश्य, प्रक्रिया और स्वैच्छिक स्वरूप मुझे मेरी समझ आने वाली भाषा में समझाए गए हैं।',
      'मुझे प्रश्न पूछने का पूरा अवसर मिला और मेरे सभी प्रश्नों का संतोषजनक समाधान हुआ।',
      'मैं अपनी स्वतंत्र इच्छा से इस रोबिनिया ३० गैस्ट्र्रिटिस अध्ययन में शामिल होने की लिखित सहमति देता/देती हूँ।',
    ],
  },
  Marathi: {
    studyTitle:
      '२० वर्षे व त्यावरील वयोगटातील पुरुष व महिलांमधील जठरदाह (गॅस्ट्र्रिटिस) उपचारात रॉबिनिया ३० च्या परिणामकारकतेचा अभ्यास - केस सिरीज अभ्यास',
    studyCode: 'IEC/PGH-HOM/2026/CS-04',
    ethicsApproval: 'संस्थात्मक नैतिकता समिती नोंदणी क्र. ECR/942/Inst/MH/2023/RR-26',
    institution: 'सिटी पोस्ट ग्रॅज्युएट होमिओपॅथिक व ॲलोपॅथिक वैद्यकीय महाविद्यालय आणि रुग्णालय',
    leadInvestigator: 'डॉ. राहुल एस. कुलकर्णी (पीजी स्कॉलर)',
    supervisor: 'डॉ. सुनिता देशमुख, एमडी (होम) (प्राध्यापिका व मार्गदर्शक)',
    sections: [
      {
        id: 1,
        title: '१. शीर्षक व संस्थात्मक ओळख',
        content:
          'हा नैदानिक अभ्यास संस्थात्मक नैतिकता समितीच्या मान्यतेने सिटी पोस्ट ग्रॅज्युएट होमिओपॅथिक व ॲलोपॅथिक वैद्यकीय महाविद्यालय व रुग्णालयाच्या होमिओपॅथिक मटेरिया मेडिका विभागांतर्गत आयोजित केला आहे.',
        keyPoints: ['शैक्षणिक केस सिरीज अभ्यास', 'नैतिकता समिती मान्यता क्र: ECR/942', 'मान्यताप्राप्त संस्थात्मक प्रोटोकॉल'],
      },
      {
        id: 2,
        title: '२. अभ्यासाचे स्वरूप व वैद्यकीय उद्दिष्ट',
        content:
          '२० वर्षे व त्यावरील वयोगटातील रुग्णांमध्ये तीव्र अथवा जुनाट जठरदाह (अ‍ॅसिडिटी, छातीत जळजळ, आंबट ढेकर, डोकेदुखी) या लक्षणांवर होमिओपॅथिक औषध रॉबिनिया ३० ची उपचारात्मक परिणामकारकता तपासणे हे या अभ्यासाचे उद्दिष्ट आहे.',
        keyPoints: ['२०+ वयाच्या प्रौढ रुग्णांसाठी', 'अ‍ॅसिडिटी व पोटदुखीवर लक्ष', 'लक्षणांचे पद्धतशीर मूल्यमापन'],
      },
      {
        id: 3,
        title: '३. स्थानिक भाषेत स्पष्टीकरण व आकलन',
        content:
          'उपचाराची संपूर्ण प्रक्रिया, संभाव्य फायदे व होमिओपॅथिक औषधाचे स्वरूप रुग्णाला त्याच्या मातृभाषेत (मराठी / हिंदी / इंग्रजी) सविस्तर समजावून सांगण्यात आले असून रुग्णाने ते पूर्णपणे समजून घेतले आहे.',
        keyPoints: ['मातृभाषेत पूर्ण माहिती', 'प्रश्न विचारण्याची पूर्ण मुभा', 'पारदर्शक संवाद'],
      },
      {
        id: 4,
        title: '४. ऐच्छिक सहभाग व माघार घेण्याचा अधिकार',
        content:
          'या अभ्यासातील सहभाग पूर्णपणे ऐच्छिक आहे. रुग्णाने कोणत्याही टप्प्यावर आपली संमती मागे घेतल्यास, रुग्णालयातील त्याच्या नियमित उपचारांवर किंवा हक्कांवर कोणताही परिणाम होणार नाही.',
        keyPoints: ['१००% ऐच्छिक', 'कधीही माघार घेता येते', 'नियमित उपचार अबाधित'],
      },
      {
        id: 5,
        title: '५. अभ्यास पद्धती व डोस प्रोटोकॉल',
        content:
          'तज्ज्ञ डॉक्टरांच्या मार्गदर्शनाखाली रॉबिनिया ३० चा नियमित डोस दिला जाईल. लक्षणांमधील सुधारणा तपासण्यासाठी ठरवून दिलेल्या तारखांना ओपीडी तपासणीसाठी हजर राहणे आवश्यक आहे.',
        keyPoints: ['रॉबिनिया ३० चे नियमित सेवन', 'ओपीडी नियमित फॉलो-अप', 'प्रमाणित होमिओपॅथिक पद्धत'],
      },
      {
        id: 6,
        title: '६. मूलभूत तपासण्या व प्रयोगशाळा चाचण्या',
        content:
          'वस्तुनिष्ठ वैद्यकीय नोंदीसाठी आवश्यकतेनुसार रक्त तपासणी (सीबीसी), फास्टिंग ब्लड शुगर, एच. पायलोरी चाचणी किंवा पोटाची सोनोग्राफी तपासणी केली जाऊ शकते.',
        keyPoints: ['नियमित रक्त चाचण्या', 'एच. पायलोरी / सोनोग्राफी गरज असल्यास', 'वस्तुनिष्ठ वैद्यकीय नोंदी'],
      },
      {
        id: 7,
        title: '७. गोपनीयता व डेटा सुरक्षा (ABDM / DISHA)',
        content:
          'रुग्णाची सर्व आरोग्य माहिती व वैयक्तिक नोंदी राष्ट्रीय डिजिटल आरोग्य अभियानाच्या (ABDM) नियमांनुसार पूर्ण गोपनीय ठेवल्या जातील. संशोधन प्रकाशनामध्ये ओळख गुप्त ठेवली जाईल.',
        keyPoints: ['पूर्ण माहिती गोपनीयता', 'संशोधनात नाव गुप्त', 'ABDM डिजिटल सुरक्षितता'],
      },
      {
        id: 8,
        title: '८. वैद्यकीय नोंदी व वैज्ञानिक छायाचित्रे',
        content:
          'जिभेची स्थिती किंवा वैद्यकीय तपासणी अहवालांची छायाचित्रे केवळ वैज्ञानिक अभ्यासासाठी वापरली जाऊ शकतात. रुग्णाचा चेहरा कधीही उघड केला जाणार नाही.',
        keyPoints: ['नावविरहित वैद्यकीय छायाचित्रे', 'केवळ वैज्ञानिक कारणासाठी', 'चेहरा सुरक्षित'],
      },
      {
        id: 9,
        title: '९. रुग्णाच्या जबाबदाऱ्या व पथ्य नियम',
        content:
          'रुग्णाने डॉक्टरांनी सांगितलेल्या पथ्य नियमांचे काटेकोर पालन करणे (अति तिखट, चहा, कॉफी, तंबाखू वर्ज्य करणे) आणि औषध नियमितपणे घेणे बंधनकारक आहे.',
        keyPoints: ['पथ्य नियमांचे काटेकोर पालन', 'उत्तेजक पेये वर्ज्य करणे', 'औषध वेळेवर घेणे'],
      },
      {
        id: 10,
        title: '१०. नैतिकता समिती संपर्क माहिती',
        content:
          'रुग्ण हक्क अथवा अभ्यासाबाबत काही शंका असल्यास रुग्ण संस्थेच्या नैतिकता समिती सचिव किंवा रुग्णालय प्रमुखांशी +91 22 2548 9900 वर संपर्क साधू शकतात.',
        keyPoints: ['नैतिकता समिती संपर्क उपलब्ध', 'थेट फोन: +91 22 2548 9900', 'रुग्ण साहाय्य कक्ष'],
      },
    ],
    declarations: [
      'मी खात्री देतो/देते की वरील माहिती पत्रक मी काळजीपूर्वक वाचले व समजून घेतले आहे.',
      'अभ्यासाचे स्वरूप, कार्यपद्धती आणि ऐच्छिक सहभाग मला समजणाऱ्या भाषेत स्पष्ट करण्यात आला आहे.',
      'मला प्रश्न विचारण्याची पूर्ण संधी मिळाली व माझ्या शंकांचे समाधान झाले आहे.',
      'मी माझ्या स्वतःच्या इच्छेने या रॉबिनिया ३० गॅस्ट्र्रिटिस संशोधन अभ्यासात सहभागी होण्याची लेखी संमती देत आहे.',
    ],
  },
};
