/**
 * A guide to French menus: dishes (with a photo from Wikipedia) and the words you meet on menus.
 * `match` lists the ways a menu may spell the item; matching ignores case, accents and plurals.
 * `wiki` is the English Wikipedia article whose lead photo shows the dish.
 */

export interface MenuItem {
  id: string
  kind: 'dish' | 'term'
  fr: string
  en: string
  desc: string
  match: string[]
  wiki?: string
}

const dish = (id: string, fr: string, en: string, desc: string, wiki: string, ...match: string[]): MenuItem =>
  ({ id, kind: 'dish', fr, en, desc, wiki, match: [fr, ...match] })
const term = (id: string, fr: string, en: string, desc: string, ...match: string[]): MenuItem =>
  ({ id, kind: 'term', fr, en, desc, match: [fr, ...match] })

export const MENU_ITEMS: MenuItem[] = [
  // ── Starters & soups ──
  dish('soupe-oignon', "Soupe à l'oignon", 'French onion soup', 'Slow-cooked onions in beef broth, topped with toasted bread and melted, browned cheese.', 'French onion soup', "soupe a l'oignon gratinee", "gratinee a l'oignon"),
  dish('bouillabaisse', 'Bouillabaisse', 'Provençal fish stew', 'Marseille fish and shellfish stew with saffron, tomato and fennel, served with garlicky rouille sauce on toast.', 'Bouillabaisse'),
  dish('vichyssoise', 'Vichyssoise', 'Cold leek and potato soup', 'Creamy soup of leeks and potatoes, usually served chilled.', 'Vichyssoise'),
  dish('veloute', 'Velouté', 'Cream soup', 'A smooth, velvety blended soup; the menu says of what, e.g. velouté de potiron (pumpkin).', 'Cream soup'),
  dish('soupe-poisson', 'Soupe de poisson', 'Fish soup', 'Rich puréed fish soup, served with croutons, rouille and grated cheese to add yourself.', 'Fish soup', 'soupe de poissons'),
  dish('escargots', 'Escargots', 'Snails', 'Snails baked in their shells with garlic, parsley and lots of butter. Usually 6 or 12, eaten with tongs and a small fork.', 'Escargot', 'escargots de bourgogne', 'escargot'),
  dish('foie-gras', 'Foie gras', 'Foie gras (fattened duck or goose liver)', 'Rich, buttery liver of a fattened duck or goose, served as a cold slice (terrine) with toast and chutney, or pan-seared (poêlé).', 'Foie gras'),
  dish('pate', 'Pâté', 'Pâté', 'Ground meat (usually pork) and liver, seasoned and baked, served cold in slices with bread and pickles.', 'Pâté', 'pate de campagne'),
  dish('terrine', 'Terrine', 'Terrine', 'A coarse pâté or layered loaf of meat, fish or vegetables, cooked in a mould and served cold in slices.', 'Terrine (food)', 'terrine maison'),
  dish('rillettes', 'Rillettes', 'Rillettes (potted meat)', 'Pork (or duck, or salmon) slow-cooked in fat, shredded into a spread and eaten cold on bread. Rich.', 'Rillettes'),
  dish('charcuterie', 'Assiette de charcuterie', 'Cured meat platter', 'Board of cold cuts: dry sausage, ham, pâté and the like, often with pickles (cornichons) and bread. Mostly pork.', 'Charcuterie', 'planche de charcuterie', 'charcuterie'),
  dish('fromages', 'Assiette de fromages', 'Cheese plate', 'A selection of French cheeses, served with bread; eaten after the main course and before (or instead of) dessert.', 'Cheese platter', 'plateau de fromages', 'planche de fromages', 'planche mixte'),
  dish('salade-nicoise', 'Salade niçoise', 'Niçoise salad', 'Salad of tomatoes, hard-boiled egg, olives, anchovies or tuna, green beans and lettuce, with vinaigrette.', 'Salade niçoise'),
  dish('salade-chevre', 'Salade de chèvre chaud', 'Warm goat cheese salad', 'Green salad topped with rounds of goat cheese melted on toast, often with honey and walnuts.', 'Goat cheese', 'salade chevre chaud', 'chevre chaud'),
  dish('salade-lyonnaise', 'Salade lyonnaise', 'Lyon-style salad', 'Frisée lettuce with crispy bacon bits (lardons), croutons and a soft poached egg.', 'Salade lyonnaise'),
  dish('oeuf-mayo', 'Œuf mayonnaise', 'Egg mayonnaise', 'Hard-boiled eggs halved and covered in mayonnaise; a classic bistro starter.', 'Egg mayonnaise', 'oeufs mayonnaise', 'oeuf mayo'),
  dish('oeufs-cocotte', 'Œufs cocotte', 'Baked eggs', 'Eggs baked in a small dish with cream, sometimes with ham, cheese or mushrooms.', 'Shirred eggs', 'oeuf cocotte', 'oeuf en cocotte'),
  dish('poireaux-vinaigrette', 'Poireaux vinaigrette', 'Leeks in vinaigrette', 'Tender poached leeks served cold with a mustardy French dressing.', 'Leek', 'poireaux vinaigrette'),
  dish('carottes-rapees', 'Carottes râpées', 'Grated carrot salad', 'Finely grated carrots in a lemony vinaigrette, a light starter.', 'Carrot salad'),
  dish('celeri-remoulade', 'Céleri rémoulade', 'Celeriac remoulade', 'Shredded celery root in a creamy mustard mayonnaise, served cold.', 'Céleri rémoulade'),
  dish('gougeres', 'Gougères', 'Cheese puffs', 'Light, airy choux pastry puffs baked with cheese (usually Gruyère or Comté).', 'Gougère', 'gougere'),
  dish('tapenade', 'Tapenade', 'Olive spread', 'Provençal spread of puréed olives, capers and anchovies, served on toast.', 'Tapenade'),
  dish('brandade', 'Brandade de morue', 'Salt cod and potato purée', 'Salt cod whipped with olive oil, garlic and potato, often baked until golden.', 'Brandade', 'brandade'),
  dish('huitres', 'Huîtres', 'Oysters', 'Raw oysters on the half shell, served on ice with lemon and shallot vinegar. Sold by the half dozen or dozen.', 'Oyster', 'huitre'),
  dish('plateau-fruits-mer', 'Plateau de fruits de mer', 'Seafood platter', 'A tiered platter of chilled shellfish: oysters, prawns, crab, clams, whelks and more, mostly raw or cold.', 'Plateau de fruits de mer'),
  dish('tartare-saumon', 'Tartare de saumon', 'Salmon tartare', 'Raw salmon, finely diced and seasoned, often with avocado, lime or herbs.', 'Tartare', 'tartare de saumon'),
  dish('carpaccio', 'Carpaccio', 'Carpaccio', 'Paper-thin slices of raw beef (or fish), dressed with olive oil, parmesan and rocket.', 'Carpaccio', 'carpaccio de boeuf'),
  dish('quiche', 'Quiche lorraine', 'Quiche lorraine', 'Savoury tart of eggs and cream with bacon bits. "Quiche" alone may have other fillings.', 'Quiche', 'quiche'),
  dish('croque-monsieur', 'Croque-monsieur', 'Toasted ham and cheese sandwich', 'Ham and cheese sandwich topped with béchamel sauce and more cheese, then grilled.', 'Croque monsieur', 'croque monsieur'),
  dish('croque-madame', 'Croque-madame', 'Croque-monsieur with a fried egg', 'A croque-monsieur (grilled ham and cheese with béchamel) topped with a fried egg.', 'Croque madame', 'croque madame'),
  dish('tarte-flambee', 'Tarte flambée', 'Alsatian flatbread', 'Thin crispy flatbread spread with crème fraîche, topped with onions and bacon. Also called flammekueche.', 'Tarte flambée', 'flammekueche', 'flammekuche'),
  dish('pissaladiere', 'Pissaladière', 'Onion and anchovy tart', 'Niçoise flat tart of slow-cooked onions, anchovies and black olives.', 'Pissaladière'),
  dish('gaspacho', 'Gaspacho', 'Gazpacho', 'Cold blended soup of raw tomato, cucumber, pepper and garlic.', 'Gazpacho', 'gazpacho'),

  // ── Main courses ──
  dish('coq-au-vin', 'Coq au vin', 'Chicken in red wine', 'Chicken braised slowly in red wine with mushrooms, bacon and small onions.', 'Coq au vin'),
  dish('boeuf-bourguignon', 'Bœuf bourguignon', 'Beef stewed in red wine', 'Burgundy beef stew: chunks of beef braised for hours in red wine with carrots, mushrooms, onions and bacon.', 'Beef bourguignon', 'boeuf bourguignon', 'bourguignon'),
  dish('blanquette', 'Blanquette de veau', 'Creamy veal stew', 'Veal gently simmered in a white sauce of cream and egg with mushrooms and onions. Mild and comforting.', 'Blanquette de veau', 'blanquette'),
  dish('pot-au-feu', 'Pot-au-feu', 'Boiled beef and vegetables', 'Beef simmered for hours with carrots, leeks, turnips and marrow bones; the broth may come separately.', 'Pot-au-feu', 'pot au feu'),
  dish('cassoulet', 'Cassoulet', 'Bean, sausage and duck casserole', 'Hearty south-west stew of white beans slow-baked with sausage, pork and duck confit.', 'Cassoulet'),
  dish('confit-canard', 'Confit de canard', 'Duck confit', 'Duck leg slow-cooked in its own fat, then crisped. Usually with potatoes fried in duck fat (pommes sarladaises).', 'Duck confit', 'cuisse de canard confite', 'canard confit'),
  dish('magret', 'Magret de canard', 'Duck breast', 'Thick breast of a fattened duck, seared with a crispy skin and served pink (like steak) unless you ask.', 'Magret', 'magret'),
  dish('canard-orange', "Canard à l'orange", 'Duck in orange sauce', 'Roast duck with a sweet-and-sour orange sauce.', "Canard à l'orange", "canard a l'orange"),
  dish('steak-frites', 'Steak frites', 'Steak and fries', 'Pan-fried steak with French fries. Cooked rare (saignant) unless you say otherwise.', 'Steak frites', 'steak frites'),
  dish('entrecote', 'Entrecôte', 'Rib-eye steak', 'Rib-eye steak, well marbled and flavourful, usually with fries and a sauce.', 'Rib eye steak'),
  dish('bavette', 'Bavette', 'Flank steak', 'Flank or skirt steak: thin, loose-grained and full of flavour; best rare to medium. Often with shallots (à l\'échalote).', 'Flank steak', "bavette a l'echalote"),
  dish('onglet', 'Onglet', 'Hanger steak', 'Hanger steak, a tender, beefy bistro cut usually served with shallot sauce.', 'Hanger steak'),
  dish('faux-filet', 'Faux-filet', 'Sirloin steak', 'Sirloin (strip) steak.', 'Strip steak', 'faux filet'),
  dish('filet-boeuf', 'Filet de bœuf', 'Beef tenderloin', 'The most tender cut of beef (fillet mignon).', 'Beef tenderloin', 'filet de boeuf', 'tournedos'),
  dish('cote-boeuf', 'Côte de bœuf', 'Bone-in rib steak', 'A huge bone-in rib steak, usually for two to share, carved at the table.', 'Rib steak', 'cote de boeuf'),
  dish('chateaubriand', 'Chateaubriand', 'Chateaubriand', 'A thick centre-cut beef tenderloin for two, often with béarnaise sauce.', 'Chateaubriand steak'),
  dish('steak-tartare', 'Steak tartare', 'Raw beef tartare', 'RAW minced beef, seasoned with capers, shallots, mustard and a raw egg yolk; served with fries. "Aller-retour" means briefly seared.', 'Steak tartare', 'tartare de boeuf', 'steak tartare'),
  dish('steak-poivre', 'Steak au poivre', 'Pepper steak', 'Steak crusted with cracked peppercorns in a creamy cognac-pepper sauce.', 'Steak au poivre', 'steak au poivre'),
  dish('hachis-parmentier', 'Hachis parmentier', 'French shepherd\'s pie', 'Minced beef topped with mashed potato and baked until golden.', 'Hachis Parmentier', 'parmentier'),
  dish('boudin-noir', 'Boudin noir', 'Black pudding (blood sausage)', 'Soft sausage made with pork blood and fat, usually fried and served with apples or mash.', 'Black pudding', 'boudin'),
  dish('andouillette', 'Andouillette', 'Tripe sausage', 'Coarse pork sausage made from intestines (chitterlings), with a strong, farmy smell. An acquired taste!', 'Andouillette'),
  dish('saucisse-puree', 'Saucisse purée', 'Sausage and mash', 'Grilled pork sausage with creamy mashed potatoes, often with gravy.', 'Bangers and mash', 'saucisse'),
  dish('choucroute', 'Choucroute garnie', 'Sauerkraut with sausages and pork', 'Alsatian dish of sauerkraut braised in white wine, piled with sausages, ham and pork, with boiled potatoes.', 'Choucroute garnie', 'choucroute'),
  dish('tartiflette', 'Tartiflette', 'Potato, bacon and cheese bake', 'Alpine bake of potatoes, onions and bacon under a whole melted Reblochon cheese.', 'Tartiflette'),
  dish('raclette', 'Raclette', 'Raclette (melted cheese)', 'Melted raclette cheese scraped over boiled potatoes, with cured meats and pickles.', 'Raclette'),
  dish('fondue', 'Fondue savoyarde', 'Cheese fondue', 'Pot of melted cheese and white wine; you dip cubes of bread into it with long forks.', 'Fondue', 'fondue'),
  dish('aligot', 'Aligot', 'Cheesy mashed potatoes', 'Mashed potato beaten with garlic and young Tomme cheese until it stretches like elastic.', 'Aligot'),
  dish('gratin-dauphinois', 'Gratin dauphinois', 'Potato gratin', 'Thinly sliced potatoes baked slowly in garlicky cream until golden.', 'Gratin dauphinois'),
  dish('ratatouille', 'Ratatouille', 'Ratatouille', 'Provençal stew of courgette, aubergine, peppers, tomato and onion in olive oil. Vegetarian.', 'Ratatouille'),
  dish('poulet-roti', 'Poulet rôti', 'Roast chicken', 'Classic roast chicken, often with fries or roasted potatoes and its juices.', 'Roast chicken', 'poulet roti'),
  dish('supreme-volaille', 'Suprême de volaille', 'Chicken breast', 'Chicken breast (with the wing bone), usually in a creamy sauce.', 'Chicken as food', 'supreme de volaille'),
  dish('lapin-moutarde', 'Lapin à la moutarde', 'Rabbit in mustard sauce', 'Rabbit braised in a creamy Dijon mustard sauce.', 'Rabbit', 'lapin a la moutarde'),
  dish('gigot', "Gigot d'agneau", 'Roast leg of lamb', 'Roast leg of lamb, often with garlic, rosemary and flageolet beans.', 'Leg of lamb', 'gigot'),
  dish('souris-agneau', "Souris d'agneau", 'Slow-cooked lamb shank', 'Lamb shank braised until it falls off the bone.', 'Lamb shank', 'souris'),
  dish('carre-agneau', "Carré d'agneau", 'Rack of lamb', 'Roast rack of lamb chops, usually served pink.', 'Rack of lamb', "carre d'agneau"),
  dish('navarin', "Navarin d'agneau", 'Lamb and vegetable stew', 'Spring lamb stew with turnips, carrots and peas.', 'Navarin', 'navarin'),
  dish('ris-veau', 'Ris de veau', 'Veal sweetbreads', 'Veal thymus gland: soft and delicate, usually pan-fried until crisp. An organ meat.', 'Sweetbread', 'ris de veau'),
  dish('tete-veau', 'Tête de veau', "Calf's head", 'Simmered meat from a calf\'s head (including skin and tongue), served with a tangy sauce gribiche.', 'Tête de veau', 'tete de veau'),
  dish('rognons', 'Rognons', 'Kidneys', 'Veal or lamb kidneys, usually in a mustard or Madeira sauce. An organ meat.', 'Kidney (vertebrates)', 'rognon', 'rognons de veau'),
  dish('foie-veau', 'Foie de veau', "Calf's liver", 'Slices of calf liver, pan-fried, often with onions or a little vinegar.', 'Liver (food)', 'foie de veau'),
  dish('joue-boeuf', 'Joue de bœuf', 'Braised beef cheek', 'Beef cheek slow-braised in red wine until spoon-tender.', 'Beef cheek', 'joue de boeuf', 'joue'),
  dish('daube', 'Daube provençale', 'Provençal beef stew', 'Beef braised in red wine with garlic, herbs, orange peel and olives.', 'Daube', 'daube'),
  dish('moules-frites', 'Moules-frites', 'Mussels and fries', 'A pot of steamed mussels with a side of fries.', 'Moules-frites', 'moules frites', 'moules'),
  dish('moules-marinieres', 'Moules marinières', 'Mussels in white wine', 'Mussels steamed in white wine, garlic, shallots and parsley.', 'Moules-frites', 'moules marinieres', 'moules mariniere'),
  dish('sole-meuniere', 'Sole meunière', 'Sole in brown butter', 'Whole sole dusted in flour and pan-fried, served with brown butter, lemon and parsley.', 'Sole meunière', 'sole meuniere'),
  dish('saint-jacques', 'Saint-Jacques', 'Scallops', 'Seared scallops (coquilles Saint-Jacques), sometimes baked in their shell with a creamy sauce.', 'Scallop', 'coquilles saint jacques', 'saint jacques', 'noix de saint jacques'),
  dish('dos-cabillaud', 'Dos de cabillaud', 'Cod fillet', 'A thick, choice piece of cod fillet, usually roasted or pan-fried.', 'Cod as food', 'dos de cabillaud'),
  dish('pave-saumon', 'Pavé de saumon', 'Salmon fillet', 'A thick square-cut salmon fillet, grilled or roasted.', 'Salmon as food', 'pave de saumon'),
  dish('quenelles', 'Quenelle de brochet', 'Pike dumplings', 'Lyonnaise poached dumplings of pike and flour, baked in a creamy crayfish (Nantua) sauce.', 'Quenelle', 'quenelles', 'quenelle'),
  dish('bouchee-reine', 'Bouchée à la reine', 'Puff pastry with creamy chicken', 'Puff pastry case filled with chicken, mushrooms and sweetbreads in cream sauce. Also called vol-au-vent.', 'Vol-au-vent', 'vol au vent', 'bouchee a la reine'),
  dish('omelette', 'Omelette', 'Omelette', 'French-style omelette, soft inside; the menu says what\'s in it.', 'Omelette'),
  dish('galette', 'Galette', 'Savoury buckwheat crêpe', 'Brittany buckwheat pancake folded around fillings. A "complète" has ham, cheese and egg.', 'Galette', 'galette complete', 'galette de sarrasin'),

  // ── Desserts ──
  dish('creme-brulee', 'Crème brûlée', 'Crème brûlée', 'Cold vanilla custard under a crust of caramelised sugar you crack with a spoon.', 'Crème brûlée', 'creme brulee'),
  dish('creme-caramel', 'Crème caramel', 'Caramel custard (flan)', 'Set vanilla custard turned out of its mould with runny caramel on top.', 'Crème caramel', 'creme caramel', 'flan'),
  dish('mousse-chocolat', 'Mousse au chocolat', 'Chocolate mousse', 'Light, airy chocolate dessert made with eggs; usually served cold in a pot.', 'Chocolate mousse', 'mousse au chocolat'),
  dish('ile-flottante', 'Île flottante', 'Floating island', 'Soft poached meringue floating on vanilla custard, drizzled with caramel.', 'Floating island (dessert)', 'ile flottante', 'iles flottantes', 'oeufs a la neige'),
  dish('tarte-tatin', 'Tarte Tatin', 'Upside-down apple tart', 'Caramelised apple tart baked upside down, served warm, often with crème fraîche.', 'Tarte Tatin', 'tatin'),
  dish('tarte-citron', 'Tarte au citron', 'Lemon tart', 'Tangy lemon curd in a crisp pastry shell; "meringuée" means topped with meringue.', 'Lemon tart', 'tarte au citron meringuee', 'tarte citron'),
  dish('tarte-fine', 'Tarte fine aux pommes', 'Thin apple tart', 'Thin, crisp puff pastry topped with finely sliced apples, served warm.', 'Apple pie', 'tarte aux pommes', 'tarte fine'),
  dish('fondant-chocolat', 'Fondant au chocolat', 'Molten chocolate cake', 'Small chocolate cake with a gooey, melting centre.', 'Molten chocolate cake', 'fondant', 'moelleux au chocolat', 'coulant au chocolat'),
  dish('profiteroles', 'Profiteroles', 'Profiteroles', 'Choux pastry puffs filled with vanilla ice cream and covered in warm chocolate sauce.', 'Profiterole', 'profiterole'),
  dish('creme-chantilly', 'Crème Chantilly', 'Whipped cream', 'Sweetened vanilla whipped cream.', 'Whipped cream', 'chantilly'),
  dish('cafe-gourmand', 'Café gourmand', 'Espresso with mini desserts', 'An espresso served with three or four tiny desserts: lets you taste several.', 'Café gourmand', 'cafe gourmand', 'the gourmand'),
  dish('crepe-suzette', 'Crêpe Suzette', 'Crêpes in orange-butter sauce', 'Thin pancakes in a sauce of butter, sugar, orange and orange liqueur, sometimes flambéed.', 'Crêpe Suzette', 'crepes suzette', 'crepe suzette'),
  dish('crepe', 'Crêpe', 'Sweet crêpe', 'Thin pancake with a sweet filling such as sugar, Nutella, jam or salted caramel.', 'Crêpe', 'crepe', 'crepes'),
  dish('clafoutis', 'Clafoutis', 'Cherry batter pudding', 'Fruit (traditionally whole cherries) baked in a thick, flan-like batter.', 'Clafoutis'),
  dish('mille-feuille', 'Mille-feuille', 'Custard slice', 'Layers of crisp puff pastry and vanilla pastry cream, glazed with icing.', 'Mille-feuille', 'millefeuille', 'mille feuille'),
  dish('paris-brest', 'Paris-Brest', 'Praline cream pastry ring', 'Ring of choux pastry filled with hazelnut praline cream.', 'Paris–Brest', 'paris brest'),
  dish('eclair', 'Éclair', 'Éclair', 'Long choux pastry filled with custard (coffee or chocolate) and glazed on top.', 'Éclair (pastry)', 'eclair', 'eclairs'),
  dish('macarons', 'Macarons', 'Macarons', 'Small, chewy almond-meringue cookies sandwiched with a filling, in many flavours.', 'Macaron', 'macaron'),
  dish('baba-rhum', 'Baba au rhum', 'Rum baba', 'Small yeast cake soaked in rum syrup, often with whipped cream. Contains alcohol.', 'Rum baba', 'baba au rhum', 'baba'),
  dish('riz-lait', 'Riz au lait', 'Rice pudding', 'Creamy rice pudding cooked in sweetened vanilla milk, served cold.', 'Rice pudding', 'riz au lait'),
  dish('pain-perdu', 'Pain perdu', 'French toast', 'Bread soaked in egg and milk, fried in butter, often with ice cream or caramel.', 'French toast'),
  dish('poire-belle-helene', 'Poire Belle-Hélène', 'Pear with chocolate sauce', 'Poached pear with vanilla ice cream and warm chocolate sauce.', 'Poire belle Hélène', 'poire belle helene'),
  dish('peche-melba', 'Pêche Melba', 'Peach Melba', 'Peaches and vanilla ice cream with raspberry sauce.', 'Peach Melba', 'peche melba'),
  dish('dame-blanche', 'Dame blanche', 'Vanilla sundae with hot chocolate', 'Vanilla ice cream with whipped cream and warm chocolate sauce.', 'Dame blanche (dessert)', 'dame blanche'),
  dish('cafe-liegeois', 'Café liégeois', 'Iced coffee sundae', 'Coffee ice cream with cold coffee and whipped cream, served in a glass.', 'Café liégeois', 'cafe liegeois', 'chocolat liegeois'),
  dish('sorbet', 'Sorbet', 'Sorbet', 'Dairy-free fruit ice; "trou normand" is apple sorbet with Calvados brandy.', 'Sorbet', 'sorbets'),
  dish('glace', 'Coupe glacée', 'Ice cream sundae', 'Ice cream: a "coupe" is a sundae, and you choose flavours (parfums) by the scoop (boule).', 'Ice cream', 'glaces', 'boule de glace', 'boules de glace'),
  dish('canele', 'Canelé', 'Canelé', 'Small Bordeaux cake with a dark caramelised crust and soft rum-vanilla custard inside.', 'Canelé', 'canele', 'caneles'),
  dish('far-breton', 'Far breton', 'Breton prune flan', 'Dense, flan-like Breton cake, usually with prunes.', 'Far Breton', 'far breton'),
  dish('kouign-amann', 'Kouign-amann', 'Breton butter cake', 'Very buttery, flaky, caramelised layered pastry from Brittany.', 'Kouign-amann', 'kouign amann'),

  // ── Bakery & drinks ──
  dish('croissant', 'Croissant', 'Croissant', 'Flaky, buttery crescent pastry.', 'Croissant', 'croissants'),
  dish('pain-chocolat', 'Pain au chocolat', 'Chocolate croissant', 'Croissant dough rolled around two sticks of dark chocolate. Called "chocolatine" in the south-west.', 'Pain au chocolat', 'chocolatine'),
  dish('tartine', 'Tartine', 'Open sandwich / bread and butter', 'A slice of bread with a topping: at breakfast, butter and jam; at lunch, an open sandwich.', 'Tartine', 'tartines'),
  dish('jambon-beurre', 'Jambon-beurre', 'Ham and butter baguette', 'The classic French sandwich: a baguette with ham and butter.', 'Jambon-beurre', 'jambon beurre'),
  dish('cafe-creme', 'Café crème', 'Coffee with milk', 'Espresso topped up with hot milk, like a latte. A plain "café" is an espresso.', 'Café au lait', 'cafe creme', 'cafe au lait'),
  dish('noisette', 'Noisette', 'Espresso with a dash of milk', 'Espresso with a little milk (like a macchiato). Also means hazelnut in desserts.', 'Caffè macchiato'),
  dish('chocolat-chaud', 'Chocolat chaud', 'Hot chocolate', 'Hot chocolate, often rich and thick.', 'Hot chocolate', 'chocolat chaud'),
  dish('kir', 'Kir', 'Kir', 'White wine with blackcurrant liqueur (cassis); a "kir royal" uses Champagne.', 'Kir (cocktail)', 'kir royal'),
  dish('pastis', 'Pastis', 'Pastis', 'Aniseed (liquorice-flavoured) spirit, diluted with cold water until it turns cloudy.', 'Pastis', 'ricard'),
  dish('panache', 'Panaché', 'Shandy', 'Beer mixed with lemonade.', 'Shandy', 'panache'),
  dish('pression', 'Pression', 'Draught beer', 'Beer on tap; "un demi" is a 25 cl glass.', 'Draught beer', 'biere pression', 'un demi'),
  dish('citron-presse', 'Citron pressé', 'Fresh lemonade', 'Freshly squeezed lemon juice served with water and sugar to mix yourself.', 'Lemonade', 'citron presse'),
  dish('diabolo', 'Diabolo', 'Lemonade with syrup', 'Fizzy lemonade with a flavoured syrup, e.g. diabolo menthe (mint).', 'Diabolo (drink)', 'diabolo menthe'),

  // ── Menu words: ingredients ──
  term('tartare', 'Tartare', 'Tartare (raw)', 'Finely chopped RAW meat or fish, seasoned and served cold.'),
  term('saumon', 'Saumon', 'Salmon', 'Salmon. "Saumon fumé" is smoked salmon.', 'saumon fume'),
  term('cabillaud', 'Cabillaud', 'Cod', 'Cod. "Morue" is salt cod.', 'morue'),
  term('agneau', 'Agneau', 'Lamb', 'Lamb.'),
  term('lapin', 'Lapin', 'Rabbit', 'Rabbit.'),
  term('confit', 'Confit', 'Slow-cooked in fat', 'Slow-cooked in its own fat (meat), or cooked down until jammy (onions, fruit).', 'confite', 'confits'),
  term('canard', 'Canard', 'Duck', 'Duck. Magret is the breast, confit is leg cooked in fat.'),
  term('boeuf', 'Bœuf', 'Beef', 'Beef.', 'boeuf'),
  term('veau', 'Veau', 'Veal', 'Veal (young beef).'),
  term('porc', 'Porc', 'Pork', 'Pork.', 'cochon', 'porcelet'),
  term('poulet', 'Poulet', 'Chicken', 'Chicken. Volaille means poultry.', 'volaille', 'pintade'),
  term('jambon', 'Jambon', 'Ham', 'Ham. "Jambon cru" is cured raw ham; "jambon blanc" is cooked ham.', 'jambon cru', 'jambon blanc'),
  term('lardons', 'Lardons', 'Bacon bits', 'Small strips of bacon.', 'lardon'),
  term('poisson', 'Poisson', 'Fish', 'Fish. "Poisson du jour" is the catch of the day.', 'poisson du jour'),
  term('crevettes', 'Crevettes', 'Prawns / shrimp', 'Prawns or shrimp.', 'crevette', 'gambas'),
  term('homard', 'Homard', 'Lobster', 'Lobster. Langouste is spiny lobster, langoustine is scampi.', 'langouste', 'langoustine', 'langoustines'),
  term('thon', 'Thon', 'Tuna', 'Tuna.'),
  term('bar', 'Bar / Loup', 'Sea bass', 'Sea bass (called loup in the Mediterranean).', 'loup', 'loup de mer', 'filet de bar', 'bar grille', 'bar roti'),
  term('dorade', 'Dorade', 'Sea bream', 'Sea bream, a mild white fish, often grilled whole.', 'daurade'),
  term('lotte', 'Lotte', 'Monkfish', 'Monkfish: firm, meaty white fish.'),
  term('truite', 'Truite', 'Trout', 'Trout.'),
  term('chevre', 'Chèvre', 'Goat cheese', 'Goat cheese (chèvre means goat).', 'chevre'),
  term('fromage', 'Fromage', 'Cheese', 'Cheese.'),
  term('fromage-blanc', 'Fromage blanc', 'Fresh white cheese', 'Soft fresh cheese, like thick plain yogurt; as a dessert it comes with sugar, honey or fruit sauce.'),
  term('coulis', 'Coulis', 'Fruit sauce', 'A smooth sauce of puréed fruit (often red berries); also tomato or pepper coulis.'),
  term('champignons', 'Champignons', 'Mushrooms', 'Mushrooms. Cèpes are porcini, girolles are chanterelles, morilles are morels.', 'champignon', 'cepes', 'girolles', 'morilles'),
  term('truffe', 'Truffe', 'Truffle', 'Truffle, a prized, earthy fungus.', 'truffes', 'truffe'),
  term('pommes-terre', 'Pommes de terre', 'Potatoes', 'Potatoes. "Pommes" alone on a menu usually means potatoes too, e.g. pommes frites (fries).', 'pomme de terre', 'pommes frites', 'frites'),
  term('puree', 'Purée', 'Mashed potatoes', 'Mashed potatoes (or another purée, e.g. purée de carottes).', 'puree'),
  term('haricots', 'Haricots verts', 'Green beans', 'Green beans. Flageolets are small pale-green dried beans.', 'haricots', 'flageolets'),
  term('epinards', 'Épinards', 'Spinach', 'Spinach.', 'epinards'),
  term('legumes', 'Légumes', 'Vegetables', 'Vegetables. "Légumes du moment" are seasonal vegetables.', 'legumes'),
  term('salade', 'Salade', 'Salad', 'A salad, or just green leaves on the side.', 'salade verte'),
  term('ail', 'Ail', 'Garlic', 'Garlic.'),
  term('echalote', 'Échalote', 'Shallot', 'Shallot.', 'echalotes', 'echalote'),
  term('noix', 'Noix', 'Walnuts', 'Walnuts. Noisette is hazelnut, amande is almond.', 'amandes', 'amande'),
  term('miel', 'Miel', 'Honey', 'Honey.'),
  term('citron', 'Citron', 'Lemon', 'Lemon (citron vert is lime).', 'citron vert'),
  term('fraise', 'Fraises', 'Strawberries', 'Strawberries. Framboises are raspberries, myrtilles blueberries.', 'fraise', 'framboises', 'myrtilles'),
  term('poire', 'Poire', 'Pear', 'Pear.', 'poires'),
  term('oeuf', 'Œuf', 'Egg', 'Egg.', 'oeufs', 'oeuf'),
  term('beurre', 'Beurre', 'Butter', 'Butter. "Beurre blanc" is a white wine butter sauce.', 'beurre blanc'),
  term('creme-fraiche', 'Crème fraîche', 'Crème fraîche', 'Thick, slightly tangy cream.', 'creme fraiche'),

  // ── Menu words: cooking, sauces, ordering ──
  term('bearnaise', 'Sauce béarnaise', 'Béarnaise sauce', 'Rich butter and egg-yolk sauce with tarragon, served with steak.', 'bearnaise'),
  term('sauce-poivre', 'Sauce au poivre', 'Pepper sauce', 'Creamy peppercorn sauce, often with cognac.', 'au poivre', 'poivre vert'),
  term('hollandaise', 'Sauce hollandaise', 'Hollandaise sauce', 'Warm butter and egg-yolk sauce with lemon.', 'hollandaise'),
  term('roquefort', 'Sauce roquefort', 'Blue cheese sauce', 'Creamy sauce made with Roquefort blue cheese.', 'roquefort'),
  term('poele', 'Poêlé', 'Pan-fried', 'Pan-fried.', 'poele', 'poelee'),
  term('roti', 'Rôti', 'Roasted', 'Roasted.', 'roti', 'rotie'),
  term('grille', 'Grillé', 'Grilled', 'Grilled. "À la plancha" means cooked on a hot griddle.', 'grille', 'grillee', 'a la plancha', 'plancha'),
  term('braise', 'Braisé', 'Braised', 'Braised: browned, then slow-cooked in liquid.', 'braise', 'braisee'),
  term('mijote', 'Mijoté', 'Slow-simmered', 'Slow-simmered.', 'mijote', 'mijotee'),
  term('vapeur', 'Vapeur', 'Steamed', 'Steamed.', 'a la vapeur'),
  term('cru', 'Cru', 'Raw', 'Raw (uncooked). Cuit means cooked.', 'crue', 'crus'),
  term('fume', 'Fumé', 'Smoked', 'Smoked.', 'fume', 'fumee'),
  term('farci', 'Farci', 'Stuffed', 'Stuffed.', 'farcie', 'farcis'),
  term('gratine', 'Gratiné', 'Topped with browned cheese', 'Topped with cheese or breadcrumbs and browned.', 'gratine', 'gratinee'),
  term('saignant', 'Saignant', 'Rare', 'Steak doneness: bleu = very rare, saignant = rare, à point = medium, bien cuit = well done.', 'a point', 'bien cuit'),
  term('maison', 'Maison', 'Homemade / house', '"Fait maison" means made in-house; "de la maison" means the house version.', 'fait maison', 'de la maison'),
  term('du-jour', 'Du jour', 'Of the day', 'Of the day: "plat du jour" is the daily special.', 'plat du jour', 'suggestion du jour'),
  term('entree', 'Entrée', 'Starter', 'Starter (appetiser). Careful: not the main course!', 'entrees', 'entree'),
  term('dessert', 'Desserts', 'Desserts', 'Desserts. "Douceurs" or "gourmandises" also mean sweets.', 'dessert', 'douceurs'),
  term('fermier', 'Fermier', 'Free-range / farm-raised', 'Farm-raised, free-range (poulet fermier = free-range chicken). "Label rouge" is a quality mark.', 'fermiere', 'label rouge'),
  term('plat', 'Plat', 'Main course', 'Main course ("plat principal").', 'plats', 'plat principal'),
  term('formule', 'Formule', 'Set menu', 'A fixed-price set menu, e.g. "entrée + plat" or "plat + dessert". "Menu" also means set menu.', 'formule midi', 'menu du jour'),
  term('a-la-carte', 'À la carte', 'Ordered individually', 'Ordered as separate dishes, rather than from the set menu.', 'a la carte'),
  term('garniture', 'Garniture', 'Side dish', 'The side served with the dish. "Accompagnement" means the same.', 'accompagnement', 'garni', 'garnie'),
  term('supplement', 'Supplément', 'Extra charge', 'Costs extra on top of the set menu price.', 'supplement'),
  term('prix-net', 'Prix nets', 'Service included', 'Prices include service; tipping is optional (round up or leave a few euros if you liked it).', 'service compris', 'prix nets'),
  term('vin', 'Vin', 'Wine', 'Wine: rouge (red), blanc (white), rosé. "Au verre" by the glass, "pichet" a jug, "bouteille" a bottle.', 'vin rouge', 'vin blanc', 'au verre', 'pichet'),
  term('eau', 'Eau', 'Water', '"Eau plate" is still water, "eau gazeuse" sparkling. A "carafe d\'eau" (tap water) is free.', 'eau plate', 'eau gazeuse', 'eau minerale'),
]

