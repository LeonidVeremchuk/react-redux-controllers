function isOnlySelect (prop) {
  return prop === 'select*' || prop === '$' || prop === '$*'
}

export default function normalizeMappings (mappings) {
  let normalized = []

  // Flatten and remove trailing ".*"
  for (let i = 0; i < mappings.length; ++i) {
    if (typeof mappings[i] === 'string') {
      const splitPath = mappings[i].split('.').filter((e) => e.length > 0)
      let prop = splitPath[splitPath.length - 1]
      if (/^dispatch./.test(prop)) {
        prop = prop.substr('dispatch'.length, 1).toLowerCase() +
          prop.substr('dispatch'.length + 1)
      }

      normalized.push({
        path: splitPath[splitPath.length - 1] === '*'
          ? splitPath.slice(0, splitPath.length - 1) : splitPath,
        prop
      })
    } else {
      normalized = normalized.concat(Object.keys(mappings[i]).map((key) => ({
        path: key.split('.').filter((e, i, a) => e.length > 0 && (e !== '*' || i !== a.length - 1)),
        prop: mappings[i][key]
      })))
    }
  }

  // Extract "dispatch*"
  normalized = normalized.map((m) =>
      (m.path.length > 0 && m.path[m.path.length - 1] === 'dispatch*')
          ? Object.assign(m, {
            path: m.path.slice(0, m.path.length - 1),
            prop: m.prop === 'dispatch*' ? '*' : m.prop,
            dispatchAll: true
          }) : m)

  // Extract "select*"
  normalized = normalized.map((m) =>
      (m.path.length > 0 && (isOnlySelect(m.path[m.path.length - 1]))
          ? Object.assign(m, {
            path: m.path.slice(0, m.path.length - 1),
            prop: isOnlySelect(m.prop) ? '*' : m.prop,
            onlySelect: true
          }) : m))

  return normalized
}
