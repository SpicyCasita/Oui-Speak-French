import { describe, expect, it } from 'vitest'
import { findMenuItems, foldMenuText, MENU_ITEMS } from './menu'

const ids = (text: string) => findMenuItems(text).map(m => m.item.id)

const BISTRO = `
ENTRÉES
Soupe à l'oignon gratinée 9€
Escargots de Bourgogne (x6) 12€
Oeuf mayonnaise 6€
Tartare de thon, avocat 14€
PLATS
Magret de canard, sauce au poivre 24€
Steak tartare, frites maison 19€
Boeuf bourguignon, purée 22€
Moules marinières 18€
DESSERTS
Creme brulee 8€
Ile flottante 7€
Cafe gourmand 9€
`

describe('guide data', () => {
  it('has unique ids, text everywhere, and a photo article for every dish', () => {
    expect(new Set(MENU_ITEMS.map(i => i.id)).size).toBe(MENU_ITEMS.length)
    for (const i of MENU_ITEMS) {
      expect(i.fr && i.en && i.desc, i.id).toBeTruthy()
      if (i.kind === 'dish') expect(i.wiki, i.id).toBeTruthy()
    }
  })
})

describe('foldMenuText', () => {
  it('drops case, accents, ligatures and punctuation', () => {
    expect(foldMenuText("Bœuf à l'Échalote, 22€")).toBe(' boeuf a l echalote 22 ')
  })
})

describe('findMenuItems', () => {
  it('finds the dishes on a bistro menu, in menu order', () => {
    expect(ids(BISTRO)).toEqual([
      'entree', 'soupe-oignon', 'escargots', 'oeuf-mayo', 'tartare', 'thon', 'plat', 'magret', 'sauce-poivre',
      'steak-tartare', 'pommes-terre', 'maison', 'boeuf-bourguignon', 'puree', 'moules-marinieres', 'dessert',
      'creme-brulee', 'ile-flottante', 'cafe-gourmand',
    ])
  })

  it('prefers the full dish name over the words inside it', () => {
    expect(ids('Soupe à l’oignon')).toEqual(['soupe-oignon'])
    expect(ids('Crème brûlée')).toEqual(['creme-brulee'])
    expect(ids('Moules frites')).toEqual(['moules-frites'])
  })

  it('explains words when the dish itself is not in the guide', () => {
    expect(ids('Tartare de thon')).toEqual(['tartare', 'thon'])
    expect(ids('Filet de dorade grillé')).toEqual(['dorade', 'grille'])
  })

  it('accepts plurals and missing accents', () => {
    expect(ids('ESCARGOT')).toEqual(['escargots'])
    expect(ids('huitres fines de claire')).toEqual(['huitres'])
    expect(ids('profiterole')).toEqual(['profiteroles'])
  })

  it('matches whole words only', () => {
    expect(ids('barbecue')).toEqual([])
    expect(ids('Kirsch')).toEqual([])
  })

  it('lists each entry once', () => {
    expect(ids('Crêpe au sucre, crêpe Nutella, crêpe beurre')).toEqual(['crepe', 'beurre'])
  })
})
