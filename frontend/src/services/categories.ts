import {
  collection,
  doc,
  getDocs,
  query,
  where,
  limit,
  writeBatch,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from './firebase'
import type { Category } from '../types/Category'

const DEFAULT_CATEGORIES: Array<{
  key: string
  name: string
  subcategories: Array<{ name: string; key: string }>
}> = [
  {
    key: 'hardware',
    name: 'Hardware',
    subcategories: [
      { key: 'laptop', name: 'Laptop' },
      { key: 'pc', name: 'PC' },
      { key: 'monitor', name: 'Monitor' },
      { key: 'teclado', name: 'Teclado' },
      { key: 'mouse', name: 'Mouse' },
    ],
  },
  {
    key: 'software',
    name: 'Software',
    subcategories: [
      { key: 'instalacion', name: 'Instalación' },
      { key: 'actualizacion', name: 'Actualización' },
      { key: 'error', name: 'Error' },
      { key: 'licencia', name: 'Licencia' },
    ],
  },
  {
    key: 'network',
    name: 'Red',
    subcategories: [
      { key: 'internet', name: 'Internet' },
      { key: 'wifi', name: 'WiFi' },
      { key: 'vpn', name: 'VPN' },
      { key: 'servidor', name: 'Servidor' },
    ],
  },
  {
    key: 'access',
    name: 'Accesos',
    subcategories: [
      { key: 'correo', name: 'Correo' },
      { key: 'sistema', name: 'Sistema' },
      { key: 'cuenta', name: 'Cuenta' },
      { key: 'permisos', name: 'Permisos' },
    ],
  },
  {
    key: 'email',
    name: 'Correo',
    subcategories: [
      { key: 'envio', name: 'Envío' },
      { key: 'recepcion', name: 'Recepción' },
      { key: 'configuracion', name: 'Configuración' },
    ],
  },
  {
    key: 'security',
    name: 'Seguridad',
    subcategories: [
      { key: 'virus', name: 'Virus' },
      { key: 'phishing', name: 'Phishing' },
      { key: 'contrasena', name: 'Contraseña' },
    ],
  },
  {
    key: 'printers',
    name: 'Impresoras',
    subcategories: [
      { key: 'no-imprime', name: 'No imprime' },
      { key: 'atascada', name: 'Atascada' },
      { key: 'configuracion', name: 'Configuración' },
    ],
  },
  {
    key: 'systems',
    name: 'Sistemas',
    subcategories: [
      { key: 'erp', name: 'ERP' },
      { key: 'crm', name: 'CRM' },
      { key: 'ventas', name: 'Ventas' },
      { key: 'nomina', name: 'Nómina' },
    ],
  },
  {
    key: 'other',
    name: 'Otros',
    subcategories: [{ key: 'general', name: 'General' }],
  },
]

function mapCategory(id: string, data: Record<string, unknown>): Category {
  return {
    id,
    name: data.name as string,
    key: data.key as string,
    subcategories: (data.subcategories ?? []) as Category['subcategories'],
    active: data.active as boolean,
    createdAt: data.createdAt as Date,
  }
}

export async function ensureDefaultCategories(): Promise<void> {
  const snapshot = await getDocs(query(collection(db, 'categories'), limit(1)))
  if (!snapshot.empty) return

  const batch = writeBatch(db)
  for (const cat of DEFAULT_CATEGORIES) {
    const ref = doc(collection(db, 'categories'))
    batch.set(ref, {
      name: cat.name,
      key: cat.key,
      subcategories: cat.subcategories,
      active: true,
      createdAt: serverTimestamp(),
    })
  }

  try {
    await batch.commit()
  } catch (err) {
    console.warn('No se pudieron sembrar las categorías:', err)
  }
}

async function fetchActiveCategories(): Promise<Category[]> {
  const snapshot = await getDocs(
    query(collection(db, 'categories'), where('active', '==', true)),
  )

  const byKey = new Map<string, Category>()
  for (const docSnap of snapshot.docs) {
    const category = mapCategory(docSnap.id, docSnap.data() as Record<string, unknown>)
    if (!byKey.has(category.key)) byKey.set(category.key, category)
  }

  const categories = [...byKey.values()]
  categories.sort((a, b) => a.name.localeCompare(b.name, 'es'))
  return categories
}

let categoriesCache: { promise: Promise<Category[]>; at: number } | null = null
const CACHE_TTL_MS = 60_000

export async function loadCategories(force = false): Promise<Category[]> {
  const cached = categoriesCache
  if (!force && cached && Date.now() - cached.at < CACHE_TTL_MS) {
    return cached.promise
  }

  const promise = (async () => {
    let cats = await fetchActiveCategories()
    if (cats.length === 0) {
      await ensureDefaultCategories()
      cats = await fetchActiveCategories()
    }
    return cats
  })().catch((err: unknown) => {
    categoriesCache = null
    throw err
  })

  categoriesCache = { promise, at: Date.now() }
  return promise
}

export async function getActiveCategories(): Promise<Category[]> {
  return fetchActiveCategories()
}

export async function dedupeCategories(): Promise<void> {
  const snapshot = await getDocs(collection(db, 'categories'))
  const batch = writeBatch(db)
  const seen = new Set<string>()
  for (const docSnap of snapshot.docs) {
    const key = (docSnap.data() as Record<string, unknown>).key as string
    if (seen.has(key)) batch.delete(docSnap.ref)
    else seen.add(key)
  }
  await batch.commit()
  categoriesCache = null
}