/** Fold text for matching: lower case, no accents, œ → oe, punctuation to spaces. */
export function foldMenuText(s: string): string {
  return ` ${s.toLowerCase()
    .replace(/œ/g, 'oe').replace(/æ/g, 'ae')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()} `
}

interface Key { item: MenuItem; re: RegExp; length: number }

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

// Each key matches whole words, allowing a plural s or x on each word.
const KEYS: Key[] = MENU_ITEMS.flatMap(item => [...new Set(item.match.map(m => foldMenuText(m).trim()))]
  .filter(Boolean)
  .map(k => ({
    item,
    length: k.length,
    re: new RegExp(` ${k.split(' ').map(w => `${escape(w)}[sx]?`).join(' ')}(?= )`, 'g'),
  })))
  .sort((a, b) => b.length - a.length)

export interface MenuMatch { item: MenuItem; at: number }

/**
 * Find guide entries in menu text. Longer names win over the words inside them
 * ("soupe à l'oignon" over "oignon"), and results come back in menu order, one per entry.
 */
export function findMenuItems(text: string): MenuMatch[] {
  const folded = foldMenuText(text)
  const taken: [number, number][] = []
  const found = new Map<string, MenuMatch>()
  for (const { item, re } of KEYS) {
    re.lastIndex = 0
    for (let m = re.exec(folded); m; m = re.exec(folded)) {
      const start = m.index
      const end = start + m[0].length
      if (taken.some(([s, e]) => start < e && end > s)) continue
      taken.push([start, end])
      if (!found.has(item.id)) found.set(item.id, { item, at: start })
    }
  }
  return [...found.values()].sort((a, b) => a.at - b.at)
}
