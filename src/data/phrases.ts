/**
 * A travel phrasebook: the things you most often need to say in France.
 * French uses the polite "vous" form throughout, which is right with strangers, staff and officials.
 * `say` is a rough English-sound guide; CAPS mark the stressed syllable (French stresses the last one).
 */

export interface Phrase {
  id: string
  en: string
  fr: string
  say: string
  /** Extra context, e.g. which form a woman uses. */
  note?: string
}

export interface Category {
  id: string
  name: string
  emoji: string
  phrases: Phrase[]
}

export const CATEGORIES: Category[] = [
  {
    id: 'basics', name: 'Basics', emoji: '👋', phrases: [
      { id: 'hello', en: 'Hello / Good morning', fr: 'Bonjour', say: 'bohn-ZHOOR', note: 'Always say it when you walk into a shop or café.' },
      { id: 'good-evening', en: 'Good evening', fr: 'Bonsoir', say: 'bohn-SWAHR' },
      { id: 'goodbye', en: 'Goodbye', fr: 'Au revoir', say: 'oh ruh-VWAHR' },
      { id: 'please', en: 'Please', fr: "S'il vous plaît", say: 'seel voo PLEH' },
      { id: 'thanks', en: 'Thank you very much', fr: 'Merci beaucoup', say: 'mehr-SEE boh-KOO' },
      { id: 'welcome', en: "You're welcome", fr: 'De rien', say: 'duh RYAN' },
      { id: 'yes-no', en: 'Yes / No', fr: 'Oui / Non', say: 'WEE / NOHN' },
      { id: 'excuse-me', en: 'Excuse me (to get attention)', fr: 'Excusez-moi', say: 'ex-kew-zay MWAH' },
      { id: 'sorry', en: 'Sorry / Pardon me', fr: 'Pardon', say: 'par-DOHN' },
      { id: 'speak-english', en: 'Do you speak English?', fr: 'Parlez-vous anglais ?', say: 'par-lay voo ahn-GLEH' },
      { id: 'dont-understand', en: "I don't understand", fr: 'Je ne comprends pas', say: 'zhuh nuh kohm-prahn PAH' },
      { id: 'little-french', en: 'I speak a little French', fr: 'Je parle un peu français', say: 'zhuh parl uhn puh frahn-SEH' },
      { id: 'slowly', en: 'Could you speak more slowly?', fr: 'Pourriez-vous parler plus lentement ?', say: 'poo-ree-ay voo par-lay plew lahnt-MAHN' },
      { id: 'repeat', en: 'Could you repeat that, please?', fr: "Pouvez-vous répéter, s'il vous plaît ?", say: 'poo-vay voo ray-pay-TAY, seel voo PLEH' },
      { id: 'my-name', en: 'My name is…', fr: "Je m'appelle…", say: 'zhuh mah-PELL' },
    ],
  },
  {
    id: 'around', name: 'Getting around', emoji: '🚆', phrases: [
      { id: 'where-is', en: 'Where is…?', fr: 'Où est… ?', say: 'oo EH' },
      { id: 'station', en: 'Where is the train station?', fr: 'Où est la gare ?', say: 'oo eh lah GAR' },
      { id: 'metro', en: 'Where is the metro?', fr: 'Où est le métro ?', say: 'oo eh luh may-TROH' },
      { id: 'toilets', en: 'Where are the restrooms?', fr: 'Où sont les toilettes ?', say: 'oo sohn lay twah-LET' },
      { id: 'how-get', en: 'How do I get to…?', fr: 'Comment aller à… ?', say: 'koh-mahn tah-LAY ah' },
      { id: 'far', en: 'Is it far?', fr: "C'est loin ?", say: 'seh LWAN' },
      { id: 'ticket', en: 'A ticket to…, please', fr: "Un billet pour…, s'il vous plaît", say: 'uhn bee-YEH poor…, seel voo PLEH' },
      { id: 'train-time', en: 'What time does the train leave?', fr: 'À quelle heure part le train ?', say: 'ah kel UR par luh TRAN' },
      { id: 'platform', en: 'Which platform?', fr: 'Quel quai ?', say: 'kel KAY' },
      { id: 'directions', en: 'Left / Right / Straight ahead', fr: 'À gauche / À droite / Tout droit', say: 'ah GOHSH / ah DRWAHT / too DRWAH' },
      { id: 'taxi', en: 'Could you call me a taxi?', fr: "Pouvez-vous m'appeler un taxi ?", say: 'poo-vay voo mah-PLAY uhn tak-SEE' },
      { id: 'address', en: 'To this address, please', fr: "À cette adresse, s'il vous plaît", say: 'ah set ah-DRESS, seel voo PLEH' },
    ],
  },
  {
    id: 'food', name: 'Food & drink', emoji: '🥐', phrases: [
      { id: 'table', en: 'A table for two, please', fr: "Une table pour deux, s'il vous plaît", say: 'ewn TAH-bluh poor DUH, seel voo PLEH' },
      { id: 'menu', en: 'The menu, please', fr: "La carte, s'il vous plaît", say: 'lah KART, seel voo PLEH' },
      { id: 'would-like', en: "I'd like…", fr: 'Je voudrais…', say: 'zhuh voo-DREH' },
      { id: 'coffee', en: 'A coffee, please', fr: "Un café, s'il vous plaît", say: 'uhn kah-FAY, seel voo PLEH', note: 'This gets you an espresso. For a big milky one, ask for "un café crème".' },
      { id: 'water', en: 'A jug of tap water, please', fr: "Une carafe d'eau, s'il vous plaît", say: 'ewn kah-RAF DOH, seel voo PLEH', note: 'Tap water is free in restaurants.' },
      { id: 'recommend', en: 'What do you recommend?', fr: "Qu'est-ce que vous recommandez ?", say: 'kess kuh voo ruh-koh-mahn-DAY' },
      { id: 'allergic', en: "I'm allergic to…", fr: 'Je suis allergique à…', say: 'zhuh swee ah-lehr-ZHEEK ah' },
      { id: 'vegetarian', en: "I'm vegetarian", fr: 'Je suis végétarien / végétarienne', say: 'zhuh swee vay-zhay-tah-RYAN / vay-zhay-tah-RYEN', note: 'Men say végétarien, women végétarienne.' },
      { id: 'bill', en: 'The check, please', fr: "L'addition, s'il vous plaît", say: 'lah-dee-SYOHN, seel voo PLEH', note: "Waiters won't bring it until you ask." },
      { id: 'card', en: 'Can I pay by card?', fr: 'Je peux payer par carte ?', say: 'zhuh puh peh-YAY par KART' },
      { id: 'delicious', en: 'It was delicious', fr: "C'était délicieux", say: 'say-teh day-lee-SYUH' },
      { id: 'cheers', en: 'Cheers!', fr: 'Santé !', say: 'sahn-TAY' },
    ],
  },
  {
    id: 'shopping', name: 'Shopping', emoji: '🛍️', phrases: [
      { id: 'how-much', en: 'How much is it?', fr: "C'est combien ?", say: 'seh kohm-BYAN' },
      { id: 'looking', en: "I'm just looking, thanks", fr: 'Je regarde, merci', say: 'zhuh ruh-GARD, mehr-SEE' },
      { id: 'size', en: 'Do you have this in another size?', fr: "Vous l'avez dans une autre taille ?", say: 'voo lah-VAY dahn zewn oh-truh TIE' },
      { id: 'take-it', en: "I'll take it", fr: 'Je le prends', say: 'zhuh luh PRAHN' },
      { id: 'buy', en: 'Where can I buy…?', fr: 'Où est-ce que je peux acheter… ?', say: 'oo ess kuh zhuh puh ash-TAY' },
      { id: 'bag', en: 'Could I have a bag?', fr: 'Je peux avoir un sac ?', say: 'zhuh puh ah-VWAHR uhn SAK' },
      { id: 'open-closed', en: 'Open / Closed', fr: 'Ouvert / Fermé', say: 'oo-VEHR / fehr-MAY' },
    ],
  },
  {
    id: 'hotel', name: 'Hotel', emoji: '🏨', phrases: [
      { id: 'reservation', en: 'I have a reservation', fr: "J'ai une réservation", say: 'zhay ewn ray-zehr-vah-SYOHN' },
      { id: 'name-of', en: 'Under the name…', fr: 'Au nom de…', say: 'oh NOHM duh' },
      { id: 'room', en: 'Do you have a room for tonight?', fr: 'Vous avez une chambre pour ce soir ?', say: 'voo zah-vay ewn SHAHM-bruh poor suh SWAHR' },
      { id: 'breakfast', en: 'Is breakfast included?', fr: 'Le petit-déjeuner est compris ?', say: 'luh puh-tee day-zhuh-NAY eh kohm-PREE' },
      { id: 'wifi', en: "What's the Wi-Fi password?", fr: 'Quel est le code Wi-Fi ?', say: 'kel eh luh kohd wee-FEE' },
      { id: 'checkout', en: 'What time is checkout?', fr: 'À quelle heure faut-il libérer la chambre ?', say: 'ah kel UR foh-teel lee-bay-RAY lah SHAHM-bruh' },
      { id: 'luggage', en: 'Can I leave my luggage here?', fr: 'Je peux laisser mes bagages ici ?', say: 'zhuh puh leh-SAY may bah-gahzh ee-SEE' },
    ],
  },
  {
    id: 'emergency', name: 'Emergencies', emoji: '🚑', phrases: [
      { id: 'help', en: 'Help!', fr: 'Au secours !', say: 'oh suh-KOOR' },
      { id: 'police', en: 'Call the police!', fr: 'Appelez la police !', say: 'ah-PLAY lah poh-LEES', note: 'Emergency number anywhere in Europe: 112.' },
      { id: 'ambulance', en: 'Call an ambulance!', fr: 'Appelez une ambulance !', say: 'ah-PLAY ewn ahm-bew-LAHNSS' },
      { id: 'doctor', en: 'I need a doctor', fr: "J'ai besoin d'un médecin", say: 'zhay buh-ZWAN duhn mayd-SAN' },
      { id: 'pharmacy', en: 'Where is the pharmacy?', fr: 'Où est la pharmacie ?', say: 'oo eh lah far-mah-SEE', note: 'Look for the green cross.' },
      { id: 'hurts', en: 'It hurts here', fr: "J'ai mal ici", say: 'zhay MAHL ee-SEE' },
      { id: 'lost', en: "I'm lost", fr: 'Je suis perdu / perdue', say: 'zhuh swee pehr-DEW', note: 'Men say perdu, women perdue. Both sound the same.' },
      { id: 'passport', en: "I've lost my passport", fr: "J'ai perdu mon passeport", say: 'zhay pehr-dew mohn pahss-POR' },
      { id: 'urgent', en: "It's an emergency", fr: "C'est une urgence", say: 'seh tewn ewr-ZHAHNSS' },
    ],
  },
  {
    id: 'social', name: 'Small talk', emoji: '💬', phrases: [
      { id: 'nice-meet', en: 'Nice to meet you', fr: 'Enchanté / Enchantée', say: 'ahn-shahn-TAY', note: 'Men write enchanté, women enchantée. Both sound the same.' },
      { id: 'how-are-you', en: 'How are you?', fr: 'Comment allez-vous ?', say: 'koh-mahn tah-lay VOO' },
      { id: 'very-well', en: 'Very well, thank you', fr: 'Très bien, merci', say: 'treh BYAN, mehr-SEE' },
      { id: 'from-us', en: "I'm from the United States", fr: 'Je viens des États-Unis', say: 'zhuh vyan day zay-tah-zew-NEE' },
      { id: 'first-time', en: "It's my first time in France", fr: "C'est la première fois que je viens en France", say: 'seh lah pruh-myehr FWAH kuh zhuh vyan ahn FRAHNSS' },
      { id: 'nice-day', en: 'Have a nice day', fr: 'Bonne journée', say: 'bun zhoor-NAY' },
      { id: 'nice-evening', en: 'Have a nice evening', fr: 'Bonne soirée', say: 'bun swah-RAY' },
    ],
  },
]

const fold = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[’']/g, "'")

/** Phrases whose English or French contains the query (accents and case ignored), by category. */
export function searchPhrases(query: string, categories: Category[] = CATEGORIES): Category[] {
  const q = fold(query.trim())
  if (!q) return categories
  return categories
    .map(c => ({ ...c, phrases: c.phrases.filter(p => fold(p.en).includes(q) || fold(p.fr).includes(q)) }))
    .filter(c => c.phrases.length > 0)
}

/** The French to speak aloud: drop "…" placeholders so the voice doesn't read them out. */
export const spoken = (p: Phrase) => p.fr.replace(/…/g, '').trim()
