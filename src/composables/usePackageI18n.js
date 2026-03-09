/**
 * Helper para mostrar nombre, descripción e incluye de paquetes en el idioma actual.
 * Los paquetes estáticos (basico, desayuno, gold, plus) tienen traducciones en i18n.
 */
import { useI18n } from 'vue-i18n'

const KNOWN_SLUGS = ['basico', 'desayuno', 'gold', 'plus']

export function usePackageI18n() {
  const { t, tm } = useI18n()

  function getPackageName(p) {
    if (!p) return ''
    return KNOWN_SLUGS.includes(p.slug) ? t(`packages.items.${p.slug}.name`) : (p.nombre || '')
  }

  function getPackageDesc(p) {
    if (!p) return ''
    return KNOWN_SLUGS.includes(p.slug) ? t(`packages.items.${p.slug}.description`) : (p.descripcion || '')
  }

  function getPackageIncluye(p) {
    if (!p) return []
    if (!KNOWN_SLUGS.includes(p.slug)) return p.incluye || []
    const arr = tm(`packages.items.${p.slug}.incluye`)
    return Array.isArray(arr) ? arr : (p.incluye || [])
  }

  return { getPackageName, getPackageDesc, getPackageIncluye }
}
